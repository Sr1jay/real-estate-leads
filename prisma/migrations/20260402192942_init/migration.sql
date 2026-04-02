-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "raw_message" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_contacted" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
