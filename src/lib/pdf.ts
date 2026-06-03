// PDF Export utility using the browser's built-in print-to-PDF
// In a production app, use @react-pdf/renderer or puppeteer

export function printDashboardToPDF(elementId: string, filename = 'dashboard-report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules || [])
          .map((rule) => rule.cssText)
          .join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Báo cáo học tập</title>
        <style>${styles}</style>
        <style>
          @page { margin: 15mm; size: A4; }
          body { font-family: system-ui, sans-serif; padding: 0; }
          .no-print { display: none !important; }
          @media print {
            .dashboard-grid { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>${element.outerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export async function savePDFToSupabase(studentId: string, periodStart: string, periodEnd: string) {
  // In production, send the HTML to a serverless function that uses puppeteer
  // to render and upload the PDF to Supabase Storage
  console.log(`[MOCK] Saving PDF for ${studentId}: ${periodStart}_${periodEnd}.pdf`);

  return {
    url: `/reports/${studentId}/${periodStart}_${periodEnd}.pdf`,
    path: `reports/${studentId}/${periodStart}_${periodEnd}.pdf`,
  };
}
