import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ForgotPasswordPage from "@/modules/auth/pages/ForgotPasswordPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.forgotPassword");
  return { title: t("title") };
}

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
