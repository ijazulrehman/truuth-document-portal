-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('AUSTRALIAN_PASSPORT', 'AUSTRALIAN_DRIVERS_LICENCE', 'RESUME');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PROCESSING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "document_verify_id" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PROCESSING',
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "verification_result" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "document_submissions_user_id_idx" ON "document_submissions"("user_id");

-- CreateIndex
CREATE INDEX "document_submissions_status_idx" ON "document_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "document_submissions_user_id_document_type_key" ON "document_submissions"("user_id", "document_type");

-- AddForeignKey
ALTER TABLE "document_submissions" ADD CONSTRAINT "document_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
