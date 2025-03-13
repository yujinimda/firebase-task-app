import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebaseConfig";

// Todo 타입 정의
export type Todo = {
  id?: number; // id에서 id? 로 수정 왜냐하면 원래 이거를 로컬에서는 날짜로 넣었는데 파이어베이스에서는 비어져있다가 처음 랜덤 생성되는 아이디가 들어갈꺼라서 
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

        const newTodo = {
          id="",
          title,
          content: content.trim() ? content : "\u00A0",
          completed: false,
          isImportant: false,
          date,
        };
      

        if(user) {
          const docRef = await addDoc(collection(db, "users", user.uid, "todos"), newTodo);
          set((state) => ({
            todos: [...state.todos, { ...newTodo, id: docRef.id }],
          }));
        } else {
          set((state) => ({
            todos: [
              ...state.todos,
              {
                id: Date.now(),
                title,
                content:content.trim() ? content: "\u00A0",
                completed: false,
                isImportant: false,
                date,
              },
            ],
          }));
        }
        
      },
      
      deleteTodo: async  (id) => {
        const user = auth.currentUser;
        if(user) {
          await deleteDoc(doc(db, "users", user.uid, "todos", id.toString()));
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

      endTodo: (id) => {
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
      },

      editTodo: (id, newTitle, newText, newDate) => {
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
      },

      allDeleteTodo: () =>
        set(() => ({
          todos: [],
          filteredTodos: [],
          isFiltered: false,
        })),

      importantToggle: (id) => {
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
      },
        
      showImportantTodos: () => {
        const { todos } = get();
        set({
          filteredTodos: todos.filter((todo) => todo.isImportant),
          isFiltered: true,
        });
      },

      showAllTodos: () => {
        set({
          filteredTodos: [],
          isFiltered: false,
        });
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


