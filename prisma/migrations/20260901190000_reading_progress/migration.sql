CREATE TABLE "ReadingProgress" (
  "userId" TEXT NOT NULL,
  "storyId" TEXT NOT NULL,
  "chapter" INTEGER NOT NULL,
  "paragraph" INTEGER NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("userId", "storyId"),
  CONSTRAINT "ReadingProgress_position_check" CHECK ("chapter" > 0 AND "paragraph" >= 0),
  CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
