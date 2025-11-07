import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en"><body className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-6xl p-4 flex gap-4 items-center">
          <Link href="/dashboard" className="font-semibold">TeamMind</Link>
          {session?.user && (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/team">Team</Link>
              <form className="ml-auto" action={async()=>{"use server"; await signOut({ redirectTo: "/sign-in" });}}>
                <button className="border rounded-2xl px-3 py-1">Sign out</button>
              </form>
              <span className="text-sm border rounded px-2 py-0.5">{session.user.teamId}</span>
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
    </body></html>
  );
}
