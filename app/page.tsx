import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Home() { const s=await auth(); redirect(s?.user?"/dashboard":"/sign-in"); }
