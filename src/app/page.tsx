import UploadForm from "@/components/UploadForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  console.log(session);
  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Music Upload and Library</h1>
      <UploadForm />
    </div>
  );
}
