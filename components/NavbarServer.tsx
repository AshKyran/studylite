import { cookies } from "next/headers";
import Navbar from "./Navbar";

export default async function NavbarServer() {
  // The Next 16 cookie check lives HERE, completely isolated from the layout.
  const cookieStore = await cookies();
  const token = cookieStore.get("studylite_session")?.value;
  const isLoggedIn = !!token;

  // We pass the result into your exact Client Component
  return <Navbar isLoggedIn={isLoggedIn} />;
}