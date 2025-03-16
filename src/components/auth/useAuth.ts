import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useAuthStore } from "../../store/authStore";
import { db } from "../../lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);

  // 회원가입
  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password); //회원가입이 완료되면 setUser(userCredential.user)를 호출

    //firestore에 유저 정보 저장 (문서 ID를 이메일로 설정)
    await setDoc(doc(db, "users",  userCredential.user.uid),{
      uid: userCredential.user.uid,
      email: userCredential.user.email
    })

    setUser(userCredential.user);
  };

 


  // 로그인
  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password); //로그인이 완료되면 setUser(userCredential.user)를 호출
    console.log("현재 로그인한 사용자:", auth.currentUser?.uid);
    
    setUser(userCredential.user);
  };

  return { register, login }; //이 훅을 호출하면 register, login 함수가 포함된 객체를 반환


};