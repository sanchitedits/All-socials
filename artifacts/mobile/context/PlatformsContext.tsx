import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Platform = {
  id: string;
  name: string;
  url: string;
};

const STORAGE_KEY = "@message_hub_platforms";

const DEFAULT_PLATFORMS: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/direct/inbox/",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://www.linkedin.com/messaging/",
  },
  {
    id: "x",
    name: "X",
    url: "https://twitter.com/messages/",
  },
];

type PlatformsContextType = {
  platforms: Platform[];
  loading: boolean;
  addPlatform: (name: string, url: string) => Promise<void>;
  removePlatform: (id: string) => Promise<void>;
};

const PlatformsContext = createContext<PlatformsContextType | null>(null);

export function PlatformsProvider({ children }: { children: React.ReactNode }) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPlatforms(JSON.parse(stored));
      } else {
        setPlatforms(DEFAULT_PLATFORMS);
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEFAULT_PLATFORMS)
        );
      }
    } catch (error) {
      console.error("Failed to load platforms:", error);
      setPlatforms(DEFAULT_PLATFORMS);
    } finally {
      setLoading(false);
    }
  };

  const savePlatforms = async (updated: Platform[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPlatforms(updated);
  };

  const addPlatform = useCallback(
    async (name: string, url: string) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newPlatform: Platform = { id, name: name.trim(), url: url.trim() };
      const updated = [...platforms, newPlatform];
      await savePlatforms(updated);
    },
    [platforms]
  );

  const removePlatform = useCallback(
    async (id: string) => {
      const updated = platforms.filter((p) => p.id !== id);
      await savePlatforms(updated);
    },
    [platforms]
  );

  return (
    <PlatformsContext.Provider
      value={{ platforms, loading, addPlatform, removePlatform }}
    >
      {children}
    </PlatformsContext.Provider>
  );
}

export function usePlatforms() {
  const ctx = useContext(PlatformsContext);
  if (!ctx) throw new Error("usePlatforms must be used within PlatformsProvider");
  return ctx;
}
