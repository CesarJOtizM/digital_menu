-- Default public menu layout (list | cards) when no visitor preference is stored.

ALTER TABLE "Settings" ADD COLUMN "defaultMenuViewMode" TEXT NOT NULL DEFAULT 'list';
