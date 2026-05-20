import { createFileRoute } from "@tanstack/react-router";
import { getGoogleOAuthAccessToken } from "@/lib/googleServiceAccount";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function getEnvVar(name: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? (process.env as Record<string, string | undefined>)[name] : undefined;
  if (fromProcess) return fromProcess;
  return (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name];
}

function assertAdmin(request: Request): Response | null {
  const expected = getEnvVar("ADMIN_PASSWORD");
  const provided = request.headers.get("x-admin-password") ?? "";
  if (!expected) return json(500, { error: "Server missing ADMIN_PASSWORD" });
  if (provided !== expected) return json(401, { error: "Unauthorized" });
  return null;
}

export const Route = createFileRoute("/api/admin/memories")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = assertAdmin(request);
        if (denied) return denied;

        const projectId = getEnvVar("FIREBASE_PROJECT_ID");
        const serviceEmail = getEnvVar("GOOGLE_SERVICE_ACCOUNT_EMAIL");
        const privateKey = getEnvVar("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
        if (!projectId || !serviceEmail || !privateKey) return json(500, { error: "Missing server env vars" });

        const payload = (await request.json().catch(() => null)) as
          | { src?: string; caption?: string; tall?: boolean }
          | null;
        if (!payload?.src || !payload?.caption) return json(400, { error: "src and caption are required" });

        const token = await getGoogleOAuthAccessToken({
          FIREBASE_PROJECT_ID: projectId,
          GOOGLE_SERVICE_ACCOUNT_EMAIL: serviceEmail,
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey,
        });

        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/memories`,
          {
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({
              fields: {
                src: { stringValue: payload.src },
                caption: { stringValue: payload.caption },
                tall: { booleanValue: Boolean(payload.tall) },
                createdAt: { timestampValue: new Date().toISOString() },
              },
            }),
          },
        );

        if (!res.ok) return json(500, { error: `Firestore create failed (${res.status})` });
        return json(200, { ok: true });
      },
      DELETE: async ({ request }) => {
        const denied = assertAdmin(request);
        if (denied) return denied;

        const projectId = getEnvVar("FIREBASE_PROJECT_ID");
        const serviceEmail = getEnvVar("GOOGLE_SERVICE_ACCOUNT_EMAIL");
        const privateKey = getEnvVar("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
        if (!projectId || !serviceEmail || !privateKey) return json(500, { error: "Missing server env vars" });

        const id = new URL(request.url).searchParams.get("id");
        if (!id) return json(400, { error: "Missing id" });

        const token = await getGoogleOAuthAccessToken({
          FIREBASE_PROJECT_ID: projectId,
          GOOGLE_SERVICE_ACCOUNT_EMAIL: serviceEmail,
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey,
        });

        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/memories/${encodeURIComponent(id)}`,
          { method: "DELETE", headers: { authorization: `Bearer ${token}` } },
        );

        if (!res.ok) return json(500, { error: `Firestore delete failed (${res.status})` });
        return json(200, { ok: true });
      },
    },
  },
});

