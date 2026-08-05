// Web PP7 - Auto-fill Test Data
// วิธีใช้:
// 1. เปิดฟอร์ม: https://pakonchotbuncha-netizen.github.io/web-pp7/form-register.html
// 2. กด F12 → ไปที่แท็บ Console
// 3. Copy โค้ดทั้งหมดนี้ → Paste ใน Console → กด Enter
// 4. ฟอร์มจะถูกกรอกอัตโนมัติ → กดปุ่ม "ส่งใบสมัคร"

(function() {
    console.log('🚀 เริ่มกรอกข้อมูลทดสอบ...');
    
    // Section 1: ตำแหน่งที่สมัคร
    document.getElementById('position-open').value = 'it';
    document.getElementById('position-other').value = '';
    document.getElementById('salary').value = '35000';
    document.querySelector('input[name="appChannel"][value="website"]').checked = true;
    document.querySelector('input[name="source"][value="facebook"]').checked = true;
    
    // Section 2: ข้อมูลส่วนตัว (ภาษาไทย)
    document.getElementById('prefix-th').value = 'นาย';
    document.getElementById('firstname-th').value = 'สมชาย';
    document.getElementById('lastname-th').value = 'ใจดี';
    
    // ข้อมูลส่วนตัว (ภาษาอังกฤษ)
    document.getElementById('prefix-en').value = 'Mr';
    document.getElementById('firstname-en').value = 'Somchai';
    document.getElementById('lastname-en').value = 'Jaidi';
    
    document.getElementById('nickname').value = 'ชาย';
    document.getElementById('gender').value = 'male';
    document.getElementById('birthdate').value = '1990-05-15';
    document.getElementById('age').value = '36 ปี';
    document.getElementById('weight').value = '70';
    document.getElementById('height').value = '175';
    document.getElementById('blood').value = 'O';
    document.getElementById('ethnicity').value = 'thai';
    document.getElementById('nationality').value = 'thai';
    document.getElementById('education').value = 'bachelor';
    document.getElementById('major').value = 'วิทยาการคอมพิวเตอร์';
    
    // บัตรประชาชน
    document.getElementById('idcard').value = '1234567890123';
    document.getElementById('idcard-place').value = 'อำเภอเมือง กรุงเทพฯ';
    document.getElementById('idcard-issue').value = '2015-01-10';
    document.getElementById('idcard-expire').value = '2025-01-10';
    
    // Section 3: ที่อยู่ตามทะเบียนบ้าน
    document.getElementById('reg-house').value = '123/45';
    document.getElementById('reg-subdistrict').value = 'บางนา';
    document.getElementById('reg-district').value = 'บางนา';
    document.getElementById('reg-province').value = 'กรุงเทพฯ';
    document.getElementById('reg-postal').value = '10260';
    
    // Section 4: ที่อยู่ปัจจุบัน
    document.getElementById('cur-house').value = '456/78';
    document.getElementById('cur-subdistrict').value = 'พระโขนง';
    document.getElementById('cur-district').value = 'พระโขนง';
    document.getElementById('cur-province').value = 'กรุงเทพฯ';
    document.getElementById('cur-postal').value = '10260';
    document.getElementById('phone').value = '0812345678';
    document.getElementById('facebook').value = 'Somchai Jaidi';
    document.getElementById('line').value = 'somchai_j';
    document.querySelector('input[name="military"][value="passed"]').checked = true;
    
    // Section 5: ข้อมูลครอบครัว
    document.getElementById('marital').value = 'single';
    document.getElementById('children').value = '0';
    document.getElementById('family-info').value = '';
    document.getElementById('father').value = 'นายสมศักดิ์ ใจดี';
    document.getElementById('mother').value = 'นางสมศรี ใจดี';
    
    // Section 6: ความสามารถ
    document.querySelector('input[name="thai-listen"][value="4"]').checked = true;
    document.querySelector('input[name="thai-speak"][value="4"]').checked = true;
    document.querySelector('input[name="thai-read"][value="4"]').checked = true;
    document.querySelector('input[name="thai-write"][value="4"]').checked = true;
    
    document.querySelector('input[name="eng-listen"][value="3"]').checked = true;
    document.querySelector('input[name="eng-speak"][value="3"]').checked = true;
    document.querySelector('input[name="eng-read"][value="3"]').checked = true;
    document.querySelector('input[name="eng-write"][value="3"]').checked = true;
    
    document.getElementById('other-lang').value = 'จีน (พอใช้)';
    document.getElementById('special-skill').value = 'เขียนโปรแกรม, ออกแบบเว็บไซต์';
    document.getElementById('hobby').value = 'อ่านหนังสือ, เล่นกีฬา';
    document.querySelector('input[name="driving"][value="car"]').checked = true;
    document.querySelector('input[name="hasLicense"][value="yes"]').checked = true;
    document.getElementById('car-license').value = 'กข-1234 กรุงเทพฯ';
    document.getElementById('moto-license').value = '';
    
    // Section 7: ประสบการณ์ทำงาน
    document.getElementById('work-exp').value = 'บริษัท ABC จำกัด (2563-ปัจจุบัน)\nตำแหน่ง: Software Developer\n- พัฒนาเว็บไซต์ด้วย HTML, CSS, JavaScript\n- ทำงานกับฐานข้อมูล MySQL\n- ใช้ Git ในการจัดการโค้ด';
    document.getElementById('reference').value = 'คุณสมศักดิ์ ผู้จัดการฝ่าย IT\nเบอร์: 0811111111';
    document.getElementById('emergency').value = 'นางสมศรี ใจดี (มารดา)\nเบอร์: 0822222222';
    document.querySelector('input[name="allowCheck"][value="yes"]').checked = true;
    
    // Section 8: ข้อมูลทั่วไป
    document.getElementById('disease').value = 'ไม่มี';
    document.getElementById('surgery').value = 'ไม่เคย';
    document.querySelector('input[name="fired"][value="no"]').checked = true;
    document.querySelector('input[name="prevApply"][value="no"]').checked = true;
    document.querySelector('input[name="socialSecurity"][value="yes"]').checked = true;
    document.querySelector('input[name="debt"][value="no"]').checked = true;
    document.getElementById('debt-detail').value = '';
    document.querySelector('input[name="familyDuty"][value="no"]').checked = true;
    document.getElementById('family-duty-detail').value = '';
    document.querySelector('input[name="criminalSelf"][value="yes"]').checked = true;
    document.querySelector('input[name="criminalCompany"][value="yes"]').checked = true;
    document.querySelector('input[name="transport"][value="car"]').checked = true;
    document.getElementById('referrer').value = '';
    
    console.log('✅ กรอกข้อมูลเสร็จสมบูรณ์!');
    console.log('📝 ตรวจสอบข้อมูลแล้วกดปุ่ม "ส่งใบสมัคร" ได้เลยครับ');
    
    // Scroll to top
    window.scrollTo(0, 0);
})();
