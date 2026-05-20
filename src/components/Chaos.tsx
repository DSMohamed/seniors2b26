import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { chaos } from "@/data/seniors";
import { Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listChaos } from "@/data/content";

export function Chaos() {
  const chaosQuery = useQuery({
    queryKey: ["chaos"],
    queryFn: listChaos,
  });
  const items = (chaosQuery.data?.length ?? 0) > 0 ? chaosQuery.data! : chaos;

  return (
    <section className="relative px-6 py-32 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Chapter 04 — Chaos archive"
          title="Things that were said. Out loud. With confidence."
          sub="The unofficial sound design of senior year."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <motion.figure
              key={"id" in c ? c.id : i}
              initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -1 : 1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              whileHover={{ rotate: i % 2 === 0 ? -1 : 1, scale: 1.02 }}
              className="glass group relative overflow-hidden rounded-2xl p-7"
            >
              <Quote className="absolute -right-2 -top-2 h-20 w-20 text-gold/10 transition-all group-hover:text-gold/20" />
              <blockquote className="relative font-display text-xl leading-snug md:text-2xl">
                "{c.quote}"
              </blockquote>
              <figcaption className="relative mt-5 font-mono-grotesk text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                — {c.source}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}