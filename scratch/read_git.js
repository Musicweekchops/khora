const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to read and inflate a git object
function readGitObject(hash) {
  const folder = hash.substring(0, 2);
  const file = hash.substring(2);
  const objPath = path.join('/Users/arnaldoallende/Documents/GitHub/khora/.git/objects', folder, file);
  
  if (!fs.existsSync(objPath)) {
    // Check packed refs if not loose
    return null;
  }
  
  const buffer = fs.readFileSync(objPath);
  const decompressed = zlib.inflateSync(buffer);
  
  // Format is [type] [size]\0[content]
  const nullIndex = decompressed.indexOf(0);
  const header = decompressed.slice(0, nullIndex).toString();
  const content = decompressed.slice(nullIndex + 1);
  const [type, size] = header.split(' ');
  
  return { type, size: parseInt(size, 10), content };
}

// Helper to parse tree content
function parseTree(content) {
  const entries = [];
  let pos = 0;
  while (pos < content.length) {
    const spaceIndex = content.indexOf(32, pos); // space character
    const mode = content.slice(pos, spaceIndex).toString();
    
    const nullIndex = content.indexOf(0, spaceIndex);
    const name = content.slice(spaceIndex + 1, nullIndex).toString();
    
    const hash = content.slice(nullIndex + 1, nullIndex + 21).toString('hex');
    entries.push({ mode, name, hash });
    pos = nullIndex + 21;
  }
  return entries;
}

// Find blob hash of a file path in a tree recursively
function findInTree(treeHash, parts) {
  const obj = readGitObject(treeHash);
  if (!obj || obj.type !== 'tree') return null;
  
  const entries = parseTree(obj.content);
  const currentPart = parts[0];
  const entry = entries.find(e => e.name === currentPart);
  
  if (!entry) return null;
  
  if (parts.length === 1) {
    return entry.hash;
  } else {
    return findInTree(entry.hash, parts.slice(1));
  }
}

// Let's read the commit from the log
const commitHash = "55210e4e17a2befe3e08b7f448095ebd89c974cd";
const commitObj = readGitObject(commitHash);
if (!commitObj) {
  console.log("Commit object not found. It might be packed.");
  process.exit(1);
}

const commitText = commitObj.content.toString();
const treeLine = commitText.split('\n')[0];
const treeHash = treeLine.split(' ')[1];

console.log("Tree Hash:", treeHash);

// Find the file: supabase/functions/mercadopago-checkout/index.ts
const filePathParts = ["supabase", "functions", "mercadopago-checkout", "index.ts"];
const blobHash = findInTree(treeHash, filePathParts);

if (blobHash) {
  console.log("Blob Hash:", blobHash);
  const blobObj = readGitObject(blobHash);
  if (blobObj) {
    console.log("=== FILE CONTENT ===");
    console.log(blobObj.content.toString());
  } else {
    console.log("Blob object not found. It might be packed.");
  }
} else {
  console.log("File not found in tree.");
}
