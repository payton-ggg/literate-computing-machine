import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordPage } from "@/modules/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.resetPassword");
  return { title: t("title") };
}

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordRoute({ searchParams }: Props) {
  const { token } = await searchParams;

  // Guard: if no token in query, redirect to login (mirrors Vue's onMounted)
  if (!token) {
    redirect("/login");
  }

  return <ResetPasswordPage token={token} />;
}
