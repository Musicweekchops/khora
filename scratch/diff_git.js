const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function readGitObject(hash) {
  const folder = hash.substring(0, 2);
  const file = hash.substring(2);
  const objPath = path.join('/Users/arnaldoallende/Documents/GitHub/khora/.git/objects', folder, file);
  
  if (!fs.existsSync(objPath)) return null;
  
  const buffer = fs.readFileSync(objPath);
  const decompressed = zlib.inflateSync(buffer);
  
  const nullIndex = decompressed.indexOf(0);
  const header = decompressed.slice(0, nullIndex).toString();
  const content = decompressed.slice(nullIndex + 1);
  const [type, size] = header.split(' ');
  
  return { type, size: parseInt(size, 10), content };
}

function parseTree(content) {
  const entries = [];
  let pos = 0;
  while (pos < content.length) {
    const spaceIndex = content.indexOf(32, pos);
    const mode = content.slice(pos, spaceIndex).toString();
    const nullIndex = content.indexOf(0, spaceIndex);
    const name = content.slice(spaceIndex + 1, nullIndex).toString();
    const hash = content.slice(nullIndex + 1, nullIndex + 21).toString('hex');
    entries.push({ mode, name, hash });
    pos = nullIndex + 21;
  }
  return entries;
}

function findInTree(treeHash, parts) {
  const obj = readGitObject(treeHash);
  if (!obj || obj.type !== 'tree') return null;
  const entries = parseTree(obj.content);
  const entry = entries.find(e => e.name === parts[0]);
  if (!entry) return null;
  if (parts.length === 1) return entry.hash;
  return findInTree(entry.hash, parts.slice(1));
}

function getFileInCommit(commitHash, filePath) {
  const commitObj = readGitObject(commitHash);
  if (!commitObj) return null;
  const commitText = commitObj.content.toString();
  const treeHash = commitText.split('\n')[0].split(' ')[1];
  return findInTree(treeHash, filePath.split('/'));
}

const file = "supabase/functions/mercadopago-checkout/index.ts";
const hash1 = getFileInCommit("55210e4e17a2befe3e08b7f448095ebd89c974cd", file);
const hash2 = getFileInCommit("407f937bf2d24424ce2ffbbbe48e4e575cf04342", file);

const content1 = readGitObject(hash1).content.toString();
const content2 = readGitObject(hash2).content.toString();

const lines1 = content1.split('\n');
const lines2 = content2.split('\n');

console.log("=== DIFF ===");
// Simple line-by-line diff
let max = Math.max(lines1.length, lines2.length);
for (let i = 0; i < max; i++) {
  if (lines1[i] !== lines2[i]) {
    console.log(`Line ${i + 1}:`);
    console.log(`- ${lines1[i] || ''}`);
    console.log(`+ ${lines2[i] || ''}`);
    console.log("-------------------");
  }
}
