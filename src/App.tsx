import WriteModal from "../src/components/todolist/WriteModal";
import "./styles/styles.css"
import List from '../src/components/todolist/List';
import Sidebar from '../src/components/todolist/Sidebar';


function App() {

  return (
    <>
      <div className="flex min-h-screen bg-[#f1f1f1]">
        {/* 사이드 바 */}
        <Sidebar/>
        {/* 리스트 */}
        <List/>
      </div>
      <WriteModal />
    </>
  );
}

export default App;
