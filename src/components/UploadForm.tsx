"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { createMusic, getSignedURL } from "@/app/actions/actions";

export default function UploadForm() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
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

    try {
      if (!file || !title || !artist) {
        setStatusMessage(
          "Please fill in all required fields and select a file."
        );
        clearStatusMessage();
        return;
      }

      setStatusMessage("Uploading File");
      setLoading(true);

      const computeSHA256 = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        return hashHex;
      };
      const checksum = await computeSHA256(file);

      const signedURLResult = await getSignedURL(
        file.type,
        file.size,
        checksum
      );
      if (signedURLResult.failure !== undefined) {
        throw new Error("Failed to get signed URL");
      }

      const { url, id } = signedURLResult.success;

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      await createMusic({
        title,
        artist,
        album,
        genre,
        trackId: id,
      });

      setTitle("");
      setArtist("");
      setAlbum("");
      setGenre("");
    } catch (e) {
      console.error(e);
      setStatusMessage("File upload failed.");
    } finally {
      setStatusMessage("File uploaded successfully!");
      setLoading(false);
      clearStatusMessage();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFile(file);

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    } else {
      setFileUrl(undefined);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Music</h2>

      {fileUrl && file && (
        <audio controls className="w-full mb-4">
          <source src={fileUrl} type={file.type} />
          Your browser does not support the audio element.
        </audio>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {statusMessage && (
          <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-4 rounded relative">
            {statusMessage}
          </p>
        )}
        <Input
          type="file"
          accept="audio/mp4, audio/mpeg, audio/wav, audio/ogg"
          onChange={handleChange}
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
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}
