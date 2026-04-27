import { cookies } from "next/headers";
import LandingPage from "@/modules/landing/pages/LandingPage";
import { ListResearchPage } from "@/modules/research";

export default async function Page() {
  const cookieStore = await cookies();
  
  const hasAuth = 
    cookieStore.has("access_token") || 
    cookieStore.has("token") || 
    cookieStore.has("session") ||
    cookieStore.has("auth_token");

  if (hasAuth) {
    return <ListResearchPage />;
  }

  return <LandingPage />;
}
