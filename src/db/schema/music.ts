import {
  timestamp,
  pgTable,
  text,
  serial,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { tracks } from "./tracks";

export const mediaType = pgEnum("media_type", ["audio", "video", "image"]);

export const music = pgTable("music", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  genre: text("genre"),
  trackId: integer("track_id")
    .notNull()
    .references(() => tracks.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Music = typeof music.$inferSelect;
export type MusicInsert = typeof music.$inferInsert;