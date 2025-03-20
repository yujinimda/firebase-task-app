import { useState } from "react";
import { useAuth } from "./useAuth";
import { FirebaseError } from "firebase/app";

const SignUp = ({ setIsSignUpOpen }: { setIsSignUpOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { login } = useAuth();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);


  const handleSubmit =  async (e: React.FormEvent) => {
    e.preventDefault();
    if(isSignUp) {
      await handleSignUp(e);
    } else {
      await handleLogin(e);
    }
  }


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const reg = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/

    if(!reg.test(password)) {
      alert("비밀번호는 영문과 숫자를 포함하여 8~25자리로 설정해주세요.");
      return;
    }
    
    try {
      await register(email, password);
      alert("회원가입 성공!");
      setEmail("");
      setPassword("");
    } catch (error) {
      if(error instanceof FirebaseError){
        if(error.message === "Firebase: Error (auth/email-already-in-use)."){
          alert("이미 사용중인 이메일 입니다.")
        } else {
          alert("회원가입 실패: " + error.message)
        }
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("로그인 성공!");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      alert("로그인 실패");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="relative bg-white rounded-[10px] !p-[30px] shadow-lg w-[450px]">
          <button className="absolute top-[15px] right-[15px] text-xl" onClick={() => setIsSignUpOpen(false)}>
          ✖
        </button>
          <h2 className="text-[18px] text-center">Todo List</h2>
            {/* 입력 폼 */}
            <div className="!mt-[10px]">
              <div className="relative flex items-center">
                  <form onSubmit={handleSubmit}>
                    <input className="!w-[100%] !p-[6px] bg-[#E8F0FE]" type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input className="!w-[100%] !p-[6px] !mt-[4px] bg-[#E8F0FE]" type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button className="rounded-lg font-medium transition text-[#333333] w-[100%] h-[40px] bg-white hover:bg-[#C2E3FE] ring-2 ring-gray-200 !mt-4" type="submit">{isSignUp? "회원가입" : "로그인" }</button>
                  </form>
              </div>
              <button
                className="text-[13px] !mt-4 block !mx-auto"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "계정이 있으신가요?" : "계정이 없으신가요?"}
              </button>
          </div>
      </div>
    </div>
   
  );
};

export default SignUp;