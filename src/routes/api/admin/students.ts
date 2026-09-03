import { createFileRoute } from "@tanstack/react-router";
import { getGoogleOAuthAccessToken } from "@/lib/googleServiceAccount";

type StudentInput = {
  name: string;
  nickname: string;
  quote: string;
  career: string;
  badge: string;
  emoji: string;
  photo?: string;
  description?: string;
};

function json(status: number, body: unknown, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...(headers ?? {}) },
  });
}

function getEnvVar(name: string): string | undefined {
  // Node/dev
  const fromProcess = typeof process !== "undefined" ? (process.env as Record<string, string | undefined>)[name] : undefined;
  if (fromProcess) return fromProcess;
  // Some runtimes expose via import.meta.env on server builds
  const fromMeta = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name];
  return fromMeta;
}

function assertAdmin(request: Request): Response | null {
  const expected = getEnvVar("ADMIN_PASSWORD");
  if (!expected) return json(500, { error: "Server missing ADMIN_PASSWORD" });

  const provided = request.headers.get("x-admin-password") ?? "";
  if (provided !== expected) return json(401, { error: "Unauthorized" });
  return null;
}

function validateStudentInput(payload: unknown): StudentInput | Response {
  if (!payload || typeof payload !== "object") return json(400, { error: "Invalid JSON body" });
  const p = payload as Partial<StudentInput>;
  const fields: Array<keyof StudentInput> = ["name", "nickname", "quote", "career", "badge", "emoji"];
  for (const key of fields) {
    if (typeof p[key] !== "string" || !p[key]!.trim()) {
      return json(400, { error: `Missing/invalid field: ${key}` });
    }
  }
  const photo = typeof p.photo === "string" ? p.photo.trim() : "";
  const description = typeof p.description === "string" ? p.description.trim() : "";
  return {
    name: p.name!.trim(),
    nickname: p.nickname!.trim(),
    quote: p.quote!.trim(),
    career: p.career!.trim(),
    badge: p.badge!.trim(),
    emoji: p.emoji!.trim(),
    ...(photo ? { photo } : {}),
    ...(description ? { description } : {}),
  };
}

function firestoreFields(input: StudentInput, opts?: { includeCreatedAt?: boolean }) {
  const toString = (v: string) => ({ stringValue: v });
  const fields: Record<string, { stringValue: string } | { timestampValue: string }> = {
    name: toString(input.name),
    nickname: toString(input.nickname),
    quote: toString(input.quote),
    career: toString(input.career),
    badge: toString(input.badge),
    emoji: toString(input.emoji),
  };
  if (opts?.includeCreatedAt !== false) {
    fields.createdAt = { timestampValue: new Date().toISOString() };
  }
  const photo = input.photo?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  if (photo || opts?.includeCreatedAt === false) fields.photo = toString(photo);
  if (description || opts?.includeCreatedAt === false) fields.description = toString(description);
  return { fields };
}

export const Route = createFileRoute("/api/admin/students")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = assertAdmin(request);
        if (denied) return denied;

        const projectId = getEnvVar("FIREBASE_PROJECT_ID");
        const serviceEmail = getEnvVar("GOOGLE_SERVICE_ACCOUNT_EMAIL");
        const privateKey = getEnvVar("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
        if (!projectId || !serviceEmail || !privateKey) {
          return json(500, {
            error:
              "Missing env vars: FIREBASE_PROJECT_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
          });
        }

        const payload = await request.json().catch(() => null);
        const inputOrError = validateStudentInput(payload);
        if (inputOrError instanceof Response) return inputOrError;

        const token = await getGoogleOAuthAccessToken({
          FIREBASE_PROJECT_ID: projectId,
          GOOGLE_SERVICE_ACCOUNT_EMAIL: serviceEmail,
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey,
        });

        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/students`,
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${token}`,
              "content-type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(firestoreFields(inputOrError)),
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return json(500, { error: `Firestore create failed (${res.status})`, details: text });
        }

        const doc = (await res.json()) as { name?: string; fields?: unknown };
        const id = doc.name?.split("/").pop();
        return json(200, { id });
      },

      PUT: async ({ request }) => {
        const denied = assertAdmin(request);
        if (denied) return denied;

        const projectId = getEnvVar("FIREBASE_PROJECT_ID");
        const serviceEmail = getEnvVar("GOOGLE_SERVICE_ACCOUNT_EMAIL");
        const privateKey = getEnvVar("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
        if (!projectId || !serviceEmail || !privateKey) {
          return json(500, {
            error:
              "Missing env vars: FIREBASE_PROJECT_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
          });
        }

        const payload = (await request.json().catch(() => null)) as ({ id?: string } & Partial<StudentInput>) | null;
        const id = payload?.id?.trim();
        if (!id) return json(400, { error: "Missing id" });

        const inputOrError = validateStudentInput(payload);
        if (inputOrError instanceof Response) return inputOrError;

        const photo = typeof payload?.photo === "string" ? payload.photo.trim() : "";
        const description = typeof payload?.description === "string" ? payload.description.trim() : "";
        const updateInput: StudentInput = { ...inputOrError, photo, description };

        const token = await getGoogleOAuthAccessToken({
          FIREBASE_PROJECT_ID: projectId,
          GOOGLE_SERVICE_ACCOUNT_EMAIL: serviceEmail,
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey,
        });

        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/students/${encodeURIComponent(id)}`,
          {
            method: "PATCH",
            headers: {
              authorization: `Bearer ${token}`,
              "content-type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(firestoreFields(updateInput, { includeCreatedAt: false })),
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return json(500, { error: `Firestore update failed (${res.status})`, details: text });
        }

        return json(200, { ok: true });
      },

      DELETE: async ({ request }) => {
        const denied = assertAdmin(request);
        if (denied) return denied;

        const projectId = getEnvVar("FIREBASE_PROJECT_ID");
        const serviceEmail = getEnvVar("GOOGLE_SERVICE_ACCOUNT_EMAIL");
        const privateKey = getEnvVar("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
        if (!projectId || !serviceEmail || !privateKey) {
          return json(500, {
            error:
              "Missing env vars: FIREBASE_PROJECT_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
          });
        }

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return json(400, { error: "Missing id query param" });

        const token = await getGoogleOAuthAccessToken({
          FIREBASE_PROJECT_ID: projectId,
          GOOGLE_SERVICE_ACCOUNT_EMAIL: serviceEmail,
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey,
        });

        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/students/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return json(500, { error: `Firestore delete failed (${res.status})`, details: text });
        }

        return json(200, { ok: true });
      },
    },
  },
});

