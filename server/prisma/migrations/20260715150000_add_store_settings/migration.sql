CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL,
    "footerDescription" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
