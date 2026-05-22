// SmartScan OCR pipeline: PDF→image rendering, image preprocessing,
// multilingual OCR (eng+fra), and text cleanup.

export type OcrProgress = (info: { step: string; progress: number; preview?: string }) => void;

/** Render a PDF file into high-DPI canvases (one per page). */
export async function pdfToImages(file: File, dpi = 300, maxPages = 5): Promise<HTMLCanvasElement[]> {
  const pdfjs: any = await import("pdfjs-dist");
  // Use the bundled worker via Vite ?url import
  const workerUrl: string = (
    await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
  ).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const pages: HTMLCanvasElement[] = [];
  const total = Math.min(pdf.numPages, maxPages);
  const scale = dpi / 72; // PDF.js default is 72dpi
  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    pages.push(canvas);
  }
  return pages;
}

/** Grayscale + contrast boost + light sharpen for better OCR. */
export function preprocessCanvas(src: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement {
  const w = (src as any).width || (src as HTMLImageElement).naturalWidth;
  const h = (src as any).height || (src as HTMLImageElement).naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(src as any, 0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  // Grayscale + contrast (factor 1.4) + threshold-soft for noise reduction
  const contrast = 1.4;
  const intercept = 128 * (1 - contrast);
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    let v = contrast * gray + intercept;
    if (v < 0) v = 0;
    else if (v > 255) v = 255;
    // light denoise: clamp near-white / near-black
    if (v > 235) v = 255;
    else if (v < 40) v = 0;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);

  // Sharpen via a 3x3 convolution
  const sharpened = sharpen(ctx, w, h);
  return sharpened;
}

function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number): HTMLCanvasElement {
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let r = 0;
      let idx = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const p = ((y + ky) * w + (x + kx)) * 4;
          r += src.data[p] * k[idx++];
        }
      }
      const o = (y * w + x) * 4;
      const v = Math.max(0, Math.min(255, r));
      out.data[o] = out.data[o + 1] = out.data[o + 2] = v;
      out.data[o + 3] = 255;
    }
  }
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.putImageData(out, 0, 0);
  return c;
}

/** Strip non-printable junk, fix spacing and line breaks. */
export function cleanText(raw: string): string {
  if (!raw) return "";
  return raw
    // remove control chars except newline/tab
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    // common OCR junk symbols
    .replace(/[¤¦§¨©«¬®¯°±´¸»¿×÷]/g, "")
    // collapse 3+ blank lines
    .replace(/\n{3,}/g, "\n\n")
    // collapse runs of spaces / tabs
    .replace(/[ \t]{2,}/g, " ")
    // join hyphenated line breaks (e.g. "exam-\nple" → "example")
    .replace(/(\w)-\n(\w)/g, "$1$2")
    // trim each line
    .split("\n")
    .map((l) => l.replace(/\s+$/g, "").replace(/^\s+/g, ""))
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
}

/** Load an image file into an HTMLImageElement. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/** Full pipeline: file → cleaned text. */
export async function processFile(file: File, onProgress?: OcrProgress): Promise<string> {
  const Tesseract: any = await import("tesseract.js");
  const langs = "eng+fra";

  // Build the list of canvases to OCR
  let canvases: HTMLCanvasElement[] = [];
  onProgress?.({ step: "Preparing document...", progress: 5 });

  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
    onProgress?.({ step: "Rendering PDF pages at 300 DPI...", progress: 10 });
    const pages = await pdfToImages(file, 300, 5);
    onProgress?.({ step: "Preprocessing pages...", progress: 25 });
    canvases = pages.map((c) => preprocessCanvas(c));
  } else if (file.type.startsWith("image/")) {
    onProgress?.({ step: "Loading image...", progress: 10 });
    const img = await loadImage(file);
    onProgress?.({ step: "Preprocessing image...", progress: 20 });
    canvases = [preprocessCanvas(img)];
  } else {
    // Plain text fallback
    const text = await file.text().catch(() => "");
    onProgress?.({ step: "Reading text...", progress: 90 });
    return cleanText(text);
  }

  let combined = "";
  for (let i = 0; i < canvases.length; i++) {
    const base = 30 + (i / canvases.length) * 60;
    onProgress?.({
      step: `OCR (eng + fra) · page ${i + 1}/${canvases.length}...`,
      progress: Math.round(base),
    });
    const blob: Blob = await new Promise((res) =>
      canvases[i].toBlob((b) => res(b!), "image/png")
    );
    const { data } = await Tesseract.recognize(blob, langs, {
      logger: (m: any) => {
        if (m.status === "recognizing text") {
          const pct = base + (m.progress * 60) / canvases.length;
          onProgress?.({
            step: `Recognizing characters · page ${i + 1}/${canvases.length}`,
            progress: Math.min(95, Math.round(pct)),
          });
        }
      },
    });
    combined += (data?.text || "") + "\n\n";
    onProgress?.({ step: `Page ${i + 1} done`, progress: Math.min(95, Math.round(base + 60 / canvases.length)), preview: cleanText(combined) });
  }

  onProgress?.({ step: "Cleaning text...", progress: 97 });
  return cleanText(combined);
}