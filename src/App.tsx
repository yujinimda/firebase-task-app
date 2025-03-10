import WriteModal from "./components/WriteModal";
import "./styles/styles.css"
import List from './components/List';
import Sidebar from './components/Sidebar';


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
