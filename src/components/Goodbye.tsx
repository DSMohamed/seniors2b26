import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useQuery } from "@tanstack/react-query";
import { listStudents } from "@/data/students";

export function Goodbye() {
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: listStudents,
  });

  const fire = () => {
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#e8c56e", "#f0d78c", "#a08cff", "#7ab8ff"],
    });
  };

  return (
    <section className="relative px-6 py-40 md:py-56">
      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-mono-grotesk text-[10px] uppercase tracking-[0.5em] text-gold"
        >
          Final scene
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-5xl font-black leading-[0.95] md:text-8xl"
        >
          One last <span className="text-gradient-gold text-glow-gold">attendance check.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-base text-muted-foreground md:text-lg"
        >
          Nobody answered. Everybody was here.
        </motion.p>

        <motion.button
          onClick={fire}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-12 rounded-full bg-gold px-8 py-4 font-mono-grotesk text-xs uppercase tracking-[0.3em] text-background transition-all hover:glow-gold"
        >
          Throw the caps
        </motion.button>

        <div className="mt-24 overflow-hidden">
          <motion.div
            initial={{ y: 200 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 12, ease: "linear" }}
            className="space-y-2 text-center font-display text-xl text-foreground/70 md:text-2xl"
          >
            {(studentsQuery.data ?? []).map((s) => (
              <p key={s.id}>{s.name}</p>
            ))}
            <p className="text-muted-foreground">+ everyone we forgot to name</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 2 }}
          className="mt-20"
        >
          <p className="font-display text-3xl text-gradient-gold md:text-5xl">Class of 2026.</p>
          <p className="mt-4 font-mono-grotesk text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
            Fin.
          </p>
        </motion.div>
      </div>
    </section>
  );
}