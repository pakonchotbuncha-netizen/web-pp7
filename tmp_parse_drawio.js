const fs=require('fs');
const zlib=require('zlib');
const xml=fs.readFileSync('/tmp/pm002.drawio','utf8');
const diagrams=[...xml.matchAll(/<diagram[^>]*>([\s\S]*?)<\/diagram>/g)].map(m=>m[1].trim());
if(!diagrams.length){console.log('NO_DIAGRAM');process.exit(0)}
for(let i=0;i<diagrams.length;i++){
  const data=diagrams[i];
  console.log(`---DIAGRAM ${i+1}---`);
  try{
    const buf=Buffer.from(decodeURIComponent(data),'base64');
    const out=zlib.inflateRawSync(buf).toString('utf8');
    console.log(out.slice(0,30000));
  } catch(e) {
    console.log(data.slice(0,30000));
  }
}
