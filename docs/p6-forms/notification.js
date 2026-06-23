// ====== Notification System for Web PP7 ======
// ระบบแจ้งเตือน LINE/Telegram สำหรับ P6

class NotificationSystem {
  constructor() {
    this.config = {
      telegram_bot_token: null, // จะตั้งค่าภายหลัง
      line_channel_token: null,
      line_channel_secret: null
    };
    
    this.templates = {
      // INC Points Notification
      inc_points_added: (member, points, amount) => 
        `💎 INC Points เพิ่มแล้ว!\n\n` +
        `👤 สมาชิก: ${member.name}\n` +
        `🆔 รหัส: ${member.member_id}\n` +
        `💰 จำนวนเงิน: ฿${amount.toLocaleString()}\n` +
        `💎 Points ได้รับ: ${points.toLocaleString()} P\n` +
        `📅 วันที่: ${new Date().toLocaleDateString('th-TH')}\n\n` +
        `ใช้ Points ได้ที่ MSP App! 🎉`,
      
      // Payroll Notification
      payroll_processed: (month, totalMembers, totalAmount) =>
        `💵 เงินเดือนออกแล้ว!\n\n` +
        `📅 เดือน: ${month}\n` +
        `👥 จำนวนสมาชิก: ${totalMembers} คน\n` +
        `💰 รวมทั้งหมด: ฿${totalAmount.toLocaleString()}\n` +
        `✅ โอนเงินสำเร็จทุกบัญชี\n\n` +
        `ตรวจสอบสลิปเงินเดือนได้ที่ P6 Dashboard`,
      
      // Retirement Alert
      retirement_alert: (member, age, yearsOfWork) =>
        `👴 แจ้งเตือนสมาชิกใกล้เกษียณ\n\n` +
        `👤 ชื่อ: ${member.name}\n` +
        `🆔 รหัส: ${member.member_id}\n` +
        `🎂 อายุ: ${age} ปี\n` +
        `📅 อายุงาน: ${yearsOfWork} ปี\n` +
        `⚠️ เหลือเวลาอีก ${60 - age} ปี จะครบเกษียณ\n\n` +
        `ติดต่อสมาชิกเพื่อพูดคุยเรื่องแผนเกษียณ`,
      
      // Import Error Alert
      import_error: (fileName, errorCount, errors) =>
        `❌ พบข้อผิดพลาดในการ Import\n\n` +
        `📄 ไฟล์: ${fileName}\n` +
        `❌ จำนวนผิดพลาด: ${errorCount} รายการ\n\n` +
        `รายละเอียด:\n${errors.slice(0, 5).map(e => `• Row ${e.rowNum}: ${e.errors.join(', ')}`).join('\n')}` +
        (errors.length > 5 ? `\n... และอีก ${errors.length - 5} รายการ` : '') +
        `\n\nแก้ไขไฟล์แล้ว Import ใหม่`,
      
      // Import Success
      import_success: (fileName, validCount, totalPoints) =>
        `✅ Import สำเร็จ!\n\n` +
        `📄 ไฟล์: ${fileName}\n` +
        `✅ สำเร็จ: ${validCount} รายการ\n` +
        `💎 Points รวม: ${totalPoints.toLocaleString()} P\n\n` +
        `ข้อมูลถูกบันทึกในระบบแล้ว 🎉`
    };
  }

  // ====== Telegram Notifications ======
  async sendTelegram(chatId, message) {
    if (!this.config.telegram_bot_token) {
      console.warn('⚠️ Telegram bot token not configured');
      return false;
    }
    
    try {
      const url = `https://api.telegram.org/bot${this.config.telegram_bot_token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      const data = await response.json();
      if (data.ok) {
        console.log('✅ Telegram notification sent');
        return true;
      } else {
        console.error('❌ Telegram send failed:', data.description);
        return false;
      }
    } catch (error) {
      console.error('❌ Telegram error:', error);
      return false;
    }
  }

  // ====== LINE Notifications ======
  async sendLine(userId, message) {
    if (!this.config.line_channel_token) {
      console.warn('⚠️ LINE channel token not configured');
      return false;
    }
    
    try {
      const url = 'https://api.line.me/v2/bot/message/push';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.line_channel_token}`
        },
        body: JSON.stringify({
          to: userId,
          messages: [
            {
              type: 'text',
              text: message
            }
          ]
        })
      });
      
      if (response.ok) {
        console.log('✅ LINE notification sent');
        return true;
      } else {
        const error = await response.text();
        console.error('❌ LINE send failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ LINE error:', error);
      return false;
    }
  }

  // ====== High-Level Notification Methods ======
  
  async notifyINCPointsAdded(member, points, amount, channels = ['telegram', 'line']) {
    const message = this.templates.inc_points_added(member, points, amount);
    const results = {};
    
    if (channels.includes('telegram')) {
      results.telegram = await this.sendTelegram(member.telegram_id, message);
    }
    
    if (channels.includes('line')) {
      results.line = await this.sendLine(member.line_id, message);
    }
    
    // Log to notification history
    this.logNotification('inc_points_added', member.member_id, message, results);
    
    return results;
  }

  async notifyPayrollProcessed(month, totalMembers, totalAmount, channels = ['telegram']) {
    const message = this.templates.payroll_processed(month, totalMembers, totalAmount);
    const adminChatId = '-5106159211'; // PADClaw (beta) chat ID
    
    const results = {};
    if (channels.includes('telegram')) {
      results.telegram = await this.sendTelegram(adminChatId, message);
    }
    
    this.logNotification('payroll_processed', month, message, results);
    
    return results;
  }

  async notifyRetirementAlert(member, age, yearsOfWork, channels = ['telegram']) {
    const message = this.templates.retirement_alert(member, age, yearsOfWork);
    const adminChatId = '-5106159211';
    
    const results = {};
    if (channels.includes('telegram')) {
      results.telegram = await this.sendTelegram(adminChatId, message);
    }
    
    this.logNotification('retirement_alert', member.member_id, message, results);
    
    return results;
  }

  async notifyImportError(fileName, errors, channels = ['telegram']) {
    const message = this.templates.import_error(fileName, errors.length, errors);
    const adminChatId = '-5106159211';
    
    const results = {};
    if (channels.includes('telegram')) {
      results.telegram = await this.sendTelegram(adminChatId, message);
    }
    
    this.logNotification('import_error', fileName, message, results);
    
    return results;
  }

  async notifyImportSuccess(fileName, validCount, totalPoints, channels = ['telegram']) {
    const message = this.templates.import_success(fileName, validCount, totalPoints);
    const adminChatId = '-5106159211';
    
    const results = {};
    if (channels.includes('telegram')) {
      results.telegram = await this.sendTelegram(adminChatId, message);
    }
    
    this.logNotification('import_success', fileName, message, results);
    
    return results;
  }

  // ====== Notification History ======
  
  logNotification(type, target, message, results) {
    const history = JSON.parse(localStorage.getItem('notification_history') || '[]');
    
    history.push({
      type: type,
      target: target,
      message: message,
      results: results,
      timestamp: new Date().toISOString()
    });
    
    // เก็บแค่ 100 รายการล่าสุด
    if (history.length > 100) {
      history.shift();
    }
    
    localStorage.setItem('notification_history', JSON.stringify(history));
  }

  getNotificationHistory(limit = 20) {
    const history = JSON.parse(localStorage.getItem('notification_history') || '[]');
    return history.slice(-limit).reverse();
  }

  clearNotificationHistory() {
    localStorage.setItem('notification_history', '[]');
  }

  // ====== Configuration ======
  
  setTelegramToken(token) {
    this.config.telegram_bot_token = token;
    localStorage.setItem('telegram_bot_token', token);
  }

  setLineTokens(channelToken, channelSecret) {
    this.config.line_channel_token = channelToken;
    this.config.line_channel_secret = channelSecret;
    localStorage.setItem('line_channel_token', channelToken);
    localStorage.setItem('line_channel_secret', channelSecret);
  }

  loadConfig() {
    const token = localStorage.getItem('telegram_bot_token');
    if (token) this.config.telegram_bot_token = token;
    
    const lineToken = localStorage.getItem('line_channel_token');
    const lineSecret = localStorage.getItem('line_channel_secret');
    if (lineToken) this.config.line_channel_token = lineToken;
    if (lineSecret) this.config.line_channel_secret = lineSecret;
  }
}

// ====== Global Instance ======
const Notifications = new NotificationSystem();
Notifications.loadConfig();

// ====== Export ======
window.NotificationSystem = NotificationSystem;
window.Notifications = Notifications;

// ====== Demo Mode (สำหรับทดสอบ) ======
function demoNotification() {
  const demoMember = {
    member_id: 'PKG0001',
    name: 'สมชาย ใจดี',
    telegram_id: '123456789',
    line_id: 'U1234567890abcdef'
  };
  
  console.log('🎬 Starting Demo Notifications...');
  
  // Demo INC Points
  Notifications.notifyINCPointsAdded(demoMember, 5000, 500)
    .then(results => console.log('✅ INC Points Notification:', results));
  
  // Demo Payroll
  Notifications.notifyPayrollProcessed('2026-06', 150, 2500000)
    .then(results => console.log('✅ Payroll Notification:', results));
  
  // Demo Retirement Alert
  const nearRetirementMember = {
    member_id: 'PKG0099',
    name: 'วิชัย เกษียณสุข',
    telegram_id: '987654321'
  };
  Notifications.notifyRetirementAlert(nearRetirementMember, 58, 35)
    .then(results => console.log('✅ Retirement Alert:', results));
  
  // Show notification history
  setTimeout(() => {
    const history = Notifications.getNotificationHistory();
    console.log('📋 Notification History:', history);
  }, 1000);
}

// Uncomment เพื่อทดสอบ:
// demoNotification();
