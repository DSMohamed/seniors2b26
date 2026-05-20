import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type MemoryItem = {
  id: string;
  src: string;
  caption: string;
  tall: boolean;
};

export type ReelItem = {
  id: string;
  thumb: string;
  title: string;
  duration: string;
  videoUrl?: string;
};

export async function listMemories(): Promise<MemoryItem[]> {
  const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Omit<MemoryItem, "id">;
    return { id: d.id, ...data };
  });
}

export async function listReels(): Promise<ReelItem[]> {
  const q = query(collection(db, "reels"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Omit<ReelItem, "id">;
    return { id: d.id, ...data };
  });
}

