import { BillingPage } from "@/modules/billing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing – Zernote",
};

export default function Page() {
  return <BillingPage />;
}
