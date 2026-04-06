// Real PDF Generator for JobForge using Puppeteer
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const OUTPUT = 'output';

// Generate PDF from job report
export async function generatePdf(reportFile, pdfFile, options = {}) {
  const { margin = '1cm', format = 'A4' } = options;
  
  const htmlContent = fs.readFileSync(reportFile, 'utf8');
  const title = htmlContent.match(/^#\s+(.+)$/m)?.[1] || 'Job Application';
  
  // Convert markdown to HTML (simplified)
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    ul { background: #f5f5f5; padding: 15px 30px; border-radius: 5px; }
    li { margin: 5px 0; }
    .score { font-size: 1.5em; color: #0066cc; font-weight: bold; }
    .recommend { display: inline-block; padding: 5px 15px; border-radius: 3px; font-weight: bold; }
    .recommend.apply { background: #22c55e; color: white; }
    .recommend.shortlisted { background: #f59e0b; color: white; }
  </style>
</head>
<body>
${htmlContent.replace(/^#\s+(.+)$/m, '<h1>$1</h1>')}
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: pdfFile,
    format,
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    printBackground: true
  });
  
  await browser.close();
  return pdfFile;
}

// CLI: node pdfgen.mjs <report.md> [output.pdf]
const reportPath = process.argv[2];
const pdfPath = process.argv[3];

if (reportPath && fs.existsSync(reportPath)) {
  const outPath = pdfPath || reportPath.replace(/\.md$/, '.pdf');
  generatePdf(reportPath, outPath).then(() => {
    console.log(`PDF generated: ${outPath}`);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else if (reportPath) {
  console.error(`Report not found: ${reportPath}`);
  process.exit(1);
}