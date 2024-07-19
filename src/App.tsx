import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="h-screen w-screen">
      <header className="fixed top-0 start-0 z-50 w-full p-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <h1 className="text-3xl font-bold ">Activity Tracker</h1>
      </header>
      <main className="flex items-center mx-auto pt-20">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
