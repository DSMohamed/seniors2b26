import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  desc: string;
};

export type ChaosItem = {
  id: string;
  quote: string;
  source: string;
};

export type LetterItem = {
  id: string;
  from: string;
  body: string;
};

export async function listTimeline(): Promise<TimelineItem[]> {
  const q = query(collection(db, "timeline"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TimelineItem, "id">) }));
}

export async function listChaos(): Promise<ChaosItem[]> {
  const q = query(collection(db, "chaos"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChaosItem, "id">) }));
}

export async function listLetters(): Promise<LetterItem[]> {
  const q = query(collection(db, "letters"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LetterItem, "id">) }));
}

