import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { timeline } from "@/data/seniors";
import { useQuery } from "@tanstack/react-query";
import { listTimeline } from "@/data/content";

export function Timeline() {
  const timelineQuery = useQuery({
    queryKey: ["timeline"],
    queryFn: listTimeline,
  });
  const items = (timelineQuery.data?.length ?? 0) > 0 ? timelineQuery.data! : timeline;

  return (
    <section className="relative px-6 py-32 md:py-40">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          kicker="Chapter 03 — The year"
          title="A timeline of small disasters"
        />

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent md:left-1/2" />

          {items.map((t, i) => (
            <motion.div
              key={"id" in t ? t.id : t.date}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`relative mb-12 flex items-start gap-6 md:mb-20 md:w-1/2 md:gap-0 ${i % 2 === 0 ? "md:ml-0 md:pr-12 md:text-right" : "md:ml-auto md:pl-12"}`}
            >
              <div className={`absolute left-4 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold glow-gold md:left-auto ${i % 2 === 0 ? "md:right-0 md:translate-x-1/2" : "md:left-0 md:-translate-x-1/2"}`} />
              <div className="ml-10 md:ml-0">
                <p className="font-mono-grotesk text-[10px] uppercase tracking-[0.4em] text-gold">{t.date}</p>
                <h3 className="mt-2 font-display text-2xl md:text-3xl">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}