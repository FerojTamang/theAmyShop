import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database.js", async () => {
  const { prismaMock } = await import("../helpers/prismaMock.js");
  return { prisma: prismaMock };
});

import {
  DEFAULT_STORE_SETTINGS,
  STORE_SETTINGS_ID,
  getPublicStoreSettings,
  updateStoreSettings,
} from "../../src/modules/store-settings/storeSettings.service.js";
import { updateStoreSettingsSchema } from "../../src/modules/store-settings/storeSettings.validation.js";
import { prismaMock } from "../helpers/prismaMock.js";

describe("store settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns safe defaults when the singleton has not been created", async () => {
    prismaMock.storeSettings.findUnique.mockResolvedValue(null);

    await expect(getPublicStoreSettings()).resolves.toEqual(DEFAULT_STORE_SETTINGS);
    expect(prismaMock.storeSettings.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: STORE_SETTINGS_ID },
    }));
  });

  it("normalizes blanks and accepts only http or https URLs", () => {
    expect(updateStoreSettingsSchema.parse({
      footerDescription: "  A thoughtful footer.  ",
      instagramUrl: "",
      tiktokUrl: "https://www.tiktok.com/@the_amy_shop",
      logoUrl: null,
    })).toEqual({
      footerDescription: "A thoughtful footer.",
      instagramUrl: null,
      tiktokUrl: "https://www.tiktok.com/@the_amy_shop",
      logoUrl: null,
    });

    expect(() => updateStoreSettingsSchema.parse({ logoUrl: "javascript:alert(1)" })).toThrow();
    expect(() => updateStoreSettingsSchema.parse({ unknownField: "value" })).toThrow();
  });

  it("upserts only the storefront singleton and returns public fields", async () => {
    prismaMock.storeSettings.upsert.mockResolvedValue({
      footerDescription: "Handmade gifts for meaningful moments.",
      instagramUrl: "https://www.instagram.com/the_amy_shop",
      tiktokUrl: null,
      logoUrl: "https://res.cloudinary.com/example/image/upload/logo.png",
    });

    const result = await updateStoreSettings({
      footerDescription: "Handmade gifts for meaningful moments.",
      logoUrl: "https://res.cloudinary.com/example/image/upload/logo.png",
    });

    expect(prismaMock.storeSettings.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: STORE_SETTINGS_ID },
      create: expect.objectContaining({ id: STORE_SETTINGS_ID }),
    }));
    expect(result.logoUrl).toContain("res.cloudinary.com");
  });

  it("keeps deliberately cleared social links hidden", async () => {
    prismaMock.storeSettings.findUnique.mockResolvedValue({
      footerDescription: null,
      instagramUrl: null,
      tiktokUrl: null,
      logoUrl: null,
    });

    const result = await getPublicStoreSettings();
    expect(result.instagramUrl).toBeNull();
    expect(result.tiktokUrl).toBeNull();
    expect(result.footerDescription).toBe(DEFAULT_STORE_SETTINGS.footerDescription);
  });
});
