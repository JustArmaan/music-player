"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteTrack, getLibrary } from "../actions/actions";
import { useRouter } from "next/navigation";
import { Music } from "@/db/schema/music";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function Library() {
  const [musicData, setMusicData] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackToDelete, setTrackToDelete] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchMusicLibrary = async () => {
      const result = await getLibrary();

      if (result && result.success) {
        setMusicData(result.success.map((item: any) => item.music));
      } else {
        setError("Failed to fetch music data");
      }

      setLoading(false);
    };

    fetchMusicLibrary();
  }, []);

  const handleDelete = async () => {
    if (trackToDelete !== null) {
      const response = await deleteTrack(trackToDelete);
      if (response.success) {
        setMusicData((prevData) =>
          prevData.filter((song) => song.trackId !== trackToDelete)
        );
        setTrackToDelete(null);
      } else {
        console.error("Error deleting track:", response.failure);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Library</h1>
      {musicData.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500">No music found. Please upload music!</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => router.push("/")}
          >
            Upload Music
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {musicData.map((song) => (
            <Card
              key={song.id}
              className="p-4 border rounded-lg shadow-md w-80"
            >
              <h2 className="text-xl font-semibold">{song.title}</h2>
              <h3 className="text-gray-600">{song.artist}</h3>
              <p className="text-gray-700">{song.album || "No Album"}</p>
              <p className="text-gray-700">{song.genre || "No Genre"}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => router.push(`/player?trackId=${song.trackId}`)}
              >
                Play
              </Button>
              <Button
                variant="outline"
                className="mt-2 ml-2"
                onClick={() => router.push(`/library/edit/${song.id}`)}
              >
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="mt-2 ml-2"
                    onClick={() => setTrackToDelete(song.trackId)}
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the track "{song.title}"?
                    This action cannot be undone.
                  </AlertDialogDescription>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
