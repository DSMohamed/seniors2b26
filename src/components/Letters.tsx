import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { letters } from "@/data/seniors";

export function Letters() {
  return (
    <section className="relative px-6 py-32 md:py-40">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          kicker="Chapter 06 — Letters"
          title="To us, in five years"
          sub="Written in pencil. Sealed in feeling."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {letters.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -2 : 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
              whileHover={{ y: -4, rotate: i % 2 === 0 ? -1 : 1 }}
              className="glass relative overflow-hidden rounded-2xl p-8"
            >
              <div className="absolute right-6 top-6 font-display text-6xl text-gold/20">"</div>
              <p className="relative font-display text-lg italic leading-relaxed text-foreground/90 md:text-xl">
                {l.body}
              </p>
              <p className="mt-6 font-mono-grotesk text-[10px] uppercase tracking-[0.4em] text-gold">
                — Sealed by {l.from}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}