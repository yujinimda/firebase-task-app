import { useState } from 'react';
import { useTodoStore } from '../store/todoStore';
import { useModalStore } from '../store/modalStore';
import { AddIconBlack, AllTaskBlack, StarOutlineIcon, StarFilledIcon } from './Icon';
import Button from '../components/Button';

export default function Sidebar() {
  const { showImportantTodos, showAllTodos } = useTodoStore();
  const { openModal } = useModalStore();
  
  // 선택된 버튼 상태 관리
  const [selectedTab, setSelectedTab] = useState<'all' | 'important'>('all'); // 선택된 탭 저장

  const handleAllTasksClick = () => {
    setSelectedTab('all'); // 모든 할 일 선택
    showAllTodos();
  };

  const handleImportantClick = () => {
    setSelectedTab('important'); // 중요 선택
    showImportantTodos();
  };

  return (
    <aside className="w-[236px] flex-none bg-white !p-5 rounded-xl shadow-md">
      <h2 className="text-[24px ] text-gray-800 !mb-8">Todo List</h2>

      {/* 만들기 버튼 */}
      <Button onClick={openModal} color="white">
        <AddIconBlack />
        만들기
      </Button>

      <nav className="!mt-6">
        <ul className="space-y-2">
          {/* 모든 할 일 버튼 */}
          <li 
            className={`w-full flex items-center !gap-2 !p-2 rounded-full cursor-pointer 
              ${selectedTab === 'all' ? 'bg-[#a8c7fa] text-gray-800' : 'text-gray-700 hover:bg-gray-200'}
            `}
            onClick={handleAllTasksClick}
          >
            <AllTaskBlack />
            모든 할 일
          </li>

          {/* 중요 버튼 */}
          <li 
            className={`w-full flex items-center !mt-2 !gap-2 !p-2 rounded-full cursor-pointer 
              ${selectedTab === 'important' ? 'bg-[#a8c7fa] text-gray-800' : 'text-gray-700 hover:bg-gray-200'}
            `}
            onClick={handleImportantClick}
          >
            {selectedTab === 'important' ? <StarFilledIcon /> : <StarOutlineIcon />}
            중요
          </li>
        </ul>
      </nav>
    </aside>
  );
}
