import { cookies } from "next/headers";
import Sidebar from "@/app/components/layout/SideBar";
import { UserType,UserRole } from "@/app/config/menu.config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies(); 
  
  const typeCookie = cookieStore.get("type");
  const rolCookie = cookieStore.get("rol");
  
  const userType = (typeCookie?.value as UserType) || "representante";
  const userRole = rolCookie?.value as UserRole || "profesor";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType={userType} userRole={userRole} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}