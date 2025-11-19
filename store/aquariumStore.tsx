import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { PARAMETERS } from "../components/AddParameterModal";
import { auth, db } from "../firebaseConfig";

// Definimos los tipos que usaremos en el store
type LatestParameters = { [key in keyof typeof PARAMETERS]?: number };

interface Aquarium {
  id: string;
  name: string;
  volume: number;
  mainType: "freshwater" | "marine";
  subType: string;
  latestParameters?: LatestParameters;
}

interface AquariumState {
  aquariums: Aquarium[];
  isLoading: boolean;
  fetchAquariums: () => Promise<void>;
  removeAquarium: (aquariumId: string) => void;
}

export const useAquariumStore = create<AquariumState>((set) => ({
  aquariums: [],
  isLoading: true,
  fetchAquariums: async () => {
    set({ isLoading: true });
    const currentUser = auth.currentUser;
    if (!currentUser) {
      set({ aquariums: [], isLoading: false });
      return;
    }

    try {
      const q = query(
        collection(db, "aquariums"),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const userAquariumsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Aquarium[];

      const aquariumsWithParams = await Promise.all(
        userAquariumsData.map(async (aquarium) => {
          const latestParameters: LatestParameters = {};

          // 🔵 Parámetros principales para acuarios marinos
          const marineParams = [
            "kh",
            "ca",
            "mg",
            "no3",
            "po4",
            "salinity",
            "temp",
            "ph",
            "ammonia",
            "nitrite",
            "k",
            "strontium",
            "iodine",
          ] as const;

          // 🟢 Parámetros principales para acuarios de agua dulce
          const freshwaterParams = [
            "ph",
            "gh",
            "kh",
            "no3",
            "po4",
            "ammonia",
            "nitrite",
            "iron",
            "temp",
            "tds",
          ] as const;

          const paramsToFetch =
            aquarium.mainType === "marine" ? marineParams : freshwaterParams;

          for (const paramKey of paramsToFetch) {
            const paramsRef = collection(
              db,
              "aquariums",
              aquarium.id,
              "parameters"
            );

            const paramQuery = query(
              paramsRef,
              where("type", "==", paramKey),
              where("userId", "==", currentUser.uid),
              orderBy("timestamp", "desc"),
              limit(1)
            );

            const paramSnapshot = await getDocs(paramQuery);

            if (!paramSnapshot.empty) {
              const value = paramSnapshot.docs[0].data().value;
              // Guardamos el último valor de ese tipo
              latestParameters[paramKey as keyof LatestParameters] = value;
            }
          }

          return { ...aquarium, latestParameters };
        })
      );

      set({ aquariums: aquariumsWithParams, isLoading: false });
    } catch (error) {
      console.error("Error al cargar acuarios:", error);
      set({ isLoading: false });
    }
  },

  removeAquarium: (aquariumId: string) => {
    set((state) => ({
      aquariums: state.aquariums.filter((aq) => aq.id !== aquariumId),
    }));
  },
}));
