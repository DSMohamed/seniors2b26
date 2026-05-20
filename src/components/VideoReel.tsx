import { AnimatePresence, motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { Play, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listReels } from "@/data/media";
import { reels as mockReels } from "@/data/seniors";
import { useMemo, useState } from "react";

function toDriveEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("drive.google.com")) return null;

    // /file/d/<id>/view
    const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;

    // /open?id=<id> or similar
    const id = u.searchParams.get("id");
    if (id) return `https://drive.google.com/file/d/${id}/preview`;

    return null;
  } catch {
    return null;
  }
}

function isLikelyDirectVideoUrl(url: string): boolean {
  const clean = url.split("?")[0]?.toLowerCase() ?? "";
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".ogg");
}

export function VideoReel() {
  const reelsQuery = useQuery({
    queryKey: ["reels"],
    queryFn: listReels,
  });
  const reels = (reelsQuery.data?.length ?? 0) > 0 ? reelsQuery.data! : mockReels;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeReel = activeIndex !== null ? reels[activeIndex] : null;
  const activeVideoUrl = activeReel?.videoUrl ?? "";
  const driveEmbedUrl = useMemo(
    () => (activeVideoUrl ? toDriveEmbedUrl(activeVideoUrl) : null),
    [activeVideoUrl],
  );
  const canPlayDirect = activeVideoUrl ? isLikelyDirectVideoUrl(activeVideoUrl) : false;

  return (
    <section className="relative px-6 py-32 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker="Chapter 05 — Reels"
          title="The unofficial cinematic universe"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reels.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative aspect-[9/12] overflow-hidden rounded-2xl border border-gold/20"
            >
              <img src={r.thumb} loading="lazy" alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="glass-strong flex h-20 w-20 items-center justify-center rounded-full glow-gold"
                >
                  <button
                    type="button"
                    aria-label={`Play ${r.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (r.videoUrl) setActiveIndex(i);
                    }}
                    disabled={!r.videoUrl}
                    className="flex h-full w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Play className="h-8 w-8 fill-gold text-gold" />
                  </button>
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-mono-grotesk text-[10px] uppercase tracking-[0.3em] text-gold">{r.duration}</p>
                <p className="mt-1 font-display text-lg">{r.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeReel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveIndex(null)}
          >
            <div
              className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-gold/30 bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="aspect-video w-full">
                {driveEmbedUrl ? (
                  <iframe
                    title={activeReel.title}
                    src={driveEmbedUrl}
                    className="h-full w-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : canPlayDirect ? (
                  <video src={activeVideoUrl} controls autoPlay className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    This link is not directly playable. Use a Google Drive share link or a direct .mp4 URL.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}