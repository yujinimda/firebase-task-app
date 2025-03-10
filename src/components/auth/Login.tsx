import { useState } from "react";
import { useAuth } from "./useAuth";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("로그인 성공!");
    } catch (error) {
      console.error(error);
      alert("로그인 실패");
    }
  };

  return (
    <div className="!mt-3 !mb-6">
      <form onSubmit={handleLogin}>
        <input className="!w-[100%] !p-[4px] bg-[#E8F0FE]" type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="!w-[100%] !p-[4px] !mt-[2px] bg-[#E8F0FE]" type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="rounded-lg font-medium transition text-[#333333] w-[80px] h-[40px] bg-white hover:bg-[#C2E3FE] ring-2 ring-gray-200 !mt-2" type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;