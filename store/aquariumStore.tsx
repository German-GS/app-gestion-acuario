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
          const paramsToFetch = ["kh", "ca", "no3", "po4", "mg"];

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
              // Corrección 1: Tipar la clave del objeto
              latestParameters[paramKey as keyof LatestParameters] =
                paramSnapshot.docs[0].data().value;
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
  // Corrección 2: Tipar los parámetros de la acción
  removeAquarium: (aquariumId: string) => {
    set((state) => ({
      aquariums: state.aquariums.filter((aq) => aq.id !== aquariumId),
    }));
  },
}));
