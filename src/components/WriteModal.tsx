import { useModalStore } from "../store/modalStore";
import { useTodoStore } from '../store/todoStore';
import Button from "./Button";
import {CloseIcon} from "../components/Icon"
import { useRef } from "react";

export default function WriteModal() {
  const { addTodo, content, setContent, title, setTitle, date, setDate } = useTodoStore();
  const { isOpen, closeModal } = useModalStore();
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // 오늘 날짜 구하기 (YYYY-MM-DD 형식)
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD 형식으로 변환
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("제목을 입력하세요!");
      return;
    }
  
    // 기본값 설정
    const finalDate = date.trim() ? date : getTodayDate();
    const finalContent = content.trim() ? content : "";
  
    // addTodo 실행 시 최신 데이터를 직접 전달
    addTodo(title, finalContent, finalDate);
  
    // 입력 필드 초기화
    setTitle("");
    setContent("");
    setDate("");
    closeModal();
  };
  
  
  
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50">
      <div className="bg-white rounded-[10px] !p-[20px] shadow-lg w-[450px]">
        {/* 헤더 */}
        <div className="flex justify-between items-center border-b !pb-[8px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[16px] font-medium outline-none"
            placeholder="제목 입력"
          />
          <Button 
             onClick={() => {
              setTitle("");  // 제목 초기화
              setContent(""); // 내용 초기화
              setDate(""); // 날짜 초기화
              closeModal();
            }}
            color="icon"><CloseIcon/></Button>
        </div>

        {/* 입력 폼 */}
        <div className="!mt-[15px]">
          <div className="relative flex items-center">
            <label className="!w-[45px] block text-[14px] text-gray-600 !mb-[5px]">
              시간
            </label>
            <div
              className="w-[130px] !px-[10px] !py-[6px] bg-gray-100 rounded-[6px] text-gray-700 cursor-pointer flex items-center justify-center"
              onClick={() => dateInputRef.current?.showPicker()}
            >
              {date ? date : "연도-월-일"}
            </div>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute !top-full !left-[40px] !mt-[-70px] w-[130px] bg-white border border-gray-300 rounded-[6px] !p-[6px] shadow-lg z-50 opacity-0"
            />
          </div>
          <div className="flex !mt-[15px]">
            {/* shrink-0 : flex때문에 크기가 자동 조절되어서 shrink-0 추가해서 고정 너비 적용 */}
            <label className="!w-[45px] shrink-0 block text-[14px] text-gray-900">내용</label> 
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[100px] !px-[10px] !py-[6px] bg-gray-100 rounded-[6px] text-gray-700 outline-none resize-none"
              placeholder="내용 추가"
            ></textarea>
          </div>
        </div>

        {/* 버튼 */}
        <div className="!mt-[20px] flex justify-end">
          <button
            className="!px-[15px] !py-[8px] bg-gray-200 text-gray-700 rounded-[6px] hover:bg-gray-300"
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
