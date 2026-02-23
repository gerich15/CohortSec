import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import OnboardingTour from "../OnboardingTour";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-vg-bg flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <OnboardingTour run={location.pathname === "/app"} />
    </div>
  );
}
