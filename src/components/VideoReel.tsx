import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { Play } from "lucide-react";
import memory1 from "@/assets/memory-1.jpg";
import memory2 from "@/assets/memory-2.jpg";
import memory4 from "@/assets/memory-4.jpg";

const reels = [
  { thumb: memory2, title: "Last day, told in 47 seconds", duration: "0:47" },
  { thumb: memory4, title: "Caps in the air. Knees on the ground.", duration: "1:12" },
  { thumb: memory1, title: "Hallway tour, narrated by us", duration: "2:03" },
];

export function VideoReel() {
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
                  <Play className="h-8 w-8 fill-gold text-gold" />
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
    </section>
  );
}