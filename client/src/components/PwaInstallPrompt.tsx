import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function PwaInstallPrompt({ label, text }: { label: string; text: string }) {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const refreshKey = "smartcourse:controller-refresh";
    const refreshOnControllerChange = () => {
      if (sessionStorage.getItem(refreshKey) === "1") { sessionStorage.removeItem(refreshKey); return; }
      sessionStorage.setItem(refreshKey, "1");
      window.location.reload();
    };
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").then((registration) => {
      const activateWaitingWorker = () => registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      activateWaitingWorker();
      registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", () => { if (registration.installing?.state === "installed") activateWaitingWorker(); }));
    });
    navigator.serviceWorker?.addEventListener("controllerchange", refreshOnControllerChange);
    const capture = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallEvent); };
    window.addEventListener("beforeinstallprompt", capture);
    return () => { window.removeEventListener("beforeinstallprompt", capture); navigator.serviceWorker?.removeEventListener("controllerchange", refreshOnControllerChange); };
  }, []);
  if (!installEvent) return null;
  return <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/65 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm leading-5 text-slate-600">{text}</p><Button size="sm" variant="outline" className="shrink-0 border-cyan-200 bg-white text-slate-800" onClick={async () => { await installEvent.prompt(); const choice = await installEvent.userChoice; if (choice.outcome === "accepted") setInstallEvent(null); }}><Download className="mr-2 h-4 w-4" />{label}</Button></div>;
}
