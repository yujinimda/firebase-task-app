import { useState } from 'react';
import { useTodoStore } from '../../store/todoStore';
import { useModalStore } from '../../store/modalStore';
import { AddIconBlack, AllTaskBlack, StarOutlineIcon, StarFilledIcon } from './Icon';
import Button from './Button';
import SignUp from '../auth/Signup';
import Logout from '../../components/auth/Logout'
import { useAuth } from '../auth/useAuth';


export default function Sidebar() {
  const { user } = useAuth();
  const { showImportantTodos, showAllTodos } = useTodoStore();
  const { openModal } = useModalStore();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  
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
      <h2 className="text-[24px] text-gray-800">Todo List</h2>
      <div className='!ml-[2px] !mt-[4px] !mb-[30px] text-[14px]'>
        {user? (<Logout/>) :(<button onClick={() => setIsSignUpOpen((prev) => !prev)} >로그인/ 회원가입</button>)}
        
        
      </div>
      {/* 만들기 버튼 */}
      <Button onClick={openModal} color="white">
        <AddIconBlack />
        만들기
      </Button>
     
      {/* 로그인/회원가입 창을 열었을 때만 보이도록 설정 */}
      {isSignUpOpen && <SignUp setIsSignUpOpen={setIsSignUpOpen} />}
      <nav className="!mt-8">
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
