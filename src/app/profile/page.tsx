"use client";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Profile from "@/components/profileComponenet";
import { redirect } from "next/navigation";
import { getUserData } from "../actions/actions";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfileActions() {
  const [user, setUser] = useState<({ id: string } & User) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (!userData) {
        redirect("/api/auth/signin?callbackUrl=/");
      } else {
        setUser(userData);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ redirectTo: "/" });
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-4">
      <Profile user={user} />
      <div className="mt-2">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          disabled={loading}
        >
          {loading ? "Signing Out..." : "Sign Out"}
        </button>
        <Button className="ml-14">
          <Link href={"profile/edit"}>Edit Profile</Link>
        </Button>
      </div>
    </div>
  );
}
