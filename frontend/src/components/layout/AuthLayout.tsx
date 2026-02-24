import { Outlet } from "react-router-dom";

/** Layout for login/register — no header, no footer. */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-vg-bg flex flex-col">
      <main className="flex-1 flex items-center justify-center py-8 px-4" role="main" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
