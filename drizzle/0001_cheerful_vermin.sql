ALTER TABLE "music" ADD COLUMN "track_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "music" ADD CONSTRAINT "music_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
