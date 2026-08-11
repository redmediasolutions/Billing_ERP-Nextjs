import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type PdfFormat = "a4" | "receipt";

/**
 * html2canvas breaks on modern CSS color spaces (oklch/lab) used by Tailwind v4.
 * Clone the node into an isolated offscreen host with only hex/rgb-safe styles.
 */
function createPrintSafeClone(source: HTMLElement) {
  const host = document.createElement("div");
  host.setAttribute("data-pdf-host", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "z-index:-1",
    "background:#ffffff",
    "padding:0",
    "margin:0",
  ].join(";");

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.cssText = [
    "background:#ffffff",
    "color:#09090b",
    "width:" + Math.max(source.scrollWidth, source.clientWidth) + "px",
    "box-shadow:none",
    "transform:none",
  ].join(";");

  const style = document.createElement("style");
  style.textContent = `
    [data-pdf-host], [data-pdf-host] * {
      color: #09090b !important;
      border-color: #d4d4d8 !important;
      outline-color: #d4d4d8 !important;
      text-shadow: none !important;
      box-shadow: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    [data-pdf-host] {
      background: #ffffff !important;
    }
    [data-pdf-host] thead,
    [data-pdf-host] thead th {
      background: #09090b !important;
      color: #ffffff !important;
      border-color: #09090b !important;
    }
    [data-pdf-host] .bg-zinc-50,
    [data-pdf-host] [class*="bg-zinc-50"] {
      background: #fafafa !important;
    }
    [data-pdf-host] img {
      max-width: 100% !important;
    }
  `;

  host.appendChild(style);
  host.appendChild(clone);
  document.body.appendChild(host);

  return { host, clone };
}

export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
  format: PdfFormat = "a4"
) {
  const { host, clone } = createPrintSafeClone(element);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
    });

    if (!canvas.width || !canvas.height) {
      throw new Error("Unable to capture document for PDF.");
    }

    const image = canvas.toDataURL("image/png");

    if (format === "receipt") {
      const widthMm = 80;
      const heightMm = Math.max(120, (canvas.height * widthMm) / canvas.width);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [widthMm, heightMm],
      });
      pdf.addImage(image, "PNG", 0, 0, widthMm, heightMm);
      pdf.save(filename);
      return;
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imageHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imageHeight;
    let position = 0;

    pdf.addImage(image, "PNG", 0, position, pageWidth, imageHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imageHeight;
      pdf.addPage();
      pdf.addImage(image, "PNG", 0, position, pageWidth, imageHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    host.remove();
  }
}
