import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Loader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="font-display text-5xl text-gradient-gold text-glow-gold md:text-7xl"
            >
              S '26
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "140px" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="mx-auto mt-6 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 font-mono-grotesk text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
            >
              Loading the memories
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}