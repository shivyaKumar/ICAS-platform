// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Always send users to the login page
  redirect("/login");
}
