import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { listStudents, type Student, type StudentInput } from "@/data/students";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { listMemories, listReels } from "@/data/media";
import { listChaos, listLetters, listTimeline } from "@/data/content";

const studentSchema = z.object({
  name: z.string().min(1),
  nickname: z.string().min(1),
  quote: z.string().min(1),
  career: z.string().min(1),
  badge: z.string().min(1),
  emoji: z.string().min(1),
  photo: z.string().url().or(z.literal("")),
  description: z.string(),
});
const memorySchema = z.object({
  src: z.string().url(),
  caption: z.string().min(1),
  tall: z.boolean(),
});
const reelSchema = z.object({
  thumb: z.string().url(),
  title: z.string().min(1),
  duration: z.string().min(1),
  videoUrl: z.string().url().or(z.literal("")),
});
const timelineSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1),
  desc: z.string().min(1),
});
const chaosSchema = z.object({
  quote: z.string().min(1),
  source: z.string().min(1),
});
const letterSchema = z.object({
  from: z.string().min(1),
  body: z.string().min(1),
});

export const Route = createFileRoute("/dev")({
  component: Dev,
});

const adminPasswordKey = "adminPassword";

async function readAdminError(res: Response): Promise<string> {
  const text = (await res.text()).trim();
  if (text) return text;
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("text/html")) {
    return "Admin API is not running. Deploy with: npm run deploy:worker (static Pages upload cannot run /api/admin/*).";
  }
  return `Request failed (${res.status} ${res.statusText})`;
}

function Dev() {
  const qc = useQueryClient();
  const studentsQuery = useQuery({ queryKey: ["students"], queryFn: listStudents });
  const memoriesQuery = useQuery({ queryKey: ["memories"], queryFn: listMemories });
  const reelsQuery = useQuery({ queryKey: ["reels"], queryFn: listReels });
  const timelineQuery = useQuery({ queryKey: ["timeline"], queryFn: listTimeline });
  const chaosQuery = useQuery({ queryKey: ["chaos"], queryFn: listChaos });
  const lettersQuery = useQuery({ queryKey: ["letters"], queryFn: listLetters });

  const [password, setPassword] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(adminPasswordKey) ?? "";
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const emptyStudentForm = {
    name: "",
    nickname: "",
    quote: "",
    career: "",
    badge: "",
    emoji: "",
    photo: "",
    description: "",
  } satisfies StudentInput;

  const createMutation = useMutation({
    mutationFn: async (input: StudentInput) => {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await readAdminError(res));
      const type = res.headers.get("content-type") ?? "";
      if (!type.includes("application/json")) {
        throw new Error(
          "Admin API is not running. Deploy with: npm run deploy:worker (static Pages upload cannot run /api/admin/*).",
        );
      }
      return (await res.json()) as { id?: string };
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/students?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error(await readAdminError(res));
      return (await res.json()) as { ok: boolean };
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      await qc.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: emptyStudentForm,
  });
  const memoryForm = useForm<z.infer<typeof memorySchema>>({
    resolver: zodResolver(memorySchema),
    defaultValues: { src: "", caption: "", tall: false },
  });
  const reelForm = useForm<z.infer<typeof reelSchema>>({
    resolver: zodResolver(reelSchema),
    defaultValues: { thumb: "", title: "", duration: "", videoUrl: "" },
  });
  const timelineForm = useForm<z.infer<typeof timelineSchema>>({
    resolver: zodResolver(timelineSchema),
    defaultValues: { date: "", title: "", desc: "" },
  });
  const chaosForm = useForm<z.infer<typeof chaosSchema>>({
    resolver: zodResolver(chaosSchema),
    defaultValues: { quote: "", source: "" },
  });
  const letterForm = useForm<z.infer<typeof letterSchema>>({
    resolver: zodResolver(letterSchema),
    defaultValues: { from: "", body: "" },
  });

  const callAdmin = async (url: string, method: "POST" | "PUT" | "DELETE", body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: {
        "content-type": "application/json",
        "x-admin-password": password,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await readAdminError(res));
    return res.json().catch(() => ({}));
  };

  const editStudentMutation = useMutation({
    mutationFn: async (input: StudentInput & { id: string }) =>
      callAdmin("/api/admin/students", "PUT", input),
    onSuccess: async () => {
      setEditingId(null);
      form.reset(emptyStudentForm);
      await qc.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const createMemoryMutation = useMutation({
    mutationFn: async (input: z.infer<typeof memorySchema>) => {
      const res = await fetch("/api/admin/memories", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-password": password },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await readAdminError(res));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["memories"] });
    },
  });
  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/memories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error(await readAdminError(res));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["memories"] });
    },
  });
  const createReelMutation = useMutation({
    mutationFn: async (input: z.infer<typeof reelSchema>) => {
      const res = await fetch("/api/admin/reels", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-password": password },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await readAdminError(res));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["reels"] });
    },
  });
  const deleteReelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reels?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error(await readAdminError(res));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["reels"] });
    },
  });
  const addTimelineMutation = useMutation({
    mutationFn: (input: z.infer<typeof timelineSchema>) => callAdmin("/api/admin/timeline", "POST", input),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["timeline"] }),
  });
  const editTimelineMutation = useMutation({
    mutationFn: (input: z.infer<typeof timelineSchema> & { id: string }) => callAdmin("/api/admin/timeline", "PUT", input),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["timeline"] }),
  });
  const deleteTimelineMutation = useMutation({
    mutationFn: (id: string) => callAdmin(`/api/admin/timeline?id=${encodeURIComponent(id)}`, "DELETE"),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["timeline"] }),
  });
  const addChaosMutation = useMutation({
    mutationFn: (input: z.infer<typeof chaosSchema>) => callAdmin("/api/admin/chaos", "POST", input),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["chaos"] }),
  });
  const editChaosMutation = useMutation({
    mutationFn: (input: z.infer<typeof chaosSchema> & { id: string }) => callAdmin("/api/admin/chaos", "PUT", input),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["chaos"] }),
  });
  const deleteChaosMutation = useMutation({
    mutationFn: (id: string) => callAdmin(`/api/admin/chaos?id=${encodeURIComponent(id)}`, "DELETE"),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["chaos"] }),
  });
  const addLetterMutation = useMutation({
    mutationFn: (input: z.infer<typeof letterSchema>) => callAdmin("/api/admin/letters", "POST", input),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["letters"] }),
  });
  const editLetterMutation = useMutation({
    mutationFn: (input: z.infer<typeof letterSchema> & { id: string }) => callAdmin("/api/admin/letters", "PUT", input),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["letters"] }),
  });
  const deleteLetterMutation = useMutation({
    mutationFn: (id: string) => callAdmin(`/api/admin/letters?id=${encodeURIComponent(id)}`, "DELETE"),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["letters"] }),
  });

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-black">Dev Panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add/remove students in Firestore. Don’t deploy this route publicly.
          </p>
        </div>

        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-display text-xl font-bold">Admin password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Stored locally in your browser. Used only for `/api/admin/students`.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="password"
              value={password}
              placeholder="Enter admin password"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              onChange={(e) => {
                const next = e.target.value;
                setPassword(next);
                window.localStorage.setItem(adminPasswordKey, next);
              }}
            />
            <button
              type="button"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              onClick={() => {
                setPassword("");
                window.localStorage.removeItem(adminPasswordKey);
              }}
            >
              Clear
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-display text-xl font-bold">{editingId ? "Edit student" : "Add student"}</h2>

          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit(async (values) => {
              if (editingId) {
                await editStudentMutation.mutateAsync({ ...values, id: editingId });
              } else {
                await createMutation.mutateAsync(values);
                form.reset(emptyStudentForm);
              }
            })}
          >
            <Field label="Name" error={form.formState.errors.name?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...form.register("name")} />
            </Field>
            <Field label="Nickname" error={form.formState.errors.nickname?.message}>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                {...form.register("nickname")}
              />
            </Field>
            <Field label="Emoji" error={form.formState.errors.emoji?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...form.register("emoji")} />
            </Field>
            <Field label="Badge" error={form.formState.errors.badge?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...form.register("badge")} />
            </Field>
            <Field label="Career" error={form.formState.errors.career?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...form.register("career")} />
            </Field>
            <Field label="Quote" error={form.formState.errors.quote?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...form.register("quote")} />
            </Field>
            <Field label="Photo URL (optional)" error={form.formState.errors.photo?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...form.register("photo")} />
            </Field>
            <Field label="Description (optional)" error={form.formState.errors.description?.message}>
              <textarea
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                {...form.register("description")}
              />
            </Field>

            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || editStudentMutation.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {createMutation.isPending || editStudentMutation.isPending
                  ? "Saving…"
                  : editingId
                    ? "Update"
                    : "Save"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="rounded-md border border-input bg-background px-4 py-2 text-sm"
                  onClick={() => {
                    setEditingId(null);
                    form.reset(emptyStudentForm);
                  }}
                >
                  Cancel
                </button>
              )}
              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  Create failed: {createMutation.error instanceof Error ? createMutation.error.message : "Unknown error"}
                </p>
              )}
              {editStudentMutation.isError && (
                <p className="text-sm text-destructive">
                  Update failed:{" "}
                  {editStudentMutation.error instanceof Error ? editStudentMutation.error.message : "Unknown error"}
                </p>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold">Students</h2>
            <button
              onClick={() => qc.invalidateQueries({ queryKey: ["students"] })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              Refresh
            </button>
          </div>

          {studentsQuery.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
          {studentsQuery.isError && (
            <p className="mt-4 text-sm text-muted-foreground">Couldn’t load. Check Firestore rules/config.</p>
          )}

          <ul className="mt-4 divide-y divide-border/60">
            {(studentsQuery.data ?? []).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {s.emoji} {s.name} <span className="text-muted-foreground">aka “{s.nickname}”</span>
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{s.badge} • {s.career}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(s.id);
                      form.reset({
                        name: s.name,
                        nickname: s.nickname,
                        quote: s.quote,
                        career: s.career,
                        badge: s.badge,
                        emoji: s.emoji,
                        photo: s.photo ?? "",
                        description: s.description ?? "",
                      });
                    }}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(s)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {deleteTarget?.emoji} {deleteTarget?.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove them from the yearbook. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-display text-xl font-bold">Memories (photos)</h2>
          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={memoryForm.handleSubmit(async (values) => {
              await createMemoryMutation.mutateAsync(values);
              memoryForm.reset({ src: "", caption: "", tall: false });
            })}
          >
            <Field label="Image URL" error={memoryForm.formState.errors.src?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...memoryForm.register("src")} />
            </Field>
            <Field label="Caption" error={memoryForm.formState.errors.caption?.message}>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                {...memoryForm.register("caption")}
              />
            </Field>
            <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...memoryForm.register("tall")} />
              Tall image (3/4)
            </label>
            <div className="sm:col-span-2">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Add memory
              </button>
            </div>
            {createMemoryMutation.isError && (
              <p className="sm:col-span-2 text-sm text-destructive">
                Add memory failed:{" "}
                {createMemoryMutation.error instanceof Error ? createMemoryMutation.error.message : "Unknown error"}
              </p>
            )}
            {createMemoryMutation.isSuccess && (
              <p className="sm:col-span-2 text-sm text-emerald-400">Memory added successfully.</p>
            )}
          </form>
          {memoriesQuery.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading memories…</p>}
          {memoriesQuery.isError && (
            <p className="mt-4 text-sm text-destructive">
              Couldn&apos;t load memories. Check Firestore rules for `memories` collection.
            </p>
          )}
          <ul className="mt-4 divide-y divide-border/60">
            {(memoriesQuery.data ?? []).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                <p className="min-w-0 truncate text-sm">{m.caption}</p>
                <button
                  onClick={() => deleteMemoryMutation.mutate(m.id)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-destructive"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {deleteMemoryMutation.isError && (
            <p className="mt-3 text-sm text-destructive">
              Delete memory failed:{" "}
              {deleteMemoryMutation.error instanceof Error ? deleteMemoryMutation.error.message : "Unknown error"}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-display text-xl font-bold">Reels (videos)</h2>
          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={reelForm.handleSubmit(async (values) => {
              await createReelMutation.mutateAsync(values);
              reelForm.reset({ thumb: "", title: "", duration: "", videoUrl: "" });
            })}
          >
            <Field label="Thumb URL" error={reelForm.formState.errors.thumb?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...reelForm.register("thumb")} />
            </Field>
            <Field label="Duration" error={reelForm.formState.errors.duration?.message}>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="0:47"
                {...reelForm.register("duration")}
              />
            </Field>
            <Field label="Title" error={reelForm.formState.errors.title?.message}>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                {...reelForm.register("title")}
              />
            </Field>
            <Field label="Video URL (optional)" error={reelForm.formState.errors.videoUrl?.message}>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                {...reelForm.register("videoUrl")}
              />
            </Field>
            <div className="sm:col-span-2">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Add reel
              </button>
            </div>
            {createReelMutation.isError && (
              <p className="sm:col-span-2 text-sm text-destructive">
                Add reel failed:{" "}
                {createReelMutation.error instanceof Error ? createReelMutation.error.message : "Unknown error"}
              </p>
            )}
            {createReelMutation.isSuccess && (
              <p className="sm:col-span-2 text-sm text-emerald-400">Reel added successfully.</p>
            )}
          </form>
          {reelsQuery.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading reels…</p>}
          {reelsQuery.isError && (
            <p className="mt-4 text-sm text-destructive">
              Couldn&apos;t load reels. Check Firestore rules for `reels` collection.
            </p>
          )}
          <ul className="mt-4 divide-y divide-border/60">
            {(reelsQuery.data ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <p className="min-w-0 truncate text-sm">{r.title}</p>
                <button
                  onClick={() => deleteReelMutation.mutate(r.id)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-destructive"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {deleteReelMutation.isError && (
            <p className="mt-3 text-sm text-destructive">
              Delete reel failed:{" "}
              {deleteReelMutation.error instanceof Error ? deleteReelMutation.error.message : "Unknown error"}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-display text-xl font-bold">Timeline</h2>
          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"
            onSubmit={timelineForm.handleSubmit(async (values) => {
              await addTimelineMutation.mutateAsync(values);
              timelineForm.reset();
            })}
          >
            <Field label="Date" error={timelineForm.formState.errors.date?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...timelineForm.register("date")} />
            </Field>
            <Field label="Title" error={timelineForm.formState.errors.title?.message}>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                {...timelineForm.register("title")}
              />
            </Field>
            <Field label="Description" error={timelineForm.formState.errors.desc?.message}>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                {...timelineForm.register("desc")}
              />
            </Field>
            <div className="sm:col-span-3">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add timeline item</button>
            </div>
          </form>
          <ul className="mt-4 divide-y divide-border/60">
            {(timelineQuery.data ?? []).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <p className="min-w-0 truncate text-sm">
                  {t.date} — {t.title}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const date = window.prompt("Date", t.date);
                      const title = window.prompt("Title", t.title);
                      const desc = window.prompt("Description", t.desc);
                      if (!date || !title || !desc) return;
                      editTimelineMutation.mutate({ id: t.id, date, title, desc });
                    }}
                    className="rounded-md border border-input px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTimelineMutation.mutate(t.id)}
                    className="rounded-md border border-input px-3 py-2 text-sm text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-display text-xl font-bold">Chaos</h2>
          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={chaosForm.handleSubmit(async (values) => {
              await addChaosMutation.mutateAsync(values);
              chaosForm.reset();
            })}
          >
            <Field label="Quote" error={chaosForm.formState.errors.quote?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...chaosForm.register("quote")} />
            </Field>
            <Field label="Source" error={chaosForm.formState.errors.source?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...chaosForm.register("source")} />
            </Field>
            <div className="sm:col-span-2">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add quote</button>
            </div>
          </form>
          <ul className="mt-4 divide-y divide-border/60">
            {(chaosQuery.data ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <p className="min-w-0 truncate text-sm">{c.quote}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const quote = window.prompt("Quote", c.quote);
                      const source = window.prompt("Source", c.source);
                      if (!quote || !source) return;
                      editChaosMutation.mutate({ id: c.id, quote, source });
                    }}
                    className="rounded-md border border-input px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteChaosMutation.mutate(c.id)}
                    className="rounded-md border border-input px-3 py-2 text-sm text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-display text-xl font-bold">Letters</h2>
          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={letterForm.handleSubmit(async (values) => {
              await addLetterMutation.mutateAsync(values);
              letterForm.reset();
            })}
          >
            <Field label="From" error={letterForm.formState.errors.from?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...letterForm.register("from")} />
            </Field>
            <Field label="Body" error={letterForm.formState.errors.body?.message}>
              <input className="w-full rounded-md border border-input bg-background px-3 py-2" {...letterForm.register("body")} />
            </Field>
            <div className="sm:col-span-2">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add letter</button>
            </div>
          </form>
          <ul className="mt-4 divide-y divide-border/60">
            {(lettersQuery.data ?? []).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                <p className="min-w-0 truncate text-sm">
                  {l.from}: {l.body}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const from = window.prompt("From", l.from);
                      const body = window.prompt("Body", l.body);
                      if (!from || !body) return;
                      editLetterMutation.mutate({ id: l.id, from, body });
                    }}
                    className="rounded-md border border-input px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLetterMutation.mutate(l.id)}
                    className="rounded-md border border-input px-3 py-2 text-sm text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      {children}
    </label>
  );
}

