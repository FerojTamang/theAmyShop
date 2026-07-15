import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export type StoreSettings = {
  footerDescription: string;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  logoUrl: string | null;
};

export type StoreSettingsPayload = {
  [Field in keyof StoreSettings]?: StoreSettings[Field] | null;
};

export const defaultStoreSettings: StoreSettings = {
  footerDescription: "Thoughtful gifts chosen to make meaningful moments feel a little more special.",
  instagramUrl: "https://www.instagram.com/the_amy_shop",
  tiktokUrl: null,
  logoUrl: null,
};

export const storeSettingsApi = {
  async getPublic() {
    const response = await apiClient.get<ApiResponse<{ settings: StoreSettings }>>("/api/store-settings");
    return response.data.data.settings;
  },
  async getAdmin() {
    const response = await apiClient.get<ApiResponse<{ settings: StoreSettings }>>("/api/admin/store-settings");
    return response.data.data.settings;
  },
  async updateAdmin(payload: StoreSettingsPayload) {
    const response = await apiClient.patch<ApiResponse<{ settings: StoreSettings }>>("/api/admin/store-settings", payload);
    return response.data.data.settings;
  },
};
