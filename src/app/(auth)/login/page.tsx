import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import LoginPage from "@/modules/auth/pages/LoginPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginRoute({ searchParams }: Props) {
  const { redirect } = await searchParams;

  return <LoginPage redirectPath={redirect ?? null} />;
}
