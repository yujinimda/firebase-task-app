import {create} from "zustand";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../src/lib/firebaseConfig";


interface AuthState {
  user: User | null; //firebase에서 제공하는 사용자 객체 타입
  loading: boolean;
  setUser: (user:User | null) => void;
  logout: () => Promise<void>;
}

// Zustand Store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));


//onAuthStateChanged => firebase 인증 상태 변화를 감지하는 함수
onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, loading: false });
});