import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Music, Pause } from "lucide-react";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = new Audio("https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3");
    a.loop = true;
    a.volume = 0.35;
    audioRef.current = a;
    return () => { a.pause(); };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      onClick={toggle}
      className="glass-strong fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full px-4 py-3 text-sm text-foreground transition-all hover:glow-gold"
      aria-label="Toggle music"
    >
      <div className="relative">
        {playing ? <Pause className="h-4 w-4 text-gold" /> : <Music className="h-4 w-4 text-gold" />}
        {playing && (
          <span className="absolute -inset-2 animate-pulse-glow rounded-full border border-gold/40" />
        )}
      </div>
      <span className="font-mono-grotesk text-xs uppercase tracking-widest text-muted-foreground">
        {playing ? "Now playing" : "Play the feeling"}
      </span>
    </motion.button>
  );
}