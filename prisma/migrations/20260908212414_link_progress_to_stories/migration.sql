-- Reading progress used to store a story id with nothing to point at, so a
-- row could outlive the story it belonged to. Remove any such row before the
-- key is added: the story it referred to no longer exists, and the reader has
-- nothing left to resume.
DELETE FROM "ReadingProgress"
WHERE "storyId" NOT IN (SELECT "id" FROM "Story");

-- AddForeignKey
ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
