import type { ReactNode } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import ToastContainer from "@/components/feedback/ToastContainer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="bg-white">{children}</main>
      <ToastContainer />
    </>
  );
}
