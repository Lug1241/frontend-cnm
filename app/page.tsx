import Login from "@/app/components/auth/Login";
import Footer from "@/app/components/layout/Footer";

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center justify-center w-full flex-1">
        <Login />
      </main>
      
      {/* El Footer ahora es exclusivo de esta vista */}
      <Footer />
    </>
  );
}