import memory1 from "@/assets/memory-1.jpg";
import memory2 from "@/assets/memory-2.jpg";
import memory3 from "@/assets/memory-3.jpg";
import memory4 from "@/assets/memory-4.jpg";
import memory5 from "@/assets/memory-5.jpg";
import memory6 from "@/assets/memory-6.jpg";

export const memories = [
  { src: memory1, caption: "The hallway that knew all our secrets", tall: true },
  { src: memory2, caption: "Rooftop sunsets after physics review", tall: false },
  { src: memory3, caption: "3 AM. Arabic literature. Coffee #5.", tall: false },
  { src: memory4, caption: "We threw them up. We knew.", tall: true },
  { src: memory5, caption: "The last bell. The first silence.", tall: false },
  { src: memory6, caption: "Bus rides home felt like films.", tall: false },
];

export const reels = [
  { thumb: memory2, title: "Last day, told in 47 seconds", duration: "0:47", videoUrl: "" },
  { thumb: memory4, title: "Caps in the air. Knees on the ground.", duration: "1:12", videoUrl: "" },
  { thumb: memory1, title: "Hallway tour, narrated by us", duration: "2:03", videoUrl: "" },
];

export const timeline = [
  { date: "Sep '25", title: "First day, last chapter", desc: "We walked in like we owned the place. We didn't." },
  { date: "Nov '25", title: "Mid-term meltdown", desc: "Group chat hit 4,200 unread. Nobody understood derivatives." },
  { date: "Jan '26", title: "Sahel trip that wasn't allowed", desc: "It happened anyway. Phones off. Memories on." },
  { date: "Mar '26", title: "Mock exam mourning week", desc: "Tears, prayers, and 14 different study groups." },
  { date: "Jun '26", title: "Thanaweya Amma", desc: "The boss fight. We pressed start together." },
  { date: "Jul '26", title: "Last attendance", desc: "Nobody answered. Everybody was here." },
];

export const chaos = [
  { quote: "Don't worry, this won't come in the exam.", source: "Every teacher, every year" },
  { quote: "Last 5 minutes. Pens down means pens down.", source: "Mr. Adel, lying" },
  { quote: "Who told you to think? Memorize.", source: "Arabic Lit, 2026" },
  { quote: "If you fail, I fail with you.", source: "Our class rep at 2 AM" },
  { quote: "Wallahi we're cooked.", source: "Group chat, hourly" },
  { quote: "I'll explain it after the bell.", source: "Bell rings. He leaves." },
];

export const letters = [
  { from: "K.", body: "Hey future me — I hope you still call them every Friday. Don't get too cool for the group chat." },
  { from: "M.", body: "If you forgot Arabic poetry by now, that's fine. Don't forget how we laughed in the back row." },
  { from: "S.", body: "You wanted to be free. I hope freedom feels like that rooftop in May." },
  { from: "H.", body: "Be kind to yourself. Thanaweya is over. You survived. You're allowed to rest." },
];