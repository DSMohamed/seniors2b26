import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { memories } from "@/data/seniors";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listMemories } from "@/data/media";

export function Memories() {
  const [open, setOpen] = useState<number | null>(null);
  const memoriesQuery = useQuery({
    queryKey: ["memories"],
    queryFn: listMemories,
  });
  const media = (memoriesQuery.data?.length ?? 0) > 0 ? memoriesQuery.data! : memories;

  return (
    <section className="relative px-6 py-32 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker="Chapter 01 — Memories"
          title="Frames we'll never delete"
          sub="Hover. Open. Remember the soundtrack of that exact afternoon."
        />

        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {media.map((m, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden rounded-2xl border border-gold/10 text-left transition-all hover:border-gold/40"
            >
              <img
                src={m.src}
                alt={m.caption}
                loading="lazy"
                className={`w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:saturate-150 ${m.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-mono-grotesk text-[9px] uppercase tracking-[0.3em] text-gold">
                  Frame {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 font-display text-lg leading-tight text-foreground">
                  {m.caption}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-background/90 p-6 backdrop-blur-xl"
          >
            <button onClick={() => setOpen(null)} className="absolute right-6 top-6 rounded-full glass p-3 hover:glow-gold">
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl border border-gold/30 glow-gold"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={media[open].src} alt="" className="max-h-[70vh] w-auto" />
              <div className="glass-strong p-6">
                <p className="font-mono-grotesk text-[10px] uppercase tracking-[0.4em] text-gold">
                  Frame {String(open + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 font-display text-2xl">{media[open].caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}