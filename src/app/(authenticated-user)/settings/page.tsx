import { SettingsPage } from "@/modules/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings – Zernote",
};

export default function Page() {
  return <SettingsPage />;
}
