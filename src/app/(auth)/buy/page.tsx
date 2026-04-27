import { BuyPage } from "@/modules/billing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Tokens – Zernote",
};

export default function Page() {
  return <BuyPage />;
}
