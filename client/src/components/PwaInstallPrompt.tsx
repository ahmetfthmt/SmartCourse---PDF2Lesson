import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function PwaInstallPrompt({ label, text }: { label: string; text: string }) {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  useEffect(() => { if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js"); const capture = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallEvent); }; window.addEventListener("beforeinstallprompt", capture); return () => window.removeEventListener("beforeinstallprompt", capture); }, []);
  if (!installEvent) return null;
  return <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/65 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm leading-5 text-slate-600">{text}</p><Button size="sm" variant="outline" className="shrink-0 border-cyan-200 bg-white text-slate-800" onClick={async () => { await installEvent.prompt(); const choice = await installEvent.userChoice; if (choice.outcome === "accepted") setInstallEvent(null); }}><Download className="mr-2 h-4 w-4" />{label}</Button></div>;
}
