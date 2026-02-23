import { Outlet } from "react-router-dom";
import { LandingHeader } from "./LandingHeader";
import Footer from "./Footer";

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-vg-bg flex flex-col">
      <a href="#main-content" className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-vg-accent focus:text-white focus:rounded-lg focus:outline-none">
        Перейти к основному содержимому
      </a>
      <LandingHeader />
      <main id="main-content" className="flex-1 relative z-10" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
