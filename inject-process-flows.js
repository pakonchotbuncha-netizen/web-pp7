#!/usr/bin/env node
const fs = require('fs');

// อ่าน index.html ปัจจุบัน
let indexHtml = fs.readFileSync('index.html', 'utf8');
const processFlows = fs.readFileSync('process-flows.html', 'utf8');

// Extract process flow sections จาก process-flows.html
const extractPanel = (tabName) => {
  const regex = new RegExp(`<!-- TAB: ${tabName} -->[\\s\\S]*?<\\/div>\\s*<\\/div>\\s*<\\/div>`);
  const match = processFlows.match(regex);
  return match ? match[0] : null;
};

// Tab mapping: index.html tab id → process flow name
const tabMappings = [
  { index: 'tab-executive', process: 'executive' },
  { index: 'tab-recruit', process: 'recruit' },
  { index: 'tab-assess', process: 'assess' },
  { index: 'tab-match', process: 'match' },
  { index: 'tab-performance', process: 'performance' },
  { index: 'tab-develop', process: 'develop' },
  { index: 'tab-welfare', process: 'welfare' },
  { index: 'tab-quality', process: 'quality' },
  { index: 'tab-labor-law', process: 'labor-law' },
  { index: 'tab-pkg-rules', process: 'pkg-rules' },
  { index: 'tab-reports', process: 'reports' },
  { index: 'tab-data-exchange', process: 'data-exchange' },
  { index: 'tab-system-map', process: 'system-map' },
];

// Inject process flows
tabMappings.forEach(({ index, process }) => {
  const panel = extractPanel(process);
  if (!panel) {
    console.log(`⚠️  No process flow found for: ${process}`);
    return;
  }

  // หา closing </section> ของ tab นี้
  const tabStart = indexHtml.indexOf(`id="${index}"`);
  if (tabStart === -1) return;

  // หา closing </section> ถัดไป
  const sectionEnd = indexHtml.indexOf('</section>', tabStart);
  if (sectionEnd === -1) return;

  // Inject เป็น section แยก (process-flow section)
  const processFlowSection = `
<!-- Process Flow: ${process} -->
<section class="tab-pane" data-process="${process}">
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span>🔄</span> กระบวนการใหม่ — ${process}
    </h2>
    ${panel}
  </div>
</section>`;

  // แทรกก่อน </section>
  indexHtml = indexHtml.slice(0, sectionEnd) + '\n' + processFlowSection + '\n' + indexHtml.slice(sectionEnd);
  console.log(`✅ Injected: ${index} ← ${process}`);
});

// เขียนกลับ
fs.writeFileSync('index.html', indexHtml);
console.log('\n✅ Done! index.html updated');
