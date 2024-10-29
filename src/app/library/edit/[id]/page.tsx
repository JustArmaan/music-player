"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getMusicById, updateMusicData } from "@/app/actions/actions";

export default function EditTrack() {
  const router = useRouter();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchTrack = async () => {
      const music = await getMusicById(Number(id));
      console.log(music, "music");
      if (music) {
        setTitle(music.title);
        setArtist(music.artist);
        setAlbum(music.album ?? "");
        setGenre(music.genre ?? "");
      }
      setLoading(false);
    };
    fetchTrack();
  }, [id]);

  const handleSave = async () => {
    const updates = { title, artist, album, genre };
    const response = await updateMusicData(Number(id), updates);
    if (response.success) {
      router.push("/library");
    } else {
      console.error("Error saving changes:", response.error);
      setError("Failed to save changes");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Track Details</h1>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Track Title"
        className="mb-4"
      />
      <Input
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
        className="mb-4"
      />
      <Input
        value={album}
        onChange={(e) => setAlbum(e.target.value)}
        placeholder="Album"
        className="mb-4"
      />
      <Input
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        placeholder="Genre"
        className="mb-4"
      />

      <div className="flex space-x-4">
        <Button onClick={handleSave}>Update Track</Button>
        <Button variant="outline" onClick={() => router.push("/library")}>
          Cancel
        </Button>
        {error && <p className="text-red-500 mb-4">{error}</p>}
      </div>
    </div>
  );
}
