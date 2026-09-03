import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_85%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 1.8 }}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="font-mono-grotesk text-[11px] uppercase tracking-[0.5em] text-gold"
        >
          Class Yearbook — Egypt — 2025 / 2026
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.6, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 font-display text-6xl font-black leading-[0.95] tracking-tight md:text-[10rem]"
        >
          <span className="text-gradient-gold text-glow-gold">Seniors</span>
          <span className="block text-foreground/90">2B26</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 3 }}
          className="mx-auto mt-8 max-w-xl text-base text-muted-foreground md:text-lg"
        >
          We survived Thanaweya Amma. <span className="text-foreground">Barely.</span> Beautifully. <span className="text-gradient-neon font-medium">Together.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.6, duration: 1 }}
          className="mt-16 flex flex-col items-center gap-3 text-muted-foreground"
        >
          <span className="font-mono-grotesk text-[10px] uppercase tracking-[0.4em]">Scroll the memory</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="h-5 w-5 text-gold" />
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="absolute left-1/2 top-1/2 -z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-purple/20 blur-[120px]" />
      <div className="absolute right-0 top-0 -z-0 h-[400px] w-[400px] rounded-full bg-neon-blue/15 blur-[100px]" />
    </section>
  );
}