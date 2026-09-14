/*!
 * gas-retry.js — Web PP7 Succession
 * กู้คิวข้อมูลจาก localStorage ส่งซ้ำไปยัง backend GAS กลางอัตโนมัติ
 *  - 'pkg_gas_retry'   → array ของ payload {action:'saveMember', member, group, level, data}  (ฟอร์มสมาชิกรายคน)
 *  - 'pkg_gas_retry_v2'→ array ของ payload {action:'submitSuccessionEntry', spreadsheetId, data} (ฟอร์มบันทึกประเด็น)
 * รันทันทีที่โหลด + ทุก 60 วินาที (จำกัด 5 รายการ/รอบ)
 */
(function () {
  'use strict';

  var GAS_RETRY_URL = 'https://script.google.com/macros/s/AKfycbwGWjI5cZkt80HOC6JNrn9RtjwrDRuPa4DDjapM8-LosR4o00310pwcIoS_j8bKP1OW/exec';

  function readQueue(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function writeQueue(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* พื้นที่เต็ม — ปล่อยผ่าน ข้อมูลยังอยู่ในเครื่องผู้ใช้ */ }
  }

  // ส่ง payload ไป backend — สำเร็จจริง (HTTP 2xx + JSON success) → true
  function sendOne(payload) {
    var action = payload && payload.action;
    if (action !== 'saveMember' && action !== 'submitSuccessionEntry') {
      return Promise.resolve(true); // payload ไม่รู้จัก → เอาออกจากคิว (ส่งซ้ำไม่มีประโยชน์)
    }
    return fetch(GAS_RETRY_URL + '?action=' + encodeURIComponent(action), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) return false;
      return res.json().then(function (j) {
        return !!(j && j.success);
      }).catch(function () {
        return false; // ไม่มี JSON กลับ = backend ตอบไม่ถูกรูปแบบ → ถือว่ายังไม่สำเร็จ เก็บคิวไว้ส่งซ้ำ
      });
    }).catch(function () {
      return false;
    });
  }

  function flushQueue(key) {
    var q = readQueue(key);
    if (!q.length) return;
    var batch = q.slice(0, 5);
    var rest = q.slice(5);
    var pending = batch.length;
    batch.forEach(function (payload) {
      sendOne(payload).then(function (ok) {
        if (ok) {
          rest = rest.filter(function (p) { return p !== payload; });
          console.log('[gas-retry] ส่งสำเร็จ (' + key + '):', payload.member || payload.data && payload.data.a1_name || payload.action);
        }
        pending--;
        if (pending === 0) {
          writeQueue(key, rest);
          console.log('[gas-retry] คงเหลือคิว ' + key + ': ' + rest.length + ' รายการ');
        }
      });
    });
  }

  function run() {
    flushQueue('pkg_gas_retry');
    flushQueue('pkg_gas_retry_v2');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setInterval(run, 60000);
})();
