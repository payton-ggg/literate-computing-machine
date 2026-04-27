import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import RegisterPage from "@/modules/auth/pages/RegisterPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register");
  return { title: t("title") };
}

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterRoute({ searchParams }: Props) {
  const { redirect } = await searchParams;

  return <RegisterPage redirectPath={redirect ?? null} />;
}
