"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getTrackDataAndArtist,
  getAllTracksAndArtists,
} from "../actions/actions";
import { TrackDataWithArtist } from "../actions/actions";
import AudioPlayer from "@/components/AudioPlayer";

export default function Player() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackId = searchParams.get("trackId");

  const [trackData, setTrackData] = useState<
    TrackDataWithArtist | TrackDataWithArtist[] | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackData = async () => {
      if (trackId) {
        const result = await getTrackDataAndArtist(Number(trackId));
        setTrackData(result || null);
      } else {
        const allTracks = await getAllTracksAndArtists();
        setTrackData(allTracks || null);
      }
      setLoading(false);
    };
    fetchTrackData();
  }, [trackId]);

  if (loading) return <p>Loading...</p>;
  if (!trackData) return <p>No tracks found!</p>;
  return (
    <div className="p-6">
      {trackData ? (
        Array.isArray(trackData) && trackData.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">
              No music found. Please upload music!
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => router.push("/")}
            >
              Upload Music
            </Button>
          </div>
        ) : Array.isArray(trackData) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackData.map((track) => (
              <TrackCard key={track?.tracks.id} track={track} />
            ))}
          </div>
        ) : (
          <TrackCard track={trackData} />
        )
      ) : (
        <p>No tracks found!</p>
      )}
      <Button variant="outline" className="mt-6" onClick={() => router.back()}>
        Back to Library
      </Button>
    </div>
  );
}

function TrackCard({ track }: { track: TrackDataWithArtist }) {
  return (
    <Card className="p-8 border rounded-lg shadow-lg w-96">
      <h2 className="text-2xl font-semibold mb-2">{track?.music.title}</h2>
      <h3 className="text-xl text-gray-600 mb-4">{track?.music.artist}</h3>
      <p className="text-gray-700">{track?.music.album || "No Album"}</p>
      <p className="text-gray-700 mb-4">{track?.music.genre || "No Genre"}</p>

      <AudioPlayer audioSrc={track?.tracks.url || ""} />
    </Card>
  );
}
