import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Student = {
  id: string;
  name: string;
  nickname: string;
  quote: string;
  career: string;
  badge: string;
  emoji: string;
};

export type StudentInput = Omit<Student, "id">;

const studentsCol = collection(db, "students");

export async function listStudents(): Promise<Student[]> {
  const q = query(studentsCol, orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Omit<StudentInput, never>;
    return { id: d.id, ...data };
  });
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const ref = await addDoc(studentsCol, { ...input, createdAt: serverTimestamp() });
  return { id: ref.id, ...input };
}

export async function updateStudent(id: string, patch: Partial<StudentInput>) {
  const ref = doc(db, "students", id);
  await updateDoc(ref, patch);
}

export async function deleteStudent(id: string) {
  const ref = doc(db, "students", id);
  await deleteDoc(ref);
}

