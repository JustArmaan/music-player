"use client";
import { useEffect, useState } from "react";

export default function Profile({
  user,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile flex flex-col items-center p-4 border rounded-lg shadow-lg">
      {user && (
        <>
          <img
            src={user.image || "https://www.gravatar.com/avatar/?d=mp"}
            alt={user.name || "user profile image"}
            className="w-32 h-32 rounded-full mb-4"
          />
          <h1 className="text-xl font-bold">{user.name || "Anonymous"}</h1>
          <p className="text-gray-600">{user.email || "No email provided"}</p>
        </>
      )}
    </div>
  );
}
