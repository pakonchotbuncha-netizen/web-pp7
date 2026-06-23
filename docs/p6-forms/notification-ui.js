// Notification UI Functions

// แสดง Modal
function showModal(content) {
  const modal = document.getElementById('notificationModal');
  const modalContent = document.getElementById('notificationModalContent');
  modalContent.innerHTML = content;
  modal.classList.remove('hidden');
}

// ปิด Modal
function closeModal() {
  const modal = document.getElementById('notificationModal');
  modal.classList.add('hidden');
}

// แสดงประวัติการแจ้งเตือน
function showNotificationHistory() {
  if (typeof Notifications === 'undefined') {
    alert('❌ ระบบ Notification ยังไม่ได้โหลด');
    return;
  }

  const history = Notifications.getNotificationHistory();
  
  if (history.length === 0) {
    alert('📭 ยังไม่มีการแจ้งเตือน');
    return;
  }

  let html = '<div style="max-height:600px;overflow-y:auto;">';
  html += '<h2 style="font-size:1.5rem;font-weight:bold;margin-bottom:1rem;">🔔 ประวัติการแจ้งเตือน</h2>';
  
  history.forEach(notif => {
    const timestamp = new Date(notif.timestamp).toLocaleString('th-TH');
    const icon = notif.type === 'inc_points_added' ? '💎' :
                 notif.type === 'payroll_processed' ? '💵' :
                 notif.type === 'retirement_alert' ? '👴' :
                 notif.type === 'import_success' ? '✅' :
                 notif.type === 'import_error' ? '❌' : '📌';
    
    html += `
      <div style="border:1px solid #e5e7eb;border-radius:0.5rem;padding:1rem;margin-bottom:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <span style="font-weight:600;">${icon} ${notif.type.replace(/_/g, ' ')}</span>
          <span style="color:#6b7280;font-size:0.875rem;">${timestamp}</span>
        </div>
        <div style="background:#f9fafb;padding:0.75rem;border-radius:0.375rem;white-space:pre-wrap;font-size:0.875rem;">${notif.message}</div>
      </div>
    `;
  });
  
  html += '</div>';
  html += '<button onclick="clearAllNotifications()" style="margin-top:1rem;padding:0.5rem 1rem;background:#ef4444;color:white;border-radius:0.375rem;">🗑️ ล้างประวัติทั้งหมด</button>';
  html += '<button onclick="closeModal()" style="margin-top:1rem;margin-left:0.5rem;padding:0.5rem 1rem;background:#6b7280;color:white;border-radius:0.375rem;">ปิด</button>';
  
  showModal(html);
}

// แสดงหน้าตั้งค่า Notification
function showNotificationSettings() {
  const telegramToken = localStorage.getItem('telegram_bot_token') || '';
  const lineToken = localStorage.getItem('line_channel_token') || '';
  const lineSecret = localStorage.getItem('line_channel_secret') || '';

  let html = `
    <h2 style="font-size:1.5rem;font-weight:bold;margin-bottom:1rem;">⚙️ ตั้งค่าการแจ้งเตือน</h2>
    
    <div style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.125rem;font-weight:600;margin-bottom:0.5rem;">📱 Telegram</h3>
      <label style="display:block;margin-bottom:0.25rem;font-size:0.875rem;">Bot Token:</label>
      <input type="password" id="telegramToken" value="${telegramToken}" placeholder="123456789:ABC..." 
             style="width:100%;padding:0.5rem;border:1px solid #d1d5db;border-radius:0.375rem;">
      <p style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">
        ได้จาก @BotFather บน Telegram
      </p>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.125rem;font-weight:600;margin-bottom:0.5rem;">💚 LINE</h3>
      <label style="display:block;margin-bottom:0.25rem;font-size:0.875rem;">Channel Access Token:</label>
      <input type="password" id="lineToken" value="${lineToken}" placeholder="..." 
             style="width:100%;padding:0.5rem;border:1px solid #d1d5db;border-radius:0.375rem;margin-bottom:0.75rem;">
      
      <label style="display:block;margin-bottom:0.25rem;font-size:0.875rem;">Channel Secret:</label>
      <input type="password" id="lineSecret" value="${lineSecret}" placeholder="..." 
             style="width:100%;padding:0.5rem;border:1px solid #d1d5db;border-radius:0.375rem;">
      <p style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">
        ได้จาก LINE Developers Console
      </p>
    </div>

    <div style="display:flex;gap:0.5rem;">
      <button onclick="saveNotificationSettings()" style="padding:0.5rem 1rem;background:#10b981;color:white;border-radius:0.375rem;font-weight:600;">💾 บันทึก</button>
      <button onclick="testNotification()" style="padding:0.5rem 1rem;background:#3b82f6;color:white;border-radius:0.375rem;font-weight:600;">🧪 ทดสอบ</button>
      <button onclick="closeModal()" style="padding:0.5rem 1rem;background:#6b7280;color:white;border-radius:0.375rem;">ปิด</button>
    </div>
  `;

  showModal(html);
}

// บันทึกการตั้งค่า
function saveNotificationSettings() {
  const telegramToken = document.getElementById('telegramToken').value.trim();
  const lineToken = document.getElementById('lineToken').value.trim();
  const lineSecret = document.getElementById('lineSecret').value.trim();

  if (telegramToken) {
    localStorage.setItem('telegram_bot_token', telegramToken);
  }
  if (lineToken) {
    localStorage.setItem('line_channel_token', lineToken);
  }
  if (lineSecret) {
    localStorage.setItem('line_channel_secret', lineSecret);
  }

  if (typeof Notifications !== 'undefined') {
    Notifications.loadConfig();
  }

  alert('✅ บันทึกการตั้งค่าเรียบร้อย!');
  closeModal();
}

// ทดสอบการแจ้งเตือน
async function testNotification() {
  const telegramToken = document.getElementById('telegramToken').value.trim();
  
  if (!telegramToken) {
    alert('❌ กรุณาใส่ Telegram Bot Token ก่อน');
    return;
  }

  try {
    const testNotif = new NotificationSystem();
    testNotif.setTelegramToken(telegramToken);
    
    const testMember = {
      member_id: 'TEST001',
      name: 'ทดสอบ ระบบ',
      telegram_id: '123456789'
    };
    
    const result = await testNotif.notifyINCPointsAdded(testMember, 100, 10);
    
    if (result.telegram) {
      alert('✅ ส่งข้อความทดสอบสำเร็จ!\n\nตรวจสอบ Telegram ของคุณ');
    } else {
      alert('❌ ส่งข้อความไม่สำเร็จ\n\nตรวจสอบ Token และ Chat ID');
    }
  } catch (error) {
    alert('❌ เกิดข้อผิดพลาด: ' + error.message);
  }
}

// ล้างประวัติทั้งหมด
function clearAllNotifications() {
  if (confirm('🗑️ ต้องการล้างประวัติการแจ้งเตือนทั้งหมด?')) {
    Notifications.clearNotificationHistory();
    updateNotificationCount();
    closeModal();
    alert('✅ ล้างประวัติเรียบร้อย!');
  }
}

// อัพเดทจำนวน notification badge
function updateNotificationCount() {
  if (typeof Notifications === 'undefined') return;
  
  const history = Notifications.getNotificationHistory();
  const countEl = document.getElementById('notifCount');
  if (countEl) {
    countEl.textContent = history.length;
  }
}

// Auto-update count เมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', () => {
  updateNotificationCount();
});
