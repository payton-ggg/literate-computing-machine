import { PricingPage } from "@/modules/billing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing – Zernote",
};

export default function Page() {
  return <PricingPage />;
}
