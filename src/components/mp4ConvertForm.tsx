"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { createMusic } from "@/app/actions/actions";

export default function YouTubeUploadForm() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const clearStatusMessage = () => {
    setTimeout(() => {
      setStatusMessage("");
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!youtubeUrl || !title || !artist) {
      setStatusMessage("Please fill in all required fields...");
      clearStatusMessage();
      return;
    }

    setStatusMessage("Converting YouTube video...");
    setLoading(true);

    try {
      // Call your API to convert the YouTube video to MP3
      const conversionResponse = await fetch("/api/convert-to-mp3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtubeUrl }),
      });

      if (!conversionResponse.ok) {
        throw new Error("Failed to convert YouTube video.");
      }

      const { mp3Url, trackId } = await conversionResponse.json();

      await createMusic({
        title,
        artist,
        album,
        genre,
        trackId,
      });

      setYoutubeUrl("");
      setTitle("");
      setArtist("");
      setAlbum("");
      setGenre("");
      setStatusMessage("YouTube video converted and uploaded successfully!");
    } catch (error) {
      console.error(error);
      setStatusMessage("An error occurred during the upload process.");
    } finally {
      setLoading(false);
      clearStatusMessage();
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload YouTube to MP3</h2>

      {statusMessage && (
        <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-4 rounded relative">
          {statusMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="YouTube URL"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          required
        />
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
        <Input
          placeholder="Album"
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
        />
        <Input
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Convert and Upload"}
        </Button>
      </form>
    </div>
  );
}
