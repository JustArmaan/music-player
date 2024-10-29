"use server";
import { auth } from "@/auth";
import { db, eq, and } from "@/db";
import { Music, music } from "@/db/schema/music";
import { tracks } from "@/db/schema/tracks";
import { users } from "@/db/schema/users";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

export async function getUserData() {
  const session = await auth();

  return session?.user;
}

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET!,
  },
});

const acceptedMusicTypes = [
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];

const maxFileSize = 1024 * 1024 * 10;

type SignedURLResponse = Promise<
  | { failure?: undefined; success: { url: string; id: number } }
  | { failure: string; success?: undefined }
>;

export async function getSignedURL(
  type: string,
  size: number,
  checksum: string
): SignedURLResponse {
  const session = await auth();
  if (!session) {
    return { failure: "not authenticated" };
  }

  if (!acceptedMusicTypes.includes(type)) {
    return { failure: "Invalid file type" };
  }

  if (size > maxFileSize) {
    return { failure: "File is too large" };
  }

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: generateFileName(),
    ContentType: type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: session.user.id,
    },
  });

  const signedURL = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 60,
  });

  const results = await db
    .insert(tracks)
    .values({
      userId: session.user.id,
      url: signedURL.split("?")[0],
    })
    .returning({ id: tracks.id })
    .then((res) => res[0]);

  console.log(results);
  return { success: { url: signedURL, id: results.id } };
}
type CreateMusicArgs = {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  trackId: number;
};

export async function createMusic({
  title,
  artist,
  album,
  genre,
  trackId,
}: CreateMusicArgs) {
  const session = await auth();
  if (!session) {
    return { failure: "not authenticated" };
  }

  if (trackId) {
    const trackItem = await db
      .select()
      .from(tracks)
      .where(and(eq(tracks.id, trackId), eq(tracks.userId, session.user.id)))
      .then((res) => res[0]);

    if (!trackItem) {
      console.error("Track not found");
      return { failure: "Track not found" };
    }
  }
  const results = await db
    .insert(music)
    .values({
      title,
      artist,
      album,
      genre,
      trackId,
    })
    .returning()
    .then((res) => res[0]);

  return { success: { id: results.id } };
}

export async function getLibrary() {
  const session = await auth();
  if (!session) {
    return;
  }
  const results = await db
    .select()
    .from(music)
    .innerJoin(tracks, eq(music.trackId, tracks.id))
    .where(eq(tracks.userId, session.user.id));

  return { success: results };
}

export async function updateProfile({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string;
}) {
  const session = await auth();
  if (!session) {
    return { failure: "not authenticated" };
  }

  const results = await db
    .update(users)
    .set({
      name,
      email,
      image,
    })
    .where(eq(users.id, session.user.id))
    .returning()
    .then((res) => res[0]);

  return { success: { id: results.id } };
}

export async function getTrackDataAndArtist(trackId: number) {
  const session = await auth();
  if (!session) {
    return;
  }
  if (!session.user) {
    return;
  }
  const results = await db
    .select()
    .from(tracks)
    .where(and(eq(tracks.id, trackId), eq(tracks.userId, session.user.id)))
    .innerJoin(music, eq(music.trackId, tracks.id))
    .then((res) => res[0]);

  return results;
}

export async function getAllTracksAndArtists() {
  const session = await auth();
  if (!session) {
    return;
  }
  if (!session.user) {
    return;
  }
  const results = await db
    .select()
    .from(tracks)
    .where(eq(tracks.userId, session.user.id))
    .innerJoin(music, eq(music.trackId, tracks.id));

  return results;
}

export async function deleteTrack(trackId: number) {
  const session = await auth();
  if (!session) {
    return { failure: "not authenticated" };
  }
  if (!session.user) {
    return { failure: "not authenticated" };
  }
  const results = await db
    .select()
    .from(tracks)
    .where(and(eq(tracks.id, trackId), eq(tracks.userId, session.user.id)))
    .then((res) => res[0]);

  if (!results) {
    return { failure: "Track not found" };
  }

  await db.delete(music).where(eq(music.trackId, trackId));
  await db.delete(tracks).where(eq(tracks.id, trackId));

  // delete from s3
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: results.url.split("/").pop(),
  });

  await s3.send(deleteObjectCommand);

  return { success: results };
}

// export async function getTrackIds() {
//   const session = await auth();
//   if (!session) {
//     throw new Error("not authenticated");
//   }
//   const trackIds = await db
//     .select()
//     .from(tracks)
//     .where(eq(tracks.userId, session.user.id))
//     .then((res) => res.map((track) => track.id));

//   return trackIds;
// }

export async function updateMusicData(
  musicId: number,
  updates: Partial<Music>
) {
  try {
    const results = db
      .update(music)
      .set(updates)
      .where(and(eq(music.id, musicId)))
      .returning()
      .then((res) => res[0]);

    return { success: "Successfully Updated" };
  } catch (error) {
    console.error("Error updating music data:", error);
    return { success: false, error: "Failed to update music data" };
  }
}

export async function getMusicById(musicId: number) {
  try {
    const session = await auth();
    if (!session) {
      return null;
    }

    const result = await db
      .select({
        id: music.id,
        title: music.title,
        artist: music.artist,
        album: music.album,
        genre: music.genre,
        trackId: music.trackId,
        createdAt: music.createdAt,
      })
      .from(music)
      .innerJoin(tracks, eq(music.trackId, tracks.id))
      .where(and(eq(music.id, musicId), eq(tracks.userId, session.user.id)))
      .then((res) => res[0]);

    return result;
  } catch (error) {
    console.error("Error fetching track by ID:", error);
    return null;
  }
}

// Bro this has to be awaited. omg
export type TrackDataWithArtist = Awaited<
  ReturnType<typeof getTrackDataAndArtist>
>;
