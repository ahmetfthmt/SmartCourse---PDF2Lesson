import { BookOpen, ChevronRight, FileCheck2, Globe2, Loader2, LockKeyhole, RefreshCw, Settings2, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import type { AIProvider } from "@shared/course";
import { FileUpload } from "@/components/FileUpload";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { defaultSettings, listCourses, loadSettings, saveCourse, saveSettings, type LocalProviderSettings, type StoredCourse } from "@/lib/courseDb";
import { getCopy } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const providerName: Record<AIProvider, string> = { openai: "OpenAI", gemini: "Google Gemini", openrouter: "OpenRouter" };

async function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("PDF verisi okunamadı.")); reader.readAsDataURL(file); });
}

export default function Home() {
  const [, navigate] = useLocation();
  const [settings, setSettings] = useState<LocalProviderSettings>(defaultSettings);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [courses, setCourses] = useState<StoredCourse[]>([]);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const courseGeneration = trpc.course.generate.useMutation();
  const keyForRequest = apiKeyInput.trim() || settings.apiKey || "";
  const discoveredModels = trpc.course.availableModels.useQuery({ provider: settings.provider, apiKey: keyForRequest || "not-configured" }, { enabled: false, retry: false });
  const copy = getCopy(settings.language);
  const isWorking = courseGeneration.isPending;
  const autoModelLabel = settings.language === "tr" ? "Otomatik — en üst erişilebilir model" : "Automatic — best accessible model";
  const fallbackLabel = settings.language === "tr" ? "Kota/hız sınırında aynı sağlayıcıdaki sonraki uygun modele geçilir." : "On quota or rate limits, the next suitable model from this provider is used.";

  const refreshCourses = () => void listCourses().then(setCourses);
  useEffect(() => { void loadSettings().then((saved) => { setSettings(saved); setApiKeyInput(saved.apiKey || ""); }); refreshCourses(); }, []);

  const chooseFile = (file: File) => {
    if (file.size > MAX_FILE_BYTES) { toast.error(settings.language === "tr" ? "PDF en fazla 8 MB olabilir." : "PDF must be 8 MB or smaller."); return; }
    setActiveFile(file); setProgress(0); setStage("");
  };

  const saveProviderSettings = async () => {
    const next = { ...settings, apiKey: apiKeyInput.trim() || undefined };
    await saveSettings(next); setSettings(next);
    if (apiKeyInput.trim().length >= 8) {
      const result = await discoveredModels.refetch();
      if (result.data?.recommendedModel) toast.success(`${providerName[next.provider]}: ${result.data.recommendedModel}`);
      else if (result.error) toast.error(result.error.message);
    }
    setSettingsOpen(false);
  };

  const generate = async () => {
    if (!activeFile) { toast.error(settings.language === "tr" ? "Önce bir PDF seçin." : "Choose a PDF first."); return; }
    if (!keyForRequest) { toast.error(copy.missingKey); setSettingsOpen(true); return; }
    try {
      setStage(copy.parsing); setProgress(18);
      const pdfBase64 = await toBase64(activeFile);
      setStage(copy.designing); setProgress(42);
      const result = await courseGeneration.mutateAsync({ fileName: activeFile.name, pdfBase64, provider: settings.provider, apiKey: keyForRequest, model: settings.model || "auto", language: settings.language });
      setStage(copy.validating); setProgress(82);
      const record: StoredCourse = { id: crypto.randomUUID(), course: result.course, sourceFileName: activeFile.name, sourcePageCount: result.parsedDocument.pageCount, createdAt: Date.now(), lastOpenedAt: Date.now(), completedLessonIds: [], modelUsed: result.modelSelection.usedModel, fallbackOccurred: result.modelSelection.fallbackOccurred };
      await saveCourse(record); setProgress(100); setStage(copy.ready); refreshCourses();
      toast.success(result.modelSelection.fallbackOccurred ? `${result.modelSelection.usedModel} ile yedek model kullanıldı.` : `${result.modelSelection.usedModel} ile kurs hazırlandı.`);
      window.setTimeout(() => navigate(`/course/${record.id}`), 260);
    } catch (error) { toast.error(error instanceof Error ? error.message : (settings.language === "tr" ? "Kurs oluşturulamadı." : "The course could not be created.")); setProgress(0); setStage(""); }
  };

  return <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900">
    <div className="pointer-events-none fixed inset-0 opacity-80" style={{ backgroundImage: "radial-gradient(circle at 6% 0%, rgba(99,102,241,.12), transparent 26%), radial-gradient(circle at 93% 5%, rgba(34,211,238,.13), transparent 24%)" }} />
    <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <a href="/" className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-900/15"><Sparkles className="h-4 w-4" /></span><span className="font-serif text-xl font-semibold tracking-tight">{copy.appName}</span></a>
      <div className="flex items-center gap-2"><button onClick={() => setSettings((current) => ({ ...current, language: current.language === "tr" ? "en" : "tr" }))} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-white"><Globe2 className="h-4 w-4" />{settings.language === "tr" ? "EN" : "TR"}</button>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}><DialogTrigger asChild><Button variant="outline" size="sm" className="border-slate-200 bg-white"><Settings2 className="mr-2 h-4 w-4" />{copy.configure}</Button></DialogTrigger>
          <DialogContent className="max-w-md rounded-3xl"><DialogHeader><DialogTitle className="font-serif text-2xl">{copy.configure}</DialogTitle><DialogDescription>{copy.settingsNote}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-2"><div className="space-y-2"><Label>{copy.provider}</Label><Select value={settings.provider} onValueChange={(provider: AIProvider) => setSettings((current) => ({ ...current, provider, model: "auto" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="openai">OpenAI</SelectItem><SelectItem value="gemini">Google Gemini</SelectItem><SelectItem value="openrouter">OpenRouter</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>{copy.model}</Label><Select value={settings.model || "auto"} onValueChange={(model) => setSettings((current) => ({ ...current, model }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="auto">{autoModelLabel}</SelectItem>{(discoveredModels.data?.models || []).slice(0, 12).map((model) => <SelectItem key={model} value={model}>{model}</SelectItem>)}</SelectContent></Select><p className="flex gap-1.5 text-xs leading-5 text-slate-500"><Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />{fallbackLabel}</p></div>
              <div className="space-y-2"><Label htmlFor="api-key">{copy.apiKey}</Label><Input id="api-key" type="password" value={apiKeyInput} onChange={(event) => setApiKeyInput(event.target.value)} placeholder={settings.provider === "openai" ? "sk-…" : settings.provider === "gemini" ? "AIza…" : "sk-or-v1-…"} autoComplete="off" /></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><Label htmlFor="remember-key" className="max-w-[250px] text-sm font-normal text-slate-600">{copy.remember}</Label><Switch id="remember-key" checked={settings.rememberKey} onCheckedChange={(rememberKey) => setSettings((current) => ({ ...current, rememberKey }))} /></div>
              <Button className="w-full bg-slate-950 hover:bg-slate-800" onClick={() => void saveProviderSettings()} disabled={discoveredModels.isFetching}>{discoveredModels.isFetching ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{settings.language === "tr" ? "Modeller denetleniyor…" : "Checking models…"}</> : copy.save}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
    <main className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-14">
      <section className="grid items-center gap-12 lg:grid-cols-[1.04fr_.96fr]"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-violet-700"><Sparkles className="h-3.5 w-3.5" />{copy.heroEyebrow}</div><h1 className="max-w-2xl font-serif text-5xl font-semibold leading-[.98] tracking-tight text-slate-950 sm:text-6xl">{copy.heroTitle}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{copy.heroText}</p><div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500"><span className="inline-flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-cyan-600" />Zod validated</span><span className="inline-flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-violet-600" />{settings.provider === "openrouter" ? "OpenRouter" : "Your key, your provider"}</span><span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-600" />Offline library</span></div></div>
        <div className="rounded-[2rem] border border-white bg-white/80 p-3 shadow-[0_30px_75px_-40px_rgba(30,41,59,.55)] backdrop-blur"><FileUpload disabled={isWorking} onFileSelected={chooseFile} labels={copy} />{activeFile && <div className="px-4 pb-3 pt-5"><div className="mb-3 flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-slate-800">{activeFile.name}</p><span className="shrink-0 text-xs text-slate-400">{(activeFile.size / 1024 / 1024).toFixed(1)} MB</span></div>{isWorking || progress > 0 ? <><Progress value={progress} className="h-2 bg-slate-100" /><p className="mt-2 text-xs font-medium text-violet-700">{stage}</p></> : <p className="text-xs text-slate-500">{copy.progressIdle}</p>}<Button disabled={isWorking} className="mt-5 w-full bg-slate-950 hover:bg-slate-800" onClick={() => void generate()}>{isWorking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{copy.creating}</> : <><Sparkles className="mr-2 h-4 w-4" />{copy.generate}</>}</Button></div>}</div>
      </section>
      <PwaInstallPrompt label={copy.install} text={copy.installText} />
      <section className="mt-20"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">{copy.offline}</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{copy.library}</h2></div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">{courses.length}</span></div>{courses.length === 0 ? <div className="rounded-[1.7rem] border border-dashed border-slate-200 bg-white/60 p-10 text-center"><BookOpen className="mx-auto h-7 w-7 text-slate-300" /><h3 className="mt-4 font-semibold text-slate-800">{copy.noCourses}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{copy.noCoursesText}</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map((record) => <a key={record.id} href={`/course/${record.id}`} className="group block rounded-[1.5rem] border border-white bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,.55)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_48px_-32px_rgba(15,23,42,.35)]"><div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><BookOpen className="h-5 w-5" /></span><span className="text-xs font-semibold text-slate-400">{record.course.modules.length} {copy.modules}</span></div><h3 className="mt-5 line-clamp-2 font-serif text-xl font-semibold tracking-tight text-slate-900">{record.course.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{record.course.summary}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-medium text-slate-700"><span>{copy.open}</span><ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></div></a>)}</div>}</section>
    </main>
  </div>;
}
