import { useEffect, useState } from "react";
import {
  defaultStoreSettings,
  storeSettingsApi,
  type StoreSettings,
} from "../services/storeSettingsApi";

let inFlightSettingsRequest: Promise<StoreSettings> | null = null;

const loadPublicStoreSettings = () => {
  if (!inFlightSettingsRequest) {
    inFlightSettingsRequest = storeSettingsApi
      .getPublic()
      .catch(() => defaultStoreSettings)
      .finally(() => {
        inFlightSettingsRequest = null;
      });
  }

  return inFlightSettingsRequest;
};

export function usePublicStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);

  useEffect(() => {
    let active = true;

    loadPublicStoreSettings().then((result) => {
      if (active) setSettings(result);
    });

    return () => {
      active = false;
    };
  }, []);

  return settings;
}
