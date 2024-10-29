import { timestamp, pgTable, text, serial, pgEnum } from "drizzle-orm/pg-core";

import { users } from "./users";

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Track = typeof tracks.$inferSelect;
export type TrackInsert = typeof tracks.$inferInsert;