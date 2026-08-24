import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type PdfFormat = "a4" | "receipt";

const PDF_SAFE_STYLE_PROPERTIES = [
  "display", "position", "box-sizing", "width", "min-width", "max-width",
  "height", "min-height", "max-height", "margin", "margin-top", "margin-right",
  "margin-bottom", "margin-left", "padding", "padding-top", "padding-right",
  "padding-bottom", "padding-left", "border", "border-top", "border-right",
  "border-bottom", "border-left", "border-radius", "background-color", "color",
  "font-family", "font-size", "font-weight", "font-style", "line-height",
  "letter-spacing", "text-align", "text-transform", "white-space", "overflow",
  "overflow-x", "overflow-y", "flex-direction", "flex-wrap", "flex-grow",
  "flex-shrink", "flex-basis", "justify-content", "align-items", "align-content",
  "align-self", "gap", "row-gap", "column-gap", "grid-template-columns",
  "grid-template-rows", "grid-column", "grid-row", "vertical-align",
] as const;

function isPdfSafeCssValue(value: string) {
  return !/\b(?:lab|oklab|lch|oklch|color)\(/i.test(value);
}

function copyPdfSafeStyles(source: HTMLElement, clone: HTMLElement) {
  const sourceElements = [source, ...Array.from(source.querySelectorAll<HTMLElement>("*"))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];

  sourceElements.forEach((sourceElement, index) => {
    const cloneElement = cloneElements[index];
    if (!cloneElement) return;

    const computed = window.getComputedStyle(sourceElement);
    PDF_SAFE_STYLE_PROPERTIES.forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (value && isPdfSafeCssValue(value)) {
        cloneElement.style.setProperty(property, value, "important");
      }
    });
  });
}

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
  // html2canvas cannot parse Tailwind v4's lab()/oklch() values. Removing the
  // source classes keeps those application styles out of the capture entirely.
  // The safe stylesheet below supplies the document layout used in the PDF.
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  clone.querySelectorAll<HTMLElement>("*").forEach((element) => {
    element.removeAttribute("class");
    element.removeAttribute("style");
  });
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
    [data-pdf-host] header,
    [data-pdf-host] section,
    [data-pdf-host] div {
      box-sizing: border-box !important;
    }
    [data-pdf-host] table {
      width: 100% !important;
      border-collapse: collapse !important;
    }
    [data-pdf-host] th,
    [data-pdf-host] td {
      padding: 10px 12px !important;
      border: 1px solid #d4d4d8 !important;
      vertical-align: top !important;
    }
    [data-pdf-host] p {
      margin: 0 0 4px !important;
    }
  `;

  host.appendChild(style);
  host.appendChild(clone);
  document.body.appendChild(host);
  copyPdfSafeStyles(source, clone);

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
      // A cross-origin logo must not taint the canvas; otherwise toDataURL()
      // throws and the entire PDF download fails.
      allowTaint: false,
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
