import { Fragment } from "react";

function InlineText({ value }: { value: string }) {
  return <>{value.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : <Fragment key={index}>{part}</Fragment>)}</>;
}

export function Streamdown({ children }: { children: string }) {
  const lines = children.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return <div className="space-y-4">{lines.map((line, index) => {
    if (line.startsWith("### ")) return <h3 key={index} className="font-serif text-xl font-semibold text-slate-900">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={index} className="mt-8 font-serif text-2xl font-semibold tracking-tight text-slate-950">{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={index} className="font-serif text-3xl font-semibold text-slate-950">{line.slice(2)}</h1>;
    if (/^[-*]\s+/.test(line)) return <div key={index} className="flex gap-3 pl-1 text-[1.02rem] leading-8 text-slate-700"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" /><span><InlineText value={line.replace(/^[-*]\s+/, "")} /></span></div>;
    return <p key={index} className="text-[1.02rem] leading-8 text-slate-700"><InlineText value={line} /></p>;
  })}</div>;
}
