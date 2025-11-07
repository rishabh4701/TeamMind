import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

async function handleSignUp(formData: FormData) {
  "use server";

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const teamId = String(formData.get("teamId"));

  // Hash password before saving
  const hashed = await bcrypt.hash(password, 10);

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("User already exists");
  }

  // Create new user
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      teamId,
      name: email.split("@")[0],
    },
  });

  // After signup, redirect to /sign-in
  redirect("/sign-in");
}

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        action={handleSignUp}
        className="w-full max-w-sm p-6 bg-white border rounded-2xl shadow space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Create Account</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          required
        />

        <select name="teamId" className="w-full border p-2 rounded" required>
          <option value="">Select Team</option>
          <option value="A-Team">A-Team</option>
          <option value="B-Team">B-Team</option>
          <option value="C-Team">C-Team</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-2xl hover:bg-green-700 transition"
        >
          Sign Up
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-600 underline">
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}
