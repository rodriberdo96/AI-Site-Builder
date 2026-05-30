-- Harden project ownership deletion and add metadata needed by the production builder.
ALTER TABLE "WebsiteProject" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WebsiteProject" ADD COLUMN "generationStatus" TEXT NOT NULL DEFAULT 'idle';

DROP INDEX IF EXISTS "WebsiteProject_userId_idx";
CREATE INDEX "WebsiteProject_userId_updatedAt_idx" ON "WebsiteProject"("userId", "updatedAt");
CREATE INDEX "WebsiteProject_isPublished_archived_idx" ON "WebsiteProject"("isPublished", "archived");
CREATE INDEX "Conversation_projectId_timestamp_idx" ON "Conversation"("projectId", "timestamp");
CREATE INDEX "Version_projectId_timestamp_idx" ON "Version"("projectId", "timestamp");

ALTER TABLE "WebsiteProject" DROP CONSTRAINT IF EXISTS "WebsiteProject_userId_fkey";
ALTER TABLE "WebsiteProject" ADD CONSTRAINT "WebsiteProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
