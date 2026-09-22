// business-structure-data loader — แปลง JSON เป็น global BSD สำหรับ recruit-step1-structure.html
let BSD = null;
try {
  BSD = null; // โหลดแบบ fetch เพื่อไม่บล็อก render
  fetch('business-structure-data.json')
    .then(r => r.json())
    .then(j => {
      BSD = j;
      // re-render ถ้าหน้าพร้อม
      if (typeof window !== 'undefined' && window.__bsdataReady) window.__bsdataReady(BSD);
    })
    .catch(() => {});
} catch (e) {}
window.BUSINESS_STRUCTURE_DATA = null;
