"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Button className="hover:text-neutral-700" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
