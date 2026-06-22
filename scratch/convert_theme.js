const fs = require('fs');
const path = require('path');

const fileReplacements = {
  'app/agendar/page.tsx': [
    ['bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-neutral-800 flex items-center justify-center gap-2', 'bg-white hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-neutral-200 flex items-center justify-center gap-2 shadow-sm'],
    ['bg-neutral-900/60 border border-neutral-800 p-5 shadow-xl backdrop-blur-xl', 'bg-white border border-neutral-200/80 p-5 shadow-sm'],
    ['bg-neutral-900/40 border border-neutral-800 hover:border-amber-500/50 hover:bg-amber-950/10 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden', 'bg-white border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/20 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden'],
    ['kh-skeleton h-16 bg-neutral-900', 'kh-skeleton h-16 bg-neutral-250'],
    ['bg-neutral-900/30 rounded-2xl border border-neutral-800 p-8 text-center', 'bg-white rounded-2xl border border-neutral-200/80 p-8 text-center'],
    ['bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-neutral-700 transition-all', 'bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-neutral-300 transition-all shadow-sm'],
    ['p-6 bg-neutral-950 border border-neutral-900', 'p-6 bg-white border border-neutral-200'],
    ['bg-neutral-800 border border-neutral-700 text-white px-2.5 py-1 rounded-md uppercase tracking-wider', 'bg-neutral-100 border border-neutral-200 text-neutral-800 px-2.5 py-1 rounded-md uppercase tracking-wider'],
    ['border border-neutral-800 rounded-2xl hover:border-violet-500 hover:bg-neutral-950/10 transition-all text-left bg-neutral-950', 'border border-neutral-200 rounded-2xl hover:border-violet-500 hover:bg-violet-50/20 transition-all text-left bg-white shadow-sm'],
    ['kh-skeleton h-12 bg-neutral-900', 'kh-skeleton h-12 bg-neutral-200'],
    ['bg-neutral-950 hover:bg-neutral-900 text-neutral-300 border border-neutral-800', 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 shadow-sm'],
    ['bg-neutral-950/20 text-neutral-600 border-neutral-900/60', 'bg-neutral-100 text-neutral-400 border-neutral-200/50'],
    ['bg-neutral-900 text-neutral-600', 'bg-neutral-100 text-neutral-400'],
    ['text-white px-2.5 py-1 rounded-md uppercase tracking-wider', 'text-neutral-800 px-2.5 py-1 rounded-md uppercase tracking-wider']
  ]
};

const root = path.join(__dirname, '..');

for (const [relPath, replacements] of Object.entries(fileReplacements)) {
  const absPath = path.join(root, relPath);
  if (!fs.existsSync(absPath)) {
    console.log(`Skipping: ${relPath} (does not exist)`);
    continue;
  }

  let content = fs.readFileSync(absPath, 'utf8');
  let replacedCount = 0;

  for (const [target, replacement] of replacements) {
    if (content.includes(target)) {
      content = content.split(target).join(replacement);
      replacedCount++;
    }
  }

  fs.writeFileSync(absPath, content, 'utf8');
  console.log(`Updated ${relPath} (${replacedCount} remaining patterns replaced)`);
}
console.log('Clean up completed.');
