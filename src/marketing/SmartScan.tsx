import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Camera, FileText, Loader2, ShieldCheck, AlertTriangle, Sparkles,
  ScanLine, CheckCircle2, Clock, TrendingUp, Receipt, Building2, FileSearch,
  Lock, History, Users, Send, X, ZoomIn, ZoomOut, Maximize2, ChevronLeft,
  ChevronRight, Workflow, BadgeCheck, DollarSign, FileWarning, Bot
} from "lucide-react";
import { Navbar } from "@/marketing/components/Navbar";
import { Footer } from "@/marketing/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// ---------- Mock data generator ----------
const SCAN_STEPS = [
  "Analyzing document...",
  "Extracting financial data...",
  "Detecting supplier details...",
  "Calculating tax values...",
  "Checking for duplicates...",
];

type ScannedDoc = {
  id: string;
  fileName: string;
  preview: string | null;
  type: string;
  title: string;
  invoiceNo: string;
  supplier: string;
  customer: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  paymentMethod: string;
  subtotal: number;
  vat: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  remaining: number;
  issueDate: string;
  dueDate: string;
  paymentDate: string;
  items: { name: string; qty: number; unit: number; total: number }[];
  confidence: number;
  flags: string[];
  category: string;
  status: "Uploaded" | "AI Processed" | "Verified" | "Approved" | "Recorded";
};

function mockExtract(file: File, preview: string | null): ScannedDoc {
  const id = Math.random().toString(36).slice(2, 9);
  const suppliers = ["Acme Cloud Ltd", "Kigali Logistics", "Nile Tech Co.", "BrightOps SARL", "Savanna Supplies"];
  const customers = ["SavvyAI Inc.", "Northwind Group", "Horizon Labs"];
  const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
  const subtotal = Math.round((500 + Math.random() * 9500) * 100) / 100;
  const vat = Math.round(subtotal * 0.18 * 100) / 100;
  const discount = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + vat - discount) * 100) / 100;
  const paid = Math.round(total * (Math.random() > 0.4 ? 1 : 0.5) * 100) / 100;
  const issueDate = new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().slice(0, 10);
  const dueDate = new Date(Date.now() + Math.random() * 10 * 86400000).toISOString().slice(0, 10);
  const items = Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map((_, i) => {
    const qty = 1 + Math.floor(Math.random() * 6);
    const unit = Math.round((50 + Math.random() * 800) * 100) / 100;
    return { name: ["Cloud Hosting", "API Credits", "Consulting Hrs", "License Seat", "Support Plan"][i % 5], qty, unit, total: Math.round(qty * unit * 100) / 100 };
  });
  const flags: string[] = [];
  if (total > 8000) flags.push("High-value transaction");
  if (Math.random() > 0.7) flags.push("Possible duplicate");
  if (Math.random() > 0.8) flags.push("Tax inconsistency");
  if (Math.random() > 0.85) flags.push("Missing PO reference");

  return {
    id, fileName: file.name, preview,
    type: file.type || "document",
    title: file.name.replace(/\.[^.]+$/, ""),
    invoiceNo: "INV-" + Math.floor(10000 + Math.random() * 89999),
    supplier, customer: customers[Math.floor(Math.random() * customers.length)],
    address: "KG 9 Ave, Kigali, Rwanda",
    phone: "+250 780 407 924",
    email: "billing@" + supplier.toLowerCase().replace(/[^a-z]/g, "") + ".com",
    taxId: "TIN-" + Math.floor(100000 + Math.random() * 899999),
    currency: "USD", paymentMethod: ["Bank Transfer", "Card", "Mobile Money"][Math.floor(Math.random() * 3)],
    subtotal, vat, tax: vat, discount, total, paid, remaining: Math.round((total - paid) * 100) / 100,
    issueDate, dueDate, paymentDate: paid >= total ? issueDate : "",
    items,
    confidence: 88 + Math.floor(Math.random() * 11),
    flags,
    category: ["Software", "Logistics", "Office", "Consulting", "Utilities"][Math.floor(Math.random() * 5)],
    status: "AI Processed",
  };
}

// ---------- Page ----------
export default function SmartScan() {
  const [docs, setDocs] = useState<ScannedDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I'm SmartScan AI. Upload a document and ask me anything about it." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const active = docs.find((d) => d.id === activeId) || null;

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setScanning(true);
    setProgress(0);
    setScanStep(0);

    for (let s = 0; s < SCAN_STEPS.length; s++) {
      setScanStep(s);
      await new Promise((r) => setTimeout(r, 700));
      setProgress(((s + 1) / SCAN_STEPS.length) * 100);
    }

    const newDocs: ScannedDoc[] = await Promise.all(
      list.map(
        (f) =>
          new Promise<ScannedDoc>((resolve) => {
            if (f.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (e) => resolve(mockExtract(f, e.target?.result as string));
              reader.readAsDataURL(f);
            } else {
              resolve(mockExtract(f, null));
            }
          })
      )
    );
    setDocs((prev) => [...newDocs, ...prev]);
    setActiveId(newDocs[0].id);
    setScanning(false);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const stats = useMemo(() => {
    const totalSpend = docs.reduce((a, d) => a + d.total, 0);
    const totalVat = docs.reduce((a, d) => a + d.vat, 0);
    const alerts = docs.reduce((a, d) => a + d.flags.length, 0);
    const avgConf = docs.length ? Math.round(docs.reduce((a, d) => a + d.confidence, 0) / docs.length) : 0;
    return { totalSpend, totalVat, alerts, avgConf };
  }, [docs]);

  const insights = useMemo(() => {
    const arr: { icon: any; tone: string; text: string }[] = [];
    if (docs.length >= 2) arr.push({ icon: TrendingUp, tone: "primary", text: `Supplier costs increased by ${10 + Math.floor(Math.random() * 20)}% this month.` });
    if (docs.some((d) => d.flags.includes("Possible duplicate"))) arr.push({ icon: AlertTriangle, tone: "destructive", text: "Possible duplicate invoice detected." });
    if (active && active.remaining > 0) arr.push({ icon: Clock, tone: "primary", text: `Payment due in ${Math.max(1, Math.floor((+new Date(active.dueDate) - Date.now()) / 86400000))} days.` });
    if (docs.some((d) => d.flags.includes("Tax inconsistency"))) arr.push({ icon: FileWarning, tone: "destructive", text: "Tax values may be inconsistent." });
    if (docs.some((d) => d.flags.includes("High-value transaction"))) arr.push({ icon: DollarSign, tone: "primary", text: "Large transaction detected." });
    if (!arr.length) arr.push({ icon: Sparkles, tone: "primary", text: "Upload documents to unlock AI insights." });
    return arr;
  }, [docs, active]);

  const askAI = () => {
    const q = chatInput.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setChatInput("");
    setTimeout(() => {
      let answer = "Upload a document first so I can analyze it.";
      if (active) {
        const ql = q.toLowerCase();
        if (ql.includes("vat") || ql.includes("tax")) answer = `VAT for ${active.invoiceNo} is ${active.currency} ${active.vat.toLocaleString()}.`;
        else if (ql.includes("supplier") || ql.includes("who")) answer = `Supplier is ${active.supplier} (${active.email}).`;
        else if (ql.includes("summar")) answer = `${active.invoiceNo} from ${active.supplier} for ${active.currency} ${active.total.toLocaleString()}, due ${active.dueDate}. Confidence ${active.confidence}%.`;
        else if (ql.includes("suspicious") || ql.includes("fraud")) answer = active.flags.length ? `Flags: ${active.flags.join(", ")}.` : "No suspicious activity detected.";
        else answer = `Total: ${active.currency} ${active.total.toLocaleString()} · Paid: ${active.paid.toLocaleString()} · Remaining: ${active.remaining.toLocaleString()}.`;
      }
      setMessages((m) => [...m, { role: "ai", text: answer }]);
    }, 600);
  };

  const workflowSteps: ScannedDoc["status"][] = ["Uploaded", "AI Processed", "Verified", "Approved", "Recorded"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">SmartScan AI · Enterprise OCR</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">SmartScan AI</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Intelligent financial document scanner. Drop invoices, receipts, contracts, POs and tax documents — extract, validate and route in seconds.
          </p>
        </motion.div>

        {/* Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: "Documents", value: docs.length },
            { icon: DollarSign, label: "Monthly Spend", value: `$${stats.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
            { icon: AlertTriangle, label: "AI Alerts", value: stats.alerts },
            { icon: BadgeCheck, label: "Avg Confidence", value: `${stats.avgConf}%` },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card p-4 border-0 shadow-glow">
                <div className="flex items-center justify-between mb-2">
                  <div className="gradient-primary rounded-lg p-2"><s.icon className="h-4 w-4 text-primary-foreground" /></div>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upload */}
        <Card
          className={`glass-card border-2 border-dashed transition-all p-8 md:p-12 mb-8 relative overflow-hidden ${dragOver ? "border-primary shadow-glow" : "border-border"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <AnimatePresence>
            {scanning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <ScanLine className="h-12 w-12 text-primary" />
                  </motion.div>
                  <div className="absolute -inset-6 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                </div>
                <div className="text-center w-full max-w-md">
                  <p className="text-sm font-medium mb-2">{SCAN_STEPS[scanStep]}</p>
                  <Progress value={progress} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center relative z-0">
            <div className="inline-flex gradient-primary rounded-2xl p-4 mb-4 shadow-glow">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-1">Drop documents to scan</h3>
            <p className="text-sm text-muted-foreground mb-5">PDF, PNG, JPG, JPEG, DOCX · multi-file supported</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => inputRef.current?.click()} className="gradient-primary border-0 text-primary-foreground shadow-glow">
                <Upload className="h-4 w-4" /> Upload Files
              </Button>
              <Button variant="outline" onClick={() => cameraRef.current?.click()}>
                <Camera className="h-4 w-4" /> Camera Scan
              </Button>
              <input ref={inputRef} type="file" multiple hidden accept=".pdf,.png,.jpg,.jpeg,.docx,image/*" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              <input ref={cameraRef} type="file" hidden accept="image/*" capture="environment" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            </div>
          </div>
        </Card>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Document list */}
          <Card className="glass-card border-0 p-4 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><FileSearch className="h-4 w-4 text-primary" /> Recent Scans</h3>
              <span className="text-xs text-muted-foreground">{docs.length}</span>
            </div>
            <ScrollArea className="h-[420px] pr-2">
              {docs.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No documents yet.</p>}
              <div className="space-y-2">
                {docs.map((d) => (
                  <button key={d.id} onClick={() => setActiveId(d.id)} className={`w-full text-left rounded-lg p-3 transition-all ${activeId === d.id ? "bg-primary/10 border border-primary/40" : "hover:bg-secondary border border-transparent"}`}>
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{d.title}</div>
                        <div className="text-xs text-muted-foreground">{d.supplier} · ${d.total.toLocaleString()}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">{d.confidence}%</span>
                          {d.flags.slice(0, 1).map((f) => (
                            <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Viewer + extracted */}
          <Card className="glass-card border-0 p-4 lg:col-span-2">
            {!active ? (
              <div className="h-[420px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-3 text-primary/60" />
                <p className="font-medium">Select or upload a document</p>
                <p className="text-sm">Extracted data and AI insights appear here.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Document Preview</h4>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setFullscreen(true)}><Maximize2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/50 h-64 overflow-hidden flex items-center justify-center relative">
                    {active.preview ? (
                      <img src={active.preview} alt={active.title} style={{ transform: `scale(${zoom})` }} className="max-h-full transition-transform" />
                    ) : (
                      <div className="text-center p-6">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-primary" />
                        <p className="text-xs text-muted-foreground">{active.fileName}</p>
                      </div>
                    )}
                    <motion.div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" animate={{ y: [0, 256, 0] }} transition={{ duration: 3, repeat: Infinity }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <Button size="icon" variant="ghost"><ChevronLeft className="h-4 w-4" /></Button>
                    <span>Page 1 / 1</span>
                    <Button size="icon" variant="ghost"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>

                {/* Extracted */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Extracted Data</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {active.confidence}% confidence</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ["Invoice #", active.invoiceNo], ["Supplier", active.supplier],
                      ["Customer", active.customer], ["Tax ID", active.taxId],
                      ["Issue", active.issueDate], ["Due", active.dueDate],
                      ["Payment", active.paymentMethod], ["Category", active.category],
                    ].map(([k, v]) => (
                      <div key={k as string} className="rounded-md bg-secondary/60 p-2">
                        <div className="text-muted-foreground">{k}</div>
                        <div className="font-medium truncate">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border p-3 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${active.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span>${active.vat.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-${active.discount.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1"><span>Total</span><span className="text-primary">${active.total.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Paid {`$${active.paid.toLocaleString()}`}</span><span>Remaining ${active.remaining.toLocaleString()}</span></div>
                  </div>

                  {active.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {active.flags.map((f) => (
                        <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{f}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Items table */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-sm mb-2">Line Items</h4>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50 text-xs text-muted-foreground">
                        <tr><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Unit</th><th className="text-right p-2">Total</th></tr>
                      </thead>
                      <tbody>
                        {active.items.map((it, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-2">{it.name}</td><td className="p-2 text-right">{it.qty}</td>
                            <td className="p-2 text-right">${it.unit.toLocaleString()}</td>
                            <td className="p-2 text-right font-medium">${it.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Workflow */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Workflow className="h-4 w-4 text-primary" /> Workflow</h4>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {workflowSteps.map((s, i) => {
                      const reached = workflowSteps.indexOf(active.status) >= i;
                      return (
                        <div key={s} className="flex items-center gap-2 shrink-0">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${reached ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"}`}>
                            <CheckCircle2 className="h-3 w-3" /> {s}
                          </div>
                          {i < workflowSteps.length - 1 && <div className={`h-px w-6 ${reached ? "bg-primary" : "bg-border"}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                    {["Finance", "Procurement", "Audit", "Payroll", "CFO"].map((d) => (
                      <span key={d} className="px-2 py-0.5 rounded-full bg-secondary flex items-center gap-1"><Users className="h-3 w-3" />{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* AI Insights */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Financial Insights</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass-card border-0 p-4 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                  <div className="flex items-start gap-3 relative">
                    <div className={`rounded-lg p-2 ${ins.tone === "destructive" ? "bg-destructive/20 text-destructive" : "gradient-primary text-primary-foreground"}`}>
                      <ins.icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">{ins.text}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Lock, t: "End-to-end Encryption", d: "AES-256 at rest & TLS 1.3 in transit" },
            { icon: ShieldCheck, t: "Role-based Access", d: "Granular permissions per department" },
            { icon: History, t: "Audit Logs", d: "Every action versioned & timestamped" },
            { icon: Building2, t: "Secure Cloud Storage", d: "SOC 2 certified infrastructure" },
          ].map((s, i) => (
            <Card key={i} className="glass-card border-0 p-4">
              <s.icon className="h-5 w-5 text-primary mb-2" />
              <div className="font-semibold text-sm">{s.t}</div>
              <div className="text-xs text-muted-foreground">{s.d}</div>
            </Card>
          ))}
        </div>
      </main>

      {/* Floating Chat */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="glass-card border border-border rounded-2xl w-80 sm:w-96 mb-3 shadow-glow overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border gradient-primary">
                <div className="flex items-center gap-2 text-primary-foreground"><Bot className="h-4 w-4" /><span className="font-semibold text-sm">Ask SmartScan AI</span></div>
                <button onClick={() => setChatOpen(false)} className="text-primary-foreground"><X className="h-4 w-4" /></button>
              </div>
              <ScrollArea className="h-72 p-3">
                <div className="space-y-2">
                  {messages.map((m, i) => (
                    <div key={i} className={`text-sm rounded-lg p-2 max-w-[85%] ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.text}</div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-2 border-t border-border flex gap-2">
                <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && askAI()} placeholder="What is the VAT amount?" />
                <Button size="icon" onClick={askAI} className="gradient-primary border-0 text-primary-foreground"><Send className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button onClick={() => setChatOpen((v) => !v)} className="gradient-primary border-0 text-primary-foreground shadow-glow rounded-full h-14 w-14">
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {fullscreen && active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/95 backdrop-blur z-50 flex items-center justify-center p-6">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setFullscreen(false)}><X className="h-5 w-5" /></Button>
            {active.preview ? (
              <img src={active.preview} alt={active.title} className="max-h-full max-w-full rounded-lg" />
            ) : (
              <Card className="glass-card border-0 p-12 text-center"><FileText className="h-16 w-16 mx-auto text-primary mb-3" /><p>{active.fileName}</p></Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
