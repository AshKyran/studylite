// components/NavbarServer.tsx
import { createClient } from "@/utils/supabase/server";
import Navbar from "./Navbar";

export default async function NavbarServer() {
  let isLoggedIn = false;

  try {
    // 1. Properly instantiate your Supabase server client
    const supabase = await createClient();
    
    // 2. Use getUser() instead of getSession() - it actively verifies the JWT
    const { data: { user } } = await supabase.auth.getUser();
    
    isLoggedIn = !!user;
  } catch (error) {
    console.error("Navbar Auth Check Failed:", error);
    isLoggedIn = false;
  }

  return <Navbar isLoggedIn={isLoggedIn} />;
}