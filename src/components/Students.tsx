import { motion } from "framer-motion";
import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listStudents } from "@/data/students";

export function Students() {
  const [q, setQ] = useState("");
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: listStudents,
  });

  const filtered = (studentsQuery.data ?? []).filter((s) =>
    [s.name, s.nickname, s.badge, s.career, s.quote].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <section className="relative px-6 py-32 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          kicker="Chapter 02 — The cast"
          title="The ones who made it loud"
          sub="Every legend in this room has a back-row story."
        />

        <div className="mx-auto mb-12 flex max-w-md items-center gap-3 rounded-full glass px-5 py-3">
          <Search className="h-4 w-4 text-gold" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a name, a vibe, a most likely to..."
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:border-gold/50 hover:glow-gold"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full glass-strong text-3xl">
                    {s.emoji}
                  </div>
                  <span className="rounded-full border border-gold/30 px-3 py-1 font-mono-grotesk text-[9px] uppercase tracking-widest text-gold">
                    {s.badge}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl leading-tight">{s.name}</h3>
                <p className="font-mono-grotesk text-xs uppercase tracking-widest text-muted-foreground">
                  aka "{s.nickname}"
                </p>
                <p className="mt-4 text-sm italic text-foreground/80">"{s.quote}"</p>
                <div className="mt-5 border-t border-border/50 pt-4">
                  <p className="font-mono-grotesk text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Dream career
                  </p>
                  <p className="mt-1 text-sm text-gold">{s.career}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        {studentsQuery.isLoading && (
          <p className="mt-10 text-center text-muted-foreground">Loading students…</p>
        )}
        {studentsQuery.isError && (
          <p className="mt-10 text-center text-muted-foreground">
            Couldn’t load students. Check Firestore rules and config.
          </p>
        )}
        {!studentsQuery.isLoading && !studentsQuery.isError && filtered.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">No one matches. They're probably skipping class.</p>
        )}
      </div>
    </section>
  );
}