import TodoItem from '../components/TodoItem';
import { useTodoStore } from '../store/todoStore';
import Button from './Button';
import {AddIconBlue} from "./Icon"

export default function List() {
  const { todos, isFiltered, filteredTodos, allDeleteTodo } = useTodoStore();

  // 현재 보여줄 리스트 결정 (isFiltered가 tr ue면 filteredTodos, 아니면 todos)
  const displayTodos = isFiltered ? filteredTodos : todos;

  // 완료되지 않은 항목
  const displayActiveTodos = displayTodos.filter((todo) => !todo.completed);

  // 완료된 항목
  const displayCompletedTodos = displayTodos.filter((todo) => todo.completed);

  return (
    <div className="w-full flex justify-center items-center !p-4">
      <div className="w-full max-w-[640px] bg-white rounded-md !p-4 shadow-lg">
        <h2 className="text-lg font-semibold !mb-4">내 할 일 목록</h2>
        <Button onClick={allDeleteTodo} color='icon'><AddIconBlue/>전체 완료</Button>
        {/* 할 일 목록 */}
        <div className="pb-3 mb-3">
          <ul className="space-y-2">
            {displayActiveTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>

        {/* 완료된 항목 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 !mt-[20px]">완료 된 일</h3>
          <ul className="space-y-2">
            {displayCompletedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
