import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { collection, addDoc, getDoc, doc, deleteDoc, getDocs, setDoc, updateDoc, query, where } from "firebase/firestore";
import { db, auth } from "../lib/firebaseConfig";

// Todo 타입 정의
export type Todo = {
  id?: number | string; // id에서 id? 로 수정 왜냐하면 원래 이거를 로컬에서는 날짜로 넣었는데 파이어베이스에서는 비어져있다가 처음 랜덤 생성되는 아이디가 들어갈꺼라서 
  title: string;
  content: string;
  completed: boolean;
  isImportant: boolean;
  date: string;
};

// Zustand 스토어 타입
type TodoStore = {

  todos: Todo[]; // 원본 리스트
  filteredTodos: Todo[]; // 필터링된 리스트
  isFiltered: boolean; // 필터가 적용되었는지 여부
  
  title: string; // 제목
  setTitle: (content: string) => void;

  content: string; // 본문
  setContent: (content: string) => void;

  date: string; // 날짜 
  setDate: (date: string) => void;

  addTodo: (title: string, content: string, date: string) => void;  // 새 글 추가
  deleteTodo: (id: number) => void;
  allDeleteTodo: () => void;
  endTodo: (id: number) => void; // 완료 된 리스트
  editTodo: (id: number, newText: string, newTitle:string, date:string) => void;
  importantToggle: (id: number) => void; // 중요 체크 토글
  showImportantTodos: () => void; // 중요 항목만 보기
  showAllTodos: () => void; // 전체 보기

  isEditingId: number | null; 
  setEditingId: (id: number | null) => void; // 수정 모드 
};

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      filteredTodos: [],
      isFiltered: false,

      title: "",
      content: "",
      date: "",
      isEditingId: null,

      setTitle: (title) => set({ title }),
      setContent: (content) => set({ content }),
      setDate: (date) => set({ date }),
      setEditingId: (id) => set({ isEditingId: id }),


      // 비회원일때 로컬만 회원일땐 파이어베이스에서 가져오기
      fetchTodos: async () => {
        const user = auth.currentUser;
        if (user) {
          const querySnapshot = await getDocs(collection(db, "users", user.uid, "todos"));
          const todos = querySnapshot.docs.map((doc) => ({
            id: doc.id.toString(),
            ...(doc.data() as Todo), // doc.data()의 반환 타입이 unknown이여서 일단 Todo타입으로 캐스팅 
          })) as Todo[];

          set({ todos });
        }
      },

      addTodo: async (title, content, date) => {
        const user = auth.currentUser;
      
        // 비회원일 경우 로컬 저장 후 return
        if (!user) {
          set((state) => ({
            todos: [
              ...state.todos,
              {
                id: Date.now(), // 로컬 스토리지용 ID
                title,
                content: content.trim() ? content : "\u00A0",
                completed: false,
                isImportant: false,
                date,
              },
            ],
          }));
          return;
        }
      
        console.log("현재 로그인한 사용자 UID:", user.uid);
        console.log("Firestore에 저장할 컬렉션 경로:", `users/${user.uid}/todos`);
      
        // Firestore에서 현재 사용자의 uid 문서가 존재하는지 확인
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
      
        if (!userDocSnap.exists()) {
          console.error("현재 로그인한 사용자가 Firestore의 users 컬렉션에 존재하지 않습니다.");
          return; // Firestore에 없는 회원이면 함수 종료
        }
      
        // Firestore에 투두 추가
        const newTodo: Todo = {
          id: "", // Firestore 저장 후 docRef.id로 대체됨
          title,
          content: content.trim() ? content : "\u00A0",
          completed: false,
          isImportant: false,
          date,
        };
      
        try {
          const docRef = await addDoc(collection(db, "users", user.uid, "todos"), newTodo);
          console.log("Firestore에 저장된 문서 ID:", docRef.id);
  
          // Firestore에서 생성된 문서 ID를 Firestore 문서에도 업데이트
          await setDoc(doc(db, "users", user.uid, "todos", docRef.id), { ...newTodo, id: docRef.id });
  
          // 원래는 바로 아래 배열에 넣었다가 위로 뺐다 왜냐면 firebase문서가 생기기 전이기 때문이다. docRef.id 를 알수없어서
          // Firestore에서 생성된 문서 ID를 newTodo에 할당
          const newTodoWithId = { ...newTodo, id: docRef.id };
  
          // Firestore에서 생성된 문서 ID를 할당
          set((state) => ({
            todos: [...state.todos, newTodoWithId],
          }));
        } catch (error){
          console.error("Firestore에 데이터를 저장하는 중 오류 발생:", error);
        }
      },
      
      deleteTodo: async  (id) => {
        const user = auth.currentUser;

        if(user) {

          await deleteDoc(doc(db, "users", user.uid, "todos", id.toString()));
          console.log("Firestore에 저장된 문서 ID:", id.toString());

          set((state) => {
            const updatedTodos = state.todos.filter((todo) => todo.id !== id);
        
            return {
              todos: updatedTodos,
              filteredTodos: state.isFiltered
                ? updatedTodos.filter((todo) => todo.isImportant)
                : [],
            };
          });

        } else {
          set((state) => {
            const updatedTodos = state.todos.filter((todo) => todo.id !== id);
        
            return {
              todos: updatedTodos,
              filteredTodos: state.isFiltered
                ? updatedTodos.filter((todo) => todo.isImportant)
                : [],
            };
          });
        }
      },

      endTodo: async (id) => {
        const user = auth.currentUser;

        if(user) {

          try {

            const todoRef = doc(db, "users", user.uid, "todos", id.toString());

            // 현재 completed 상태 가져오기
            const todoSnap = await getDoc(todoRef);
            if (!todoSnap.exists()) {
              console.error("해당 Todo가 존재하지 않습니다.");
              return;
            }

            const currentCompleted = todoSnap.data().completed;
            await updateDoc(todoRef, { completed: !currentCompleted });

            console.log(`Firestore에서 Todo ${id}의 완료 상태를 ${!currentCompleted}로 변경`);
            
            set((state) => {
              const updatedTodos = state.todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
              );
    
              return {
                todos: updatedTodos,
                filteredTodos: state.isFiltered
                  ? updatedTodos.filter((todo) => todo.isImportant)
                  : [],
              };
            });
            
          } catch {
           console.log();
          }
        } else {
          set((state) => {
            const updatedTodos = state.todos.map((todo) =>
              todo.id === id ? { ...todo, completed: !todo.completed } : todo
            );
  
            return {
              todos: updatedTodos,
              filteredTodos: state.isFiltered
                ? updatedTodos.filter((todo) => todo.isImportant)
                : [],
            };
          });
        }
      },

      editTodo: async (id, newTitle, newText, newDate) => {
        const user = auth.currentUser;

        if(user) {

          try {

            const todoRef = doc(db, "users", user.uid, "todos", id.toString());

            // 현재 작성 상태 가져오기
            const todoSnap = await getDoc(todoRef);
            if (!todoSnap.exists()) {
              console.error("해당 Todo가 존재하지 않습니다.");
              return;
            }

            //firestore에서 제목, 내용, 날짜 업데이트
            await updateDoc(todoRef, {
              title: newTitle,
              content: newText,
              date: newDate,
            });
            
            set((state) => {
              const updatedTodos = state.todos.map((todo) =>
                todo.id === id
                  ? { ...todo, title: newTitle, content: newText, date: newDate }
                  : todo
              );
          
              return {
                todos: updatedTodos,
                filteredTodos: state.isFiltered
                  ? updatedTodos.filter((todo) => todo.isImportant)
                  : [],
              };
            });
            
          } catch(error) {
            console.error("Firestore에 데이터를 저장하는 중 오류 발생:", error);
          }
        } else {
          set((state) => {
            const updatedTodos = state.todos.map((todo) =>
              todo.id === id
                ? { ...todo, title: newTitle, content: newText, date: newDate }
                : todo
            );
        
            return {
              todos: updatedTodos,
              filteredTodos: state.isFiltered
                ? updatedTodos.filter((todo) => todo.isImportant)
                : [],
            };
          });
        }
      },

      allDeleteTodo: async () => {
        const user = auth.currentUser;

        if(user) {

          try {

            const todosRef = collection(db, "users", user.uid, "todos");
            const querySnapshot = await getDocs(todosRef); //반환되는 객체

            // firestore에서 모든 Todo 문서 삭제
            const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            set(() => ({
              todos: [],
              filteredTodos: [],
              isFiltered: false,
            }))
            
          } catch (error){
            console.error("Firestore에 데이터를 저장하는 중 오류 발생:", error);
          }
        } else {
          set(() => ({
            todos: [],
            filteredTodos: [],
            isFiltered: false,
          }))
        }
      },

      importantToggle: async (id) => {
        const user = auth.currentUser;

        if(user) {

          try {

            const todoRef = doc(db, "users", user.uid, "todos", id.toString());

            // 현재 isImportant 상태 가져오기
            const todoSnap = await getDoc(todoRef);
            if (!todoSnap.exists()) {
              console.error("해당 Todo가 존재하지 않습니다.");
              return;
            }

            const currentIsImportant = todoSnap.data().isImportant;
            await updateDoc(todoRef, { isImportant: !currentIsImportant });
            
            set((state) => {
              const updatedTodos = state.todos.map((todo) =>
                todo.id === id ? { ...todo, isImportant: !todo.isImportant } : todo
              );
          
              // 필터 적용 여부에 따라 중요 리스트 업데이트
              return {
                todos: updatedTodos,
                filteredTodos: state.isFiltered
                  ? updatedTodos.filter((todo) => todo.isImportant)
                  : [],
              };
            });
          } catch (error){
            console.error("Firestore에 데이터를 저장하는 중 오류 발생:", error);
          }
        } else {
          set((state) => {
            const updatedTodos = state.todos.map((todo) =>
              todo.id === id ? { ...todo, isImportant: !todo.isImportant } : todo
            );
        
            // 필터 적용 여부에 따라 중요 리스트 업데이트
            return {
              todos: updatedTodos,
              filteredTodos: state.isFiltered
                ? updatedTodos.filter((todo) => todo.isImportant)
                : [],
            };
          });
        }
      },
        
      showImportantTodos: async () => {
        const user = auth.currentUser;
        

        if(user){
          try {
            const todosRef = collection(db, "users", user.uid, "todos");
            //중요한 투두만 가져오기
            const q = query(todosRef, where("isImportant", "==", true))
            const querySnapshot = await getDocs(q);

            const importantTodos: Todo[] = querySnapshot.docs.map((doc) => {
              const data = doc.data() as Todo;
      
              return {
                id: doc.id,
                title: data.title || "",
                content: data.content || "",
                completed: data.completed || false,
                isImportant: data.isImportant || false,
                date: data.date || "",
              };
            });

            set({
              filteredTodos: importantTodos,
              isFiltered: true,
            });
            
          } catch(error) {
            console.error("Firestore에 데이터를 저장하는 중 오류 발생:", error);
          }
        } else {
          const { todos } = get();

          set({
            filteredTodos: todos.filter((todo) => todo.isImportant),
            isFiltered: true,
          });
        }
      },

      showAllTodos: async () => {
        const user = auth.currentUser;
        if(user){
          try {
            const todosRef = collection(db, "users", user.uid, "todos");
            const querySnapshot = await getDocs(todosRef);

            const allTodos: Todo[] = querySnapshot.docs.map((doc) => {
              const data = doc.data() as Todo;
      
              return {
                id: doc.id,
                title: data.title || "",
                content: data.content || "",
                completed: data.completed || false,
                isImportant: data.isImportant || false,
                date: data.date || "",
              };
            });

            set({
              filteredTodos: allTodos,
              isFiltered: true,
            });
            
          } catch(error) {
            console.error("Firestore에 데이터를 저장하는 중 오류 발생:", error);
          }
        } else {
          set({
            filteredTodos: [],
            isFiltered: false,
          });
        }
      },
    }),
    {
      name: "todo-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

//////////////////////////////////////////////////////////////////
// export const useTodoStore = create<TodoStore>()(
//   persist(
//     (set, get) => ({
//       todos: [],
//       filteredTodos: [],
//       isFiltered: false,

//       title: "",
//       content: "",
//       date: "",
//       isEditingId: null,

//       setTitle: (title) => set({ title }),
//       setContent: (content) => set({ content }),
//       setDate: (date) => set({ date }),
//       setEditingId: (id) => set({ isEditingId: id }),

//       addTodo: (title, content, date) => {
//         set((state) => ({
//           todos: [
//             ...state.todos,
//             {
//               id: Date.now(),
//               title,
//               content:content.trim() ? content: "\u00A0",
//               completed: false,
//               isImportant: false,
//               date,
//             },
//           ],
//         }));
//       },
      
//       deleteTodo: (id) => {
//         set((state) => {
//           const updatedTodos = state.todos.filter((todo) => todo.id !== id);
      
//           return {
//             todos: updatedTodos,
//             filteredTodos: state.isFiltered
//               ? updatedTodos.filter((todo) => todo.isImportant)
//               : [],
//           };
//         });
//       },

//       endTodo: (id) => {
//         set((state) => {
//           const updatedTodos = state.todos.map((todo) =>
//             todo.id === id ? { ...todo, completed: !todo.completed } : todo
//           );

//           return {
//             todos: updatedTodos,
//             filteredTodos: state.isFiltered
//               ? updatedTodos.filter((todo) => todo.isImportant)
//               : [],
//           };
//         });
//       },

//       editTodo: (id, newTitle, newText, newDate) => {
//         set((state) => {
//           const updatedTodos = state.todos.map((todo) =>
//             todo.id === id
//               ? { ...todo, title: newTitle, content: newText, date: newDate }
//               : todo
//           );
      
//           return {
//             todos: updatedTodos,
//             filteredTodos: state.isFiltered
//               ? updatedTodos.filter((todo) => todo.isImportant)
//               : [],
//           };
//         });
//       },

//       allDeleteTodo: () =>
//         set(() => ({
//           todos: [],
//           filteredTodos: [],
//           isFiltered: false,
//         })),

//       importantToggle: (id) => {
//         set((state) => {
//           const updatedTodos = state.todos.map((todo) =>
//             todo.id === id ? { ...todo, isImportant: !todo.isImportant } : todo
//           );
      
//           // 필터 적용 여부에 따라 중요 리스트 업데이트
//           return {
//             todos: updatedTodos,
//             filteredTodos: state.isFiltered
//               ? updatedTodos.filter((todo) => todo.isImportant)
//               : [],
//           };
//         });
//       },
        
//       showImportantTodos: () => {
//         const { todos } = get();
//         set({
//           filteredTodos: todos.filter((todo) => todo.isImportant),
//           isFiltered: true,
//         });
//       },

//       showAllTodos: () => {
//         set({
//           filteredTodos: [],
//           isFiltered: false,
//         });
//       },
//     }),
//     {
//       name: "todo-storage",
//       storage: createJSONStorage(() => localStorage),
//     }
//   )
// );


