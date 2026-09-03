import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { Memories } from "@/components/Memories";
import { Students } from "@/components/Students";
import { Timeline } from "@/components/Timeline";
import { Chaos } from "@/components/Chaos";
import { VideoReel } from "@/components/VideoReel";
import { Letters } from "@/components/Letters";
import { Goodbye } from "@/components/Goodbye";
import { Particles } from "@/components/Particles";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Loader } from "@/components/Loader";
import { CustomCursor } from "@/components/CustomCursor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seniors 2B26 — We Survived Thanaweya Amma" },
      { name: "description", content: "A cinematic yearbook for the Class of 2026. Memories, chaos, letters and one last attendance check." },
      { property: "og:title", content: "Seniors 2B26" },
      { property: "og:description", content: "We survived Thanaweya Amma. Barely. Beautifully. Together." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-animated-gradient text-foreground">
      <Loader />
      <CustomCursor />
      <Particles density={70} />
      <Hero />
      <Memories />
      <Students />
      <Timeline />
      <Chaos />
      <VideoReel />
      <Letters />
      <Goodbye />
      <MusicPlayer />
    </main>
  );
}
