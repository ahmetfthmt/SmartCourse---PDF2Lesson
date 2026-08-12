import { FileText, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

type FileUploadProps = { disabled?: boolean; onFileSelected: (file: File) => void; labels: { upload: string; browse: string; fileHint: string } };

export function FileUpload({ disabled, onFileSelected, labels }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const useFile = (file?: File) => { if (!file || disabled) return; if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return; onFileSelected(file); };
  return <section role="button" tabIndex={0} aria-label={labels.upload} onClick={() => !disabled && inputRef.current?.click()} onKeyDown={(event) => event.key === "Enter" && !disabled && inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!disabled) setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); useFile(event.dataTransfer.files[0]); }} className={`group relative min-h-56 cursor-pointer overflow-hidden rounded-[1.75rem] border border-dashed p-7 transition-all duration-200 ${isDragging ? "border-cyan-300 bg-cyan-50/80 shadow-[0_0_0_6px_rgba(34,211,238,.09)]" : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-[0_20px_50px_-34px_rgba(8,47,73,.58)]"} ${disabled ? "cursor-wait opacity-70" : ""}`}>
    <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => useFile(event.target.files?.[0])} />
    <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ backgroundImage: "radial-gradient(circle at 20% 10%, rgba(34,211,238,.10), transparent 30%), radial-gradient(circle at 80% 80%, rgba(99,102,241,.08), transparent 35%)" }} />
    <div className="relative flex h-full flex-col items-center justify-center text-center"><div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15 transition-transform duration-200 group-hover:-translate-y-1">{isDragging ? <UploadCloud className="h-6 w-6" /> : <FileText className="h-6 w-6" />}</div><p className="max-w-xs text-base font-semibold tracking-tight text-slate-900">{labels.upload}</p><p className="mt-1 text-sm text-slate-500">{labels.browse}</p><p className="mt-5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{labels.fileHint}</p></div>
  </section>;
}
