import { useState, useEffect } from "react";
import { useTodoStore, Todo } from "../store/todoStore";
import { StarFilledIcon, StarOutlineIcon, DeleteIcon, OnCheckIcon, OffCheckIcon} from "./Icon"
import Button from "./Button";

type TodoItemProps = {
  todo: Todo;
};

export default function TodoItem({ todo }: TodoItemProps) {
  const { endTodo, deleteTodo, importantToggle, isEditingId, setEditingId} = useTodoStore();
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editText, setEditText] = useState(todo.content);
  const [editDate, setEditDate] = useState(todo.date);
  const [editingField, setEditingField] = useState<"title" | "content" | "date" | null>(null); // 현재 수정 중인 필드 추가

  // todo가 변경될 때 최신 상태 유지
  useEffect(() => {
    setEditTitle(todo.title);
    setEditText(todo.content);
    setEditDate(todo.date); 
  }, [todo]);


  useEffect(() => {
    console.log(`중요 상태 변경됨: ${todo.isImportant}`); // 중요 상태 변경 확인
  }, [todo.isImportant]);

  // 최신 상태로 수정 적용
  const handleEdit = () => {
    if (editTitle.trim() && editText.trim() && editDate.trim()) {
      const store = useTodoStore.getState(); // Zustand에서 최신 상태 직접 가져오기
      store.editTodo(todo.id, editTitle, editText, editDate);
    }
    setEditingId(null);
    setEditingField(null);
  };

  return (
    <li 
      key={todo.id} 
      className="!my-2 flex items-center justify-between !p-[12px] hover:bg-[#f5f5f5] rounded-[8px]"
    >
      {/* 체크박스 */}
      <button onClick={() => endTodo(todo.id)} className="icon">
        {todo.completed ? <OnCheckIcon /> : <OffCheckIcon/>}
      </button>

      {/* 제목 */}
      <div className="flex-1 !ml-[12px]">
        {isEditingId === todo.id && editingField === "title" ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            onBlur={() => setTimeout(handleEdit, 100)}
            autoFocus
            className="w-full !p-[6px] rounded-[4px] !text-[14px]"
          />
        ) : (
          <strong 
          onClick={() => { setEditingId(todo.id); setEditingField("title"); }}
          className={`text-[16px] font-bold cursor-pointer ${todo.completed ? "line-through" : ""}`}
        >
          {todo.title}
        </strong>
        )}

        {/* 내용 */}
        {isEditingId === todo.id && editingField === "content" ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            onBlur={() => setTimeout(handleEdit, 100)}
            autoFocus
            className="w-full !mt-[6px] !p-[6px] border border-[#ccc] rounded-[4px] text-[14px]"
          />
        ) : (
          <span 
            onClick={() => { setEditingId(todo.id); setEditingField("content"); }}
            className="block text-[14px] text-gray-600 !mt-[4px] cursor-pointer"
          >
            {todo.content}
          </span>
        )}
        {/* 날짜 */}
        {isEditingId === todo.id && editingField === "date" ? (
          <input 
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            onBlur={() => setTimeout(handleEdit, 100)}
            autoFocus
            className="w-[120px]  !mt-[5px] !p-[6px] rounded-[4px] text-[13px]"
          />
        ) : (
          <span 
            onClick={() => { setEditingId(todo.id); setEditingField("date"); }}
            className="w-[94px] block !px-[6px] text-[13px] text-blue-500 !mt-[5px] cursor-pointer border rounded-full"
          >
            {todo.date}
          </span>
        )}
      </div>

      {/* 삭제 버튼 */}
      <div className="flex !w-[100px] gap-2 justify-end">
      <Button  onClick={() => deleteTodo(todo.id)}  color="icon"><DeleteIcon/></Button>
      {/* 중요 표시 버튼 */}
      <Button onClick={() => importantToggle(todo.id)} color="icon">{todo.isImportant ? <StarFilledIcon /> : <StarOutlineIcon />}</Button>
      </div>
    </li>

  );
}
