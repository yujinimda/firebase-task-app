import { useTodoStore } from "../../store/todoStore";
import { useAuthStore } from "../../store/authStore";

const LogoutButton = () => {
  const { user, logout } = useAuthStore();
  const logoutUser = useTodoStore((state) => state.logoutUser); 

  const handleLogout = async () => {
    await logoutUser(); // zustand + 파이어베이스 로그아웃 처리
    logout(); // zustand의 유저 상태 초기화
  };


  return (
    <div>
      {/* 로그인 확인 */}
      {user ? (
        <div>
          <p>환영합니다, {user?.email}!</p> 
          <button className="!mt-[10px]" onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <div>
        </div>
      )}
    </div>
  );
};

export default LogoutButton;
