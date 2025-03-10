import { create } from "zustand";

//열려있나 아닌가 확인, 여는 함수, 닫는 함수
type ModalStore =  {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen:false,
  openModal: () => set({isOpen: true}),
  closeModal: () => set({isOpen: false})
}));