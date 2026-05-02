import { cookies } from "next/headers";
import Navbar from "./Navbar";

export default async function NavbarServer() {
  let isLoggedIn = false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("studylite_session")?.value;
    isLoggedIn = !!token;
  } catch (error) {
    isLoggedIn = false;
  }

  // Pass the result strictly into the Client Component
  return <Navbar isLoggedIn={isLoggedIn} />;
}