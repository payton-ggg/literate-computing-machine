import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyEmailPage } from "@/modules/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.verify");
  return { title: t("title") };
}

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailRoute({ searchParams }: Props) {
  const { email } = await searchParams;

  // Guard: if no email in query, redirect to login (mirrors Vue's onMounted)
  if (!email) {
    redirect("/login");
  }

  return <VerifyEmailPage email={email} />;
}
