import { useState } from "react";
import { useAuth } from "./useAuth";

const SignUp = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
      alert("회원가입 성공!");
    } catch (error) {
      console.error(error);
      alert("회원가입 실패");
    }
  };

  return (
    <div className="!mt-3">
      <form onSubmit={handleSignUp}>
        <input className="!w-[100%] !p-[4px] bg-[#E8F0FE]" type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="!w-[100%] !p-[4px] !mt-[2px] bg-[#E8F0FE]" type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="rounded-lg font-medium transition text-[#333333] w-[80px] h-[40px] bg-white hover:bg-[#C2E3FE] ring-2 ring-gray-200 !mt-2" type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default SignUp;