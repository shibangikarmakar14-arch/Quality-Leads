import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen flex bg-[#08080b] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
