"use client";

import { useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioSrc: string;
}

export default function AudioPlayer({ audioSrc }: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime =
        (audioRef.current.duration * value[0]) / 100;
      setProgress(value[0]);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  return (
    <div>
      <audio
        ref={audioRef}
        controls
        className="w-full mt-4"
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={audioSrc} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <div className="w-full mt-4">
        <label className="text-gray-600">Track Progress</label>
        <Slider
          value={[progress]}
          onValueChange={handleProgressChange}
          max={100}
          className="w-full mt-2"
        />
      </div>
    </div>
  );
}
