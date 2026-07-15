import { prisma } from "../../config/database.js";
import type { PublicStoreSettings } from "./storeSettings.types.js";
import type { UpdateStoreSettingsInput } from "./storeSettings.validation.js";

export const STORE_SETTINGS_ID = "storefront";
export const DEFAULT_STORE_SETTINGS: PublicStoreSettings = {
  footerDescription:
    "Thoughtful gifts chosen to make meaningful moments feel a little more special.",
  instagramUrl: "https://www.instagram.com/the_amy_shop",
  tiktokUrl: null,
  logoUrl: null,
};

const publicSelect = {
  footerDescription: true,
  instagramUrl: true,
  tiktokUrl: true,
  logoUrl: true,
} as const;

const withDefaults = (settings: {
  footerDescription: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  logoUrl: string | null;
} | null): PublicStoreSettings => {
  if (!settings) return DEFAULT_STORE_SETTINGS;

  return {
    footerDescription: settings.footerDescription || DEFAULT_STORE_SETTINGS.footerDescription,
    instagramUrl: settings.instagramUrl,
    tiktokUrl: settings.tiktokUrl,
    logoUrl: settings.logoUrl,
  };
};

export const getPublicStoreSettings = async (): Promise<PublicStoreSettings> => {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: STORE_SETTINGS_ID },
    select: publicSelect,
  });

  return withDefaults(settings);
};

export const updateStoreSettings = async (
  input: UpdateStoreSettingsInput,
): Promise<PublicStoreSettings> => {
  const settings = await prisma.storeSettings.upsert({
    where: { id: STORE_SETTINGS_ID },
    create: { id: STORE_SETTINGS_ID, ...input },
    update: input,
    select: publicSelect,
  });

  return withDefaults(settings);
};
