import { Outlet } from "react-router-dom";
import StravaAuthButton from "./StravaAuthButton";

function App() {
  return (
    <div className="h-screen w-screen">
      <header className="fixed top-0 start-0 z-50 w-full border-b p-4 flex justify-between align-center border-gray-200 bg-gray-50">
        <h1 className="text-3xl font-bold ">Activity Tracker</h1>
        <StravaAuthButton />
      </header>
      <main className="flex items-center mx-auto pt-16">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
