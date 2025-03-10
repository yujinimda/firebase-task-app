type ButtonProps = {
  onClick: () => void;
  color?: "white" | "none" | "icon";
  children: React.ReactNode; // 텍스트 + 아이콘
};

export default function Button({ onClick, color = "white", children }: ButtonProps) {
  const baseStyle = "flex items-center justify-center gap-2 rounded-lg font-medium transition text-[#333333]"
  const colorStyle = { 
    white: "w-[119px] h-[57px] bg-white hover:bg-[#C2E3FE] ring-2 ring-gray-200",
    none:  "w-[140px]",
    icon:  "p-[4px]"
  }[color] || "";

  console.log("Button color:", color);

  return (
    <button className={`${baseStyle} ${colorStyle}`} onClick={onClick}>
      {children}
    </button>
  );
}