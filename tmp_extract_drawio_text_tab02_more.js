const fs=require('fs');
const zlib=require('zlib');
const xml=fs.readFileSync('/tmp/tab02_more.drawio','utf8');
const diagrams=[...xml.matchAll(/<diagram[^>]*>([\s\S]*?)<\/diagram>/g)].map(m=>m[1].trim());
function decode(d){
  try{
    const buf=Buffer.from(decodeURIComponent(d),'base64');
    return zlib.inflateRawSync(buf).toString('utf8');
  }catch(e){return d}
}
function strip(s){
  return s
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<\/p>/gi,'\n')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/g,' ')
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"')
    .replace(/\s+\n/g,'\n').replace(/\n\s+/g,'\n')
    .replace(/[ \t]+/g,' ')
    .trim();
}
for (const d of diagrams){
  const decoded=decode(d);
  const vals=[...decoded.matchAll(/value="([\s\S]*?)"(?:\s|>)/g)].map(m=>strip(m[1])).filter(Boolean);
  vals.forEach(v=>console.log(v.replace(/\n+/g,' | ')));
}
