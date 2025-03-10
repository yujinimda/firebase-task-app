import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Todo 타입 정의
export type Todo = {
  id: number;
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

      addTodo: (title, content, date) => {
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
      },
      
      deleteTodo: (id) => {
        set((state) => {
          const updatedTodos = state.todos.filter((todo) => todo.id !== id);
      
          return {
            todos: updatedTodos,
            filteredTodos: state.isFiltered
              ? updatedTodos.filter((todo) => todo.isImportant)
              : [],
          };
        });
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

