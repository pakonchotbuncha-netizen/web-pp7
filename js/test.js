// Test System - ระบบแบบทดสอบ 4 ชุด
// Phase 2: Assessment System

// ===== TEST DATA =====
const TESTS = {
    // แบบทดสอบที่ 1: ทัศนคติ (Attitude) - 15 ข้อ
    attitude: {
        title: 'แบบทดสอบทัศนคติ',
        icon: 'fa-smile',
        timeLimit: 20 * 60, // 20 นาที
        questions: [
            {
                id: 'att1',
                text: 'เมื่อเผชิญกับปัญหาในการทำงาน คุณมักจะ...',
                type: 'single',
                options: [
                    { value: 1, text: 'หลีกเลี่ยงและรอให้คนอื่นแก้' },
                    { value: 2, text: 'รู้สึกท้อแท้และยอมแพ้' },
                    { value: 3, text: 'พยายามแก้ด้วยตัวเองก่อน' },
                    { value: 4, text: 'ขอความช่วยเหลือจากทีม' },
                    { value: 5, text: 'วิเคราะห์ปัญหาและหาทางแก้ไขอย่างเป็นระบบ' }
                ]
            },
            {
                id: 'att2',
                text: 'คุณรู้สึกอย่างไรเมื่อได้รับคำวิจารณ์เชิงลบ?',
                type: 'single',
                options: [
                    { value: 1, text: 'โกรธและปฏิเสธ' },
                    { value: 2, text: 'เสียใจและท้อแท้' },
                    { value: 3, text: 'ยอมรับแต่ไม่เปลี่ยนแปลง' },
                    { value: 4, text: 'นำมาพิจารณาและปรับปรุง' },
                    { value: 5, text: 'ขอบคุณและนำไปพัฒนาทันที' }
                ]
            },
            {
                id: 'att3',
                text: 'เมื่อต้องทำงานภายใต้ความกดดัน คุณ...',
                type: 'single',
                options: [
                    { value: 1, text: 'ทำงานไม่ได้เลย' },
                    { value: 2, text: 'รู้สึกเครียดมาก' },
                    { value: 3, text: 'พยายามทำให้เสร็จ' },
                    { value: 4, text: 'จัดลำดับความสำคัญและทำงานต่อ' },
                    { value: 5, text: 'ใช้ความกดดันเป็นแรงจูงใจ' }
                ]
            },
            {
                id: 'att4',
                text: 'คุณมองการทำงานเป็นทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ชอบทำงานคนเดียวมากกว่า' },
                    { value: 2, text: 'ทำได้แต่ไม่ชอบ' },
                    { value: 3, text: 'ทำงานตามบทบาทของตนเอง' },
                    { value: 4, text: 'ชอบร่วมมือและช่วยเหลือทีม' },
                    { value: 5, text: 'ทีมคือหัวใจของความสำเร็จ' }
                ]
            },
            {
                id: 'att5',
                text: 'เมื่อเห็นเพื่อนร่วมงานทำผิด คุณ...',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่สนใจ เพราะไม่ใช่เรื่องของเรา' },
                    { value: 2, text: 'นินทาลับหลัง' },
                    { value: 3, text: 'แจ้งหัวหน้างาน' },
                    { value: 4, text: 'พูดคุยส่วนตัวและแนะนำ' },
                    { value: 5, text: 'ช่วยเหลือและสอนงานให้' }
                ]
            },
            {
                id: 'att6',
                text: 'คุณเรียนรู้สิ่งใหม่อย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ชอบเรียนรู้สิ่งใหม่' },
                    { value: 2, text: 'เรียนรู้เมื่อจำเป็นเท่านั้น' },
                    { value: 3, text: 'อ่านจากเอกสาร' },
                    { value: 4, text: 'ลองทำเองและเรียนรู้จากข้อผิดพลาด' },
                    { value: 5, text: 'แสวงหาความรู้ใหม่ๆ อยู่เสมอ' }
                ]
            },
            {
                id: 'att7',
                text: 'เมื่อทำงานไม่สำเร็จตามเป้าหมาย คุณ...',
                type: 'single',
                options: [
                    { value: 1, text: 'โทษคนอื่นหรือสถานการณ์' },
                    { value: 2, text: 'ท้อแท้และยอมแพ้' },
                    { value: 3, text: 'ยอมรับและพยายามใหม่' },
                    { value: 4, text: 'วิเคราะห์สาเหตุและวางแผนใหม่' },
                    { value: 5, text: 'ใช้ความล้มเหลวเป็นบทเรียนและพยายาม gấp 2 เท่า' }
                ]
            },
            {
                id: 'att8',
                text: 'คุณจัดการกับความขัดแย้งในทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'หลีกเลี่ยงและไม่ยุ่ง' },
                    { value: 2, text: 'รอให้คนอื่นแก้' },
                    { value: 3, text: 'พูดคุยตรงๆ' },
                    { value: 4, text: 'หาจุดร่วมและประนีประนอม' },
                    { value: 5, text: 'เป็นคนกลางไกล่เกลี่ยและหาทางออกที่ดีที่สุด' }
                ]
            },
            {
                id: 'att9',
                text: 'อะไรคือแรงจูงใจหลักในการทำงานของคุณ?',
                type: 'single',
                options: [
                    { value: 1, text: 'เงินเดือนเท่านั้น' },
                    { value: 2, text: 'ความมั่นคง' },
                    { value: 3, text: 'ความก้าวหน้าในอาชีพ' },
                    { value: 4, text: 'การพัฒนาตนเองและช่วยเหลือผู้อื่น' },
                    { value: 5, text: 'การสร้างคุณค่าและผลกระทบเชิงบวก' }
                ]
            },
            {
                id: 'att10',
                text: 'คุณรู้สึกอย่างไรกับการเปลี่ยนแปลง?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ชอบและต่อต้าน' },
                    { value: 2, text: 'กังวลและกลัว' },
                    { value: 3, text: 'ยอมรับแต่ช้า' },
                    { value: 4, text: 'ปรับตัวและเปิดรับ' },
                    { value: 5, text: 'ตื่นเต้นและพร้อมรับการเปลี่ยนแปลง' }
                ]
            },
            {
                id: 'att11',
                text: 'เมื่อมีงานหลายอย่างต้องทำพร้อมกัน คุณ...',
                type: 'single',
                options: [
                    { value: 1, text: 'ทำไม่ทันและเครียด' },
                    { value: 2, text: 'เลือกทำแค่งานที่ชอบ' },
                    { value: 3, text: 'ทำทีละอย่างตามลำดับ' },
                    { value: 4, text: 'จัดลำดับความสำคัญและวางแผน' },
                    { value: 5, text: 'จัดการได้อย่างมีประสิทธิภาพและทำงานหลายอย่างพร้อมกัน' }
                ]
            },
            {
                id: 'att12',
                text: 'คุณมองความสำเร็จอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'เป็นเรื่องของโชค' },
                    { value: 2, text: 'เป็นเรื่องของคนเก่ง' },
                    { value: 3, text: 'ต้องทำงานหนัก' },
                    { value: 4, text: 'เกิดจากความพยายามและการเรียนรู้' },
                    { value: 5, text: 'เกิดจากการทำงานเป็นทีมและการไม่ยอมแพ้' }
                ]
            },
            {
                id: 'att13',
                text: 'เมื่อลูกค้าไม่พอใจ คุณ...',
                type: 'single',
                options: [
                    { value: 1, text: 'รู้สึกโกรธและโต้ตอบ' },
                    { value: 2, text: 'เพิกเฉย' },
                    { value: 3, text: 'ขอโทษและแก้ไข' },
                    { value: 4, text: 'รับฟังและหาทางแก้ไขอย่างรวดเร็ว' },
                    { value: 5, text: 'เข้าใจความรู้สึกลูกค้า แก้ปัญหา และป้องกันไม่ให้เกิดซ้ำ' }
                ]
            },
            {
                id: 'att14',
                text: 'คุณใช้เวลาว่างอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'พักผ่อนอย่างเดียว' },
                    { value: 2, text: 'ดูทีวี/เล่นโซเชียล' },
                    { value: 3, text: 'พบปะเพื่อนฝูง' },
                    { value: 4, text: 'เรียนรู้สิ่งใหม่หรือพัฒนาตนเอง' },
                    { value: 5, text: 'ทำกิจกรรมที่มีประโยชน์และช่วยเหลือสังคม' }
                ]
            },
            {
                id: 'att15',
                text: 'อะไรสำคัญที่สุดสำหรับคุณในการทำงาน?',
                type: 'single',
                options: [
                    { value: 1, text: 'เงินเดือนสูง' },
                    { value: 2, text: 'งานสบาย' },
                    { value: 3, text: 'สิ่งแวดล้อมดี' },
                    { value: 4, text: 'ได้พัฒนาตนเอง' },
                    { value: 5, text: 'ได้สร้างคุณค่าและช่วยเหลือผู้อื่น' }
                ]
            }
        ]
    },

    // แบบทดสอบที่ 2: ทักษะ (Skill) - 15 ข้อ
    skill: {
        title: 'แบบทดสอบทักษะ',
        icon: 'fa-tools',
        timeLimit: 30 * 60, // 30 นาที
        questions: [
            {
                id: 'skill1',
                text: 'คุณสามารถใช้ Microsoft Office (Word, Excel, PowerPoint) ได้ในระดับใด?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่สามารถใช้ได้เลย' },
                    { value: 2, text: 'พื้นฐาน (พิมพ์เอกสาร, คำนวณง่ายๆ)' },
                    { value: 3, text: 'ปานกลาง (ใช้ฟังก์ชันพื้นฐานได้)' },
                    { value: 4, text: 'ขั้นสูง (ใช้สูตรซับซ้อน, สร้าง presentation)' },
                    { value: 5, text: 'เชี่ยวชาญ (สร้าง macro, template, สอนคนอื่นได้)' }
                ]
            },
            {
                id: 'skill2',
                text: 'คุณมีความสามารถในการใช้ภาษาอังกฤษในระดับใด?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่สามารถใช้ได้เลย' },
                    { value: 2, text: 'พื้นฐาน (อ่านและเขียนง่ายๆ)' },
                    { value: 3, text: 'ปานกลาง (สื่อสารทั่วไปได้)' },
                    { value: 4, text: 'ดี (อ่านเอกสารและเขียนอีเมลได้)' },
                    { value: 5, text: 'เชี่ยวชาญ (พูด อ่าน เขียน ได้อย่างคล่องแคล่ว)' }
                ]
            },
            {
                id: 'skill3',
                text: 'คุณจัดการเวลาทำงานอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่มีการวางแผน' },
                    { value: 2, text: 'ทำตามที่นึกได้' },
                    { value: 3, text: 'มี To-do list' },
                    { value: 4, text: 'ใช้เครื่องมือจัดการเวลา (Calendar, Task Manager)' },
                    { value: 5, text: 'วางแผนรายวัน/รายสัปดาห์ และติดตามผลอย่างสม่ำเสมอ' }
                ]
            },
            {
                id: 'skill4',
                text: 'คุณมีความสามารถในการแก้ปัญหาอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'หลีกเลี่ยงปัญหา' },
                    { value: 2, text: 'รอให้คนอื่นแก้' },
                    { value: 3, text: 'ลองแก้ด้วยตัวเอง' },
                    { value: 4, text: 'วิเคราะห์สาเหตุและหาทางแก้ไข' },
                    { value: 5, text: 'ใช้กระบวนการแก้ปัญหาอย่างเป็นระบบและป้องกันไม่ให้เกิดซ้ำ' }
                ]
            },
            {
                id: 'skill5',
                text: 'คุณมีความสามารถในการสื่อสารอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ค่อยกล้าพูด' },
                    { value: 2, text: 'พูดได้แต่ไม่ชัดเจน' },
                    { value: 3, text: 'สื่อสารทั่วไปได้ดี' },
                    { value: 4, text: 'นำเสนอและเจรจาได้ดี' },
                    { value: 5, text: 'สื่อสารได้ชัดเจน น่าเชื่อถือ และสร้างแรงบันดาลใจ' }
                ]
            },
            {
                id: 'skill6',
                text: 'คุณมีความสามารถในการทำงานเป็นทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ชอบทำงานคนเดียว' },
                    { value: 2, text: 'ทำงานตามที่ได้รับมอบหมาย' },
                    { value: 3, text: 'ร่วมมือกับทีมได้ดี' },
                    { value: 4, text: 'เป็นผู้นำทีมและประสานงานได้ดี' },
                    { value: 5, text: 'สร้างทีมที่แข็งแกร่งและผลักดันให้ทีมประสบความสำเร็จ' }
                ]
            },
            {
                id: 'skill7',
                text: 'คุณมีความสามารถในการเรียนรู้เทคโนโลยีใหม่อย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ชอบเรียนรู้เทคโนโลยีใหม่' },
                    { value: 2, text: 'เรียนรู้เมื่อจำเป็นเท่านั้น' },
                    { value: 3, text: 'ลองใช้และเรียนรู้เอง' },
                    { value: 4, text: 'ศึกษาอย่างจริงจังและฝึกฝน' },
                    { value: 5, text: 'เรียนรู้เร็วและสามารถสอนคนอื่นได้' }
                ]
            },
            {
                id: 'skill8',
                text: 'คุณมีความสามารถในการวิเคราะห์ข้อมูลอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่มีความสามารถเลย' },
                    { value: 2, text: 'พื้นฐาน (ดูตัวเลขทั่วไป)' },
                    { value: 3, text: 'ปานกลาง (ใช้ Excel วิเคราะห์ได้)' },
                    { value: 4, text: 'ดี (ใช้เครื่องมือวิเคราะห์และสร้างรายงาน)' },
                    { value: 5, text: 'เชี่ยวชาญ (วิเคราะห์เชิงลึกและให้คำแนะนำเชิงกลยุทธ์)' }
                ]
            },
            {
                id: 'skill9',
                text: 'คุณมีความสามารถในการเขียนรายงานอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ชอบเขียน' },
                    { value: 2, text: 'เขียนได้แต่ไม่ชัดเจน' },
                    { value: 3, text: 'เขียนรายงานทั่วไปได้ดี' },
                    { value: 4, text: 'เขียนรายงานเชิงวิเคราะห์ได้ดี' },
                    { value: 5, text: 'เขียนรายงานที่ชัดเจน กระชับ และสร้างผลกระทบ' }
                ]
            },
            {
                id: 'skill10',
                text: 'คุณมีความสามารถในการตัดสินใจอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ตัดสินใจไม่ได้' },
                    { value: 2, text: 'รอให้คนอื่นตัดสินใจ' },
                    { value: 3, text: 'ตัดสินใจจากความรู้สึก' },
                    { value: 4, text: 'ตัดสินใจจากข้อมูลและเหตุผล' },
                    { value: 5, text: 'ตัดสินใจได้อย่างรวดเร็ว แม่นยำ และรับผิดชอบ' }
                ]
            },
            {
                id: 'skill11',
                text: 'คุณมีความสามารถในการจัดการโครงการอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่เคยทำ' },
                    { value: 2, text: 'ทำตามที่ได้รับการมอบหมาย' },
                    { value: 3, text: 'จัดการโครงการเล็กๆ ได้' },
                    { value: 4, text: 'จัดการโครงการขนาดกลางและทีมได้' },
                    { value: 5, text: 'จัดการโครงการขนาดใหญ่และหลายทีมได้อย่างมีประสิทธิภาพ' }
                ]
            },
            {
                id: 'skill12',
                text: 'คุณมีความสามารถในการเจรจาอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ชอบเจรจา' },
                    { value: 2, text: 'เจรจาได้แต่ไม่มั่นใจ' },
                    { value: 3, text: 'เจรจาทั่วไปได้ดี' },
                    { value: 4, text: 'เจรจาและหาข้อตกลงได้ดี' },
                    { value: 5, text: 'เจรจาเชิงกลยุทธ์และสร้าง Win-Win Solution' }
                ]
            },
            {
                id: 'skill13',
                text: 'คุณมีความสามารถในการนำเสนออย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'กลัวการนำเสนอ' },
                    { value: 2, text: 'นำเสนอได้แต่ประหม่า' },
                    { value: 3, text: 'นำเสนอได้ดีในสถานการณ์ทั่วไป' },
                    { value: 4, text: 'นำเสนอได้อย่างมั่นใจและน่าสนใจ' },
                    { value: 5, text: 'นำเสนอได้อย่างมืออาชีพและสร้างแรงบันดาลใจ' }
                ]
            },
            {
                id: 'skill14',
                text: 'คุณมีความสามารถในการปรับตัวอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ชอบการเปลี่ยนแปลง' },
                    { value: 2, text: 'ปรับตัวช้า' },
                    { value: 3, text: 'ปรับตัวได้ตามสถานการณ์' },
                    { value: 4, text: 'ปรับตัวเร็วและเปิดรับ' },
                    { value: 5, text: 'ปรับตัวได้ทันทีและใช้การเปลี่ยนแปลงเป็นโอกาส' }
                ]
            },
            {
                id: 'skill15',
                text: 'คุณมีความสามารถในการสร้างสรรค์นวัตกรรมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่มีความคิดสร้างสรรค์' },
                    { value: 2, text: 'มีไอเดียแต่ไม่ลงมือทำ' },
                    { value: 3, text: 'เสนอไอเดียใหม่ๆ บ้าง' },
                    { value: 4, text: 'สร้างนวัตกรรมและนำไปใช้จริง' },
                    { value: 5, text: 'สร้างนวัตกรรมที่สร้างผลกระทบเชิงบวก' }
                ]
            }
        ]
    },

    // แบบทดสอบที่ 3: CC 7 ด้าน (Core Competency) - 20 ข้อ
    cc: {
        title: 'แบบทดสอบทุนองค์กร (CC 7 ด้าน)',
        icon: 'fa-star',
        timeLimit: 25 * 60, // 25 นาที
        questions: [
            // CC1: ความเป็นผู้นำ (Servant Leadership)
            {
                id: 'cc1',
                text: 'CC1: คุณเคยเป็นผู้นำทีมหรือไม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่เคย' },
                    { value: 2, text: 'เคยแต่ไม่ประสบความสำเร็จ' },
                    { value: 3, text: 'เคยและทำได้ดี' },
                    { value: 4, text: 'เป็นผู้นำที่สร้างทีมที่แข็งแกร่ง' },
                    { value: 5, text: 'เป็นผู้นำที่สร้างแรงบันดาลใจและผลักดันทีมสู่ความสำเร็จ' }
                ]
            },
            {
                id: 'cc2',
                text: 'CC1: คุณ "รับฟัง-รับใช้-รับผิดชอบ" อย่างไรในทีม?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่เคยคิด' },
                    { value: 2, text: 'พยายามทำ' },
                    { value: 3, text: 'ทำเป็นประจำ' },
                    { value: 4, text: 'เป็นธรรมชาติ' },
                    { value: 5, text: 'สอนคนอื่นได้' }
                ]
            },
            {
                id: 'cc3',
                text: 'CC1: คุณแสดงความเป็นผู้นำอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'สั่งการเท่านั้น' },
                    { value: 2, text: 'ควบคุมทุกอย่าง' },
                    { value: 3, text: 'มอบหมายงาน' },
                    { value: 4, text: 'สนับสนุนและให้คำแนะนำ' },
                    { value: 5, text: 'สร้างแรงบันดาลใจและ empower ทีม' }
                ]
            },

            // CC2: ความสามารถในการปรับตัวและสร้างนวัตกรรม
            {
                id: 'cc4',
                text: 'CC2: คุณเคยสร้างนวัตกรรมหรือปรับปรุงกระบวนการทำงานหรือไม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่เคย' },
                    { value: 2, text: 'คิดแต่ไม่ได้ทำ' },
                    { value: 3, text: 'ทำบ้าง' },
                    { value: 4, text: 'ทำบ่อย' },
                    { value: 5, text: 'ทำทุกครั้งที่มีโอกาส' }
                ]
            },
            {
                id: 'cc5',
                text: 'CC2: เมื่อมีการเปลี่ยนแปลงในองค์กร คุณรู้สึกอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ชอบ' },
                    { value: 2, text: 'กังวล' },
                    { value: 3, text: 'ยอมรับ' },
                    { value: 4, text: 'ตื่นเต้น' },
                    { value: 5, text: 'พร้อมเสมอ' }
                ]
            },
            {
                id: 'cc6',
                text: 'CC2: คุณจัดการกับความไม่แน่นอนอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'หลีกเลี่ยง' },
                    { value: 2, text: 'กังวลมาก' },
                    { value: 3, text: 'พยายามปรับตัว' },
                    { value: 4, text: 'มองเป็นโอกาส' },
                    { value: 5, text: 'ใช้ความไม่แน่นอนสร้างนวัตกรรม' }
                ]
            },

            // CC3: การสร้างคุณค่าบนฐานความไว้วางใจ
            {
                id: 'cc7',
                text: 'CC3: คุณสร้างความไว้วางใจกับเพื่อนร่วมงานอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ทำงานให้เสร็จ' },
                    { value: 2, text: 'ตรงต่อเวลา' },
                    { value: 3, text: 'โปร่งใส' },
                    { value: 4, text: 'ช่วยเหลือ' },
                    { value: 5, text: 'ทำทั้งหมดและรักษาสัญญา' }
                ]
            },
            {
                id: 'cc8',
                text: 'CC3: คุณจัดการกับความขัดแย้งอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'หลีกเลี่ยง' },
                    { value: 2, text: 'รอให้คนอื่นแก้' },
                    { value: 3, text: 'พูดคุยตรงๆ' },
                    { value: 4, text: 'หาจุดร่วม' },
                    { value: 5, text: 'สร้าง Win-Win Solution' }
                ]
            },
            {
                id: 'cc9',
                text: 'CC3: คุณส่งมอบคุณค่าให้ลูกค้าอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ทำตามคำสั่ง' },
                    { value: 2, text: 'ทำให้เสร็จ' },
                    { value: 3, text: 'ทำให้ดี' },
                    { value: 4, text: 'ทำให้เกินคาดหวัง' },
                    { value: 5, text: 'สร้างประสบการณ์ที่ยอดเยี่ยม' }
                ]
            },

            // CC4: การทำงานทีมด้วยฉันทมติ
            {
                id: 'cc10',
                text: 'CC4: คุณตัดสินใจในทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ตัดสินใจเอง' },
                    { value: 2, text: 'ถามหัวหน้า' },
                    { value: 3, text: 'หารือทีม' },
                    { value: 4, text: 'หาฉันทมติ' },
                    { value: 5, text: 'ให้ทีมตัดสินใจและรับผิดชอบร่วมกัน' }
                ]
            },
            {
                id: 'cc11',
                text: 'CC4: คุณสนับสนุนเพื่อนร่วมงานอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ทำงานของตัวเอง' },
                    { value: 2, text: 'ช่วยเมื่อถูกขอ' },
                    { value: 3, text: 'ช่วยเหลือเป็นประจำ' },
                    { value: 4, text: 'แบ่งปันความรู้และทรัพยากร' },
                    { value: 5, text: 'สร้างวัฒนธรรมการช่วยเหลือซึ่งกันและกัน' }
                ]
            },

            // CC5: วิชาชีพและวินัยองค์กร
            {
                id: 'cc12',
                text: 'CC5: คุณทำงานด้วยความวินัยอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ทำเมื่อถูกเตือน' },
                    { value: 2, text: 'ทำตามคำสั่ง' },
                    { value: 3, text: 'ทำตามที่กำหนด' },
                    { value: 4, text: 'ทำเกินกว่ากำหนด' },
                    { value: 5, text: 'ทำด้วยตัวเองเสมอและเป็นแบบอย่าง' }
                ]
            },
            {
                id: 'cc13',
                text: 'CC5: คุณจัดการกับเวลาทำงานอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ตรงเวลา' },
                    { value: 2, text: 'สายบ้าง' },
                    { value: 3, text: 'ตรงเวลา' },
                    { value: 4, text: 'มาก่อนเวลา' },
                    { value: 5, text: 'บริหารเวลาอย่างมีประสิทธิภาพและส่งงานก่อนกำหนด' }
                ]
            },

            // CC6: การใช้เทคโนโลยี
            {
                id: 'cc14',
                text: 'CC6: คุณใช้เทคโนโลยีในการทำงานอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ใช้' },
                    { value: 2, text: 'ใช้พื้นฐาน' },
                    { value: 3, text: 'ใช้เป็นประจำ' },
                    { value: 4, text: 'ค้นหาเครื่องมือใหม่' },
                    { value: 5, text: 'ส่งเสริมให้ทีมใช้และสร้างนวัตกรรม' }
                ]
            },
            {
                id: 'cc15',
                text: 'CC6: คุณเรียนรู้เทคโนโลยีใหม่อย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่เรียนรู้' },
                    { value: 2, text: 'เรียนรู้เมื่อจำเป็น' },
                    { value: 3, text: 'ลองใช้เอง' },
                    { value: 4, text: 'ศึกษาอย่างจริงจัง' },
                    { value: 5, text: 'เรียนรู้เร็วและสอนคนอื่น' }
                ]
            },

            // CC7: การสร้างบรรยากาศด้วยอารมณ์ขัน
            {
                id: 'cc16',
                text: 'CC7: คุณสร้างบรรยากาศที่ดีในทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ทำงานของตัวเอง' },
                    { value: 2, text: 'ยิ้มแย้ม' },
                    { value: 3, text: 'สร้างรอยยิ้ม' },
                    { value: 4, text: 'ใช้ humor' },
                    { value: 5, text: 'ทำให้ทีมมีความสุขและทำงานอย่างสนุกสนาน' }
                ]
            },
            {
                id: 'cc17',
                text: 'CC7: คุณจัดการกับความเครียดในทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่สนใจ' },
                    { value: 2, text: 'ทำงานต่อ' },
                    { value: 3, text: 'ให้กำลังใจ' },
                    { value: 4, text: 'สร้างบรรยากาศผ่อนคลาย' },
                    { value: 5, text: 'ใช้ humor และกิจกรรมสร้างทีม' }
                ]
            },
            {
                id: 'cc18',
                text: 'CC7: คุณสร้างแรงบันดาลใจให้ทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ทำ' },
                    { value: 2, text: 'พูดให้กำลังใจ' },
                    { value: 3, text: 'เป็นแบบอย่าง' },
                    { value: 4, text: 'สร้างวิสัยทัศน์ร่วม' },
                    { value: 5, text: 'สร้างวัฒนธรรมเชิงบวกและเฉลิมฉลองความสำเร็จ' }
                ]
            },

            // CC เพิ่มเติม
            {
                id: 'cc19',
                text: 'คุณให้ความสำคัญกับการพัฒนาตนเองอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่พัฒนา' },
                    { value: 2, text: 'พัฒนาเมื่อจำเป็น' },
                    { value: 3, text: 'เรียนรู้บ้าง' },
                    { value: 4, text: 'พัฒนาอย่างต่อเนื่อง' },
                    { value: 5, text: 'มุ่งมั่นพัฒนาตนเองและเป็นแบบอย่าง' }
                ]
            },
            {
                id: 'cc20',
                text: 'คุณมองความสำเร็จของทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่สนใจ' },
                    { value: 2, text: 'ดีใจ' },
                    { value: 3, text: 'ภูมิใจ' },
                    { value: 4, text: 'เฉลิมฉลอง' },
                    { value: 5, text: 'เป็นส่วนหนึ่งของความสำเร็จและเรียนรู้จากกัน' }
                ]
            }
        ]
    },

    // แบบทดสอบที่ 4: 3E3P - 15 ข้อ
    e3p: {
        title: 'แบบทดสอบ 3E3P',
        icon: 'fa-chart-line',
        timeLimit: 15 * 60, // 15 นาที
        questions: [
            // 3E: Engagement, Empowerment, Enablement
            {
                id: 'e1',
                text: '3E-Engagement: คุณรู้สึกผูกพันกับองค์กรก่อนหน้าอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่รู้สึก' },
                    { value: 2, text: 'ทำงานตามหน้าที่' },
                    { value: 3, text: 'รู้สึกดี' },
                    { value: 4, text: 'ผูกพันมาก' },
                    { value: 5, text: 'พร้อมทุ่มเท' }
                ]
            },
            {
                id: 'e2',
                text: '3E-Empowerment: คุณกล้าตัดสินใจในงานที่ได้รับมอบหมายหรือไม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่กล้า' },
                    { value: 2, text: 'รอคำสั่ง' },
                    { value: 3, text: 'ตัดสินใจเล็กน้อย' },
                    { value: 4, text: 'กล้าตัดสินใจ' },
                    { value: 5, text: 'กล้าและรับผิดชอบ' }
                ]
            },
            {
                id: 'e3',
                text: '3E-Enablement: องค์กรก่อนหน้าสนับสนุนคุณเพียงพอหรือไม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่เลย' },
                    { value: 2, text: 'น้อย' },
                    { value: 3, text: 'ปานกลาง' },
                    { value: 4, text: 'เพียงพอ' },
                    { value: 5, text: 'ดีมาก' }
                ]
            },
            {
                id: 'e4',
                text: 'คุณต้องการให้ PKG สนับสนุนคุณอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'แค่เงินเดือน' },
                    { value: 2, text: 'สวัสดิการ' },
                    { value: 3, text: 'โอกาสพัฒนา' },
                    { value: 4, text: 'สภาพแวดล้อมที่ดี' },
                    { value: 5, text: 'ทุกด้านและสร้างวัฒนธรรมการเรียนรู้' }
                ]
            },
            {
                id: 'e5',
                text: 'คุณรู้สึกอย่างไรเมื่อได้รับมอบหมายงานใหม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'กลัว' },
                    { value: 2, text: 'กังวล' },
                    { value: 3, text: 'ตื่นเต้น' },
                    { value: 4, text: 'พร้อมทำ' },
                    { value: 5, text: 'ท้าทายและพร้อมเรียนรู้' }
                ]
            },

            // 3P: People, Process, Platform
            {
                id: 'p1',
                text: '3P-People: คุณคิดว่าคนในทีมก่อนหน้าสนับสนุนกันหรือไม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่เลย' },
                    { value: 2, text: 'น้อย' },
                    { value: 3, text: 'ปานกลาง' },
                    { value: 4, text: 'ดี' },
                    { value: 5, text: 'ดีมาก' }
                ]
            },
            {
                id: 'p2',
                text: '3P-Process: กระบวนการทำงานในองค์กรก่อนหน้าชัดเจนหรือไม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ชัดเจน' },
                    { value: 2, text: 'น้อย' },
                    { value: 3, text: 'ปานกลาง' },
                    { value: 4, text: 'ชัดเจน' },
                    { value: 5, text: 'ชัดเจนมาก' }
                ]
            },
            {
                id: 'p3',
                text: '3P-Platform: เครื่องมือ/เทคโนโลยีที่ใช้เพียงพอหรือไม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่เพียงพอ' },
                    { value: 2, text: 'น้อย' },
                    { value: 3, text: 'ปานกลาง' },
                    { value: 4, text: 'เพียงพอ' },
                    { value: 5, text: 'ดีมาก' }
                ]
            },
            {
                id: 'p4',
                text: 'คุณต้องการให้ PKG มีกระบวนการทำงานอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ต้องมีกระบวนการ' },
                    { value: 2, text: 'พื้นฐาน' },
                    { value: 3, text: 'ชัดเจน' },
                    { value: 4, text: 'มีประสิทธิภาพ' },
                    { value: 5, text: 'ทันสมัยและต่อเนื่อง' }
                ]
            },
            {
                id: 'p5',
                text: 'คุณต้องการให้ PKG มีเครื่องมือ/เทคโนโลยีอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ต้องมี' },
                    { value: 2, text: 'พื้นฐาน' },
                    { value: 3, text: 'เพียงพอ' },
                    { value: 4, text: 'ทันสมัย' },
                    { value: 5, text: 'ล้ำสมัยและสร้างนวัตกรรม' }
                ]
            },
            {
                id: 'p6',
                text: 'คุณต้องการทำงานกับคนแบบใด?',
                type: 'single',
                options: [
                    { value: 1, text: 'ทำงานคนเดียว' },
                    { value: 2, text: 'ทีมเล็กๆ' },
                    { value: 3, text: 'ทีมที่สนับสนุนกัน' },
                    { value: 4, text: 'ทีมที่มีความหลากหลาย' },
                    { value: 5, text: 'ทีมที่สร้างวัฒนธรรมเชิงบวกและเรียนรู้ร่วมกัน' }
                ]
            },
            {
                id: 'p7',
                text: 'คุณมีข้อเสนอแนะเพื่อปรับปรุงองค์กรหรือไม่?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่มี' },
                    { value: 2, text: 'มีแต่ไม่กล้าพูด' },
                    { value: 3, text: 'เสนอเมื่อถูกถาม' },
                    { value: 4, text: 'เสนอเป็นประจำ' },
                    { value: 5, text: 'เสนอและลงมือทำ' }
                ]
            },
            {
                id: 'p8',
                text: 'คุณมองบทบาทของตนเองในทีมอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ผู้ตาม' },
                    { value: 2, text: 'ผู้ปฏิบัติงาน' },
                    { value: 3, text: 'ผู้ร่วมทีม' },
                    { value: 4, text: 'ผู้สนับสนุน' },
                    { value: 5, text: 'ผู้นำและสร้างผลกระทบ' }
                ]
            },
            {
                id: 'p9',
                text: 'คุณต้องการให้ PKG สร้างวัฒนธรรมองค์กรอย่างไร?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ต้องสร้าง' },
                    { value: 2, text: 'พื้นฐาน' },
                    { value: 3, text: 'เชิงบวก' },
                    { value: 4, text: 'เปิดกว้างและเรียนรู้' },
                    { value: 5, text: 'นวัตกรรมและสร้างผลกระทบเชิงบวก' }
                ]
            },
            {
                id: 'p10',
                text: 'คุณต้องการสร้างผลกระทบอย่างไรที่ PKG?',
                type: 'single',
                options: [
                    { value: 1, text: 'ไม่ต้องการ' },
                    { value: 2, text: 'ทำงานให้เสร็จ' },
                    { value: 3, text: 'พัฒนาตนเอง' },
                    { value: 4, text: 'ช่วยเหลือทีม' },
                    { value: 5, text: 'สร้างการเปลี่ยนแปลงและสร้างคุณค่า' }
                ]
            }
        ]
    }
};

// ===== STATE =====
let currentTest = 1;
let currentQuestion = 0;
let answers = {
    attitude: {},
    skill: {},
    cc: {},
    e3p: {}
};
let timerInterval = null;
let timeLeft = 45 * 60; // 45 นาที
let applicationId = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadApplicationData();
    loadProgress();
    startTimer();
    renderTest();
});

// ===== CHECK AUTHENTICATION =====
function checkAuth() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!stored) {
        alert('กรุณาเข้าสู่ระบบ');
        window.location.href = '../index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(stored);
    } catch (e) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        window.location.href = '../index.html';
    }
}

// ===== LOAD APPLICATION DATA =====
function loadApplicationData() {
    const urlParams = new URLSearchParams(window.location.search);
    applicationId = urlParams.get('applicationId');
    
    if (!applicationId) {
        alert('ไม่พบข้อมูลใบสมัคร');
        window.location.href = 'applicant-dashboard.html';
        return;
    }
}

// ===== TIMER =====
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('หมดเวลา! ระบบจะส่งคำตอบอัตโนมัติ');
            submitTest();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 300) { // 5 นาทีสุดท้าย
        timerEl.classList.add('text-red-600', 'font-bold');
    }
}

// ===== RENDER TEST =====
function renderTest() {
    const testKey = getTestKey(currentTest);
    const test = TESTS[testKey];
    const question = test.questions[currentQuestion];
    
    const content = document.getElementById('testContent');
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800">
                    <i class="fas ${test.icon} text-purple-600 mr-2"></i>
                    ${test.title}
                </h3>
                <span class="text-sm text-gray-500">ข้อ ${currentQuestion + 1}/${test.questions.length}</span>
            </div>
            <div class="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
                <p class="text-gray-800 font-medium">${question.text}</p>
            </div>
        </div>
        <div class="space-y-3">
            ${question.options.map((option, index) => `
                <div class="option-card border-2 border-gray-200 rounded-lg p-4 cursor-pointer ${isSelected(testKey, question.id, option.value) ? 'selected' : ''}"
                     onclick="selectOption('${testKey}', '${question.id}', ${option.value})">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full border-2 ${isSelected(testKey, question.id, option.value) ? 'bg-white text-purple-600' : 'border-gray-300'} flex items-center justify-center font-semibold mr-3">
                            ${String.fromCharCode(65 + index)}
                        </div>
                        <span class="flex-1">${option.text}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    updateNavigation();
    updateProgress();
    updateTestStatus();
}

// ===== GET TEST KEY =====
function getTestKey(testNum) {
    const keys = ['attitude', 'skill', 'cc', 'e3p'];
    return keys[testNum - 1];
}

// ===== CHECK IF SELECTED =====
function isSelected(testKey, questionId, value) {
    return answers[testKey][questionId] === value;
}

// ===== SELECT OPTION =====
function selectOption(testKey, questionId, value) {
    answers[testKey][questionId] = value;
    renderTest();
    saveProgress();
}

// ===== NAVIGATION =====
function updateNavigation() {
    const testKey = getTestKey(currentTest);
    const test = TESTS[testKey];
    const isFirst = currentTest === 1 && currentQuestion === 0;
    const isLast = currentTest === 4 && currentQuestion === test.questions.length - 1;
    
    document.getElementById('prevBtn').disabled = isFirst;
    document.getElementById('nextBtn').classList.toggle('hidden', isLast);
    document.getElementById('submitBtn').classList.toggle('hidden', !isLast);
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
    } else if (currentTest > 1) {
        currentTest--;
        const testKey = getTestKey(currentTest);
        currentQuestion = TESTS[testKey].questions.length - 1;
    }
    renderTest();
}

function nextQuestion() {
    const testKey = getTestKey(currentTest);
    const test = TESTS[testKey];
    
    if (currentQuestion < test.questions.length - 1) {
        currentQuestion++;
    } else if (currentTest < 4) {
        currentTest++;
        currentQuestion = 0;
    }
    renderTest();
}

function switchTest(testNum) {
    currentTest = testNum;
    currentQuestion = 0;
    renderTest();
}

// ===== UPDATE PROGRESS =====
function updateProgress() {
    const totalQuestions = Object.values(TESTS).reduce((sum, test) => sum + test.questions.length, 0);
    const answeredQuestions = Object.values(answers).reduce((sum, test) => sum + Object.keys(test).length, 0);
    const progress = (answeredQuestions / totalQuestions) * 100;
    
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
}

function updateTestStatus() {
    const testKeys = ['attitude', 'skill', 'cc', 'e3p'];
    testKeys.forEach((key, index) => {
        const test = TESTS[key];
        const answered = Object.keys(answers[key]).length;
        const total = test.questions.length;
        document.getElementById(`test${index + 1}Status`).textContent = `${answered}/${total}`;
        
        const tab = document.getElementById(`tab${index + 1}`);
        if (index + 1 === currentTest) {
            tab.className = 'px-4 py-2 rounded-lg bg-purple-600 text-white font-medium';
        } else if (answered === total) {
            tab.className = 'px-4 py-2 rounded-lg bg-green-600 text-white font-medium';
        } else {
            tab.className = 'px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium';
        }
    });
}

// ===== SAVE PROGRESS =====
function saveProgress() {
    const progress = {
        applicationId: applicationId,
        currentTest: currentTest,
        currentQuestion: currentQuestion,
        answers: answers,
        timeLeft: timeLeft,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`test_progress_${applicationId}`, JSON.stringify(progress));
}

function loadProgress() {
    const saved = localStorage.getItem(`test_progress_${applicationId}`);
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            currentTest = progress.currentTest || 1;
            currentQuestion = progress.currentQuestion || 0;
            answers = progress.answers || { attitude: {}, skill: {}, cc: {}, e3p: {} };
            timeLeft = progress.timeLeft || 45 * 60;
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }
}

// ===== SUBMIT TEST =====
function submitTest() {
    // Check if all questions are answered
    const totalQuestions = Object.values(TESTS).reduce((sum, test) => sum + test.questions.length, 0);
    const answeredQuestions = Object.values(answers).reduce((sum, test) => sum + Object.keys(test).length, 0);
    
    if (answeredQuestions < totalQuestions) {
        if (!confirm(`คุณยังไม่ได้ตอบคำถาม ${totalQuestions - answeredQuestions} ข้อ ต้องการส่งคำตอบหรือไม่?`)) {
            return;
        }
    } else {
        if (!confirm('ต้องการส่งคำตอบหรือไม่?')) {
            return;
        }
    }
    
    clearInterval(timerInterval);
    
    // Calculate scores
    const scores = calculateScores();
    
    // Save test results
    const testResults = JSON.parse(localStorage.getItem('pkg_test_results') || '[]');
    
    const result = {
        id: 'TEST-' + Date.now(),
        applicationId: applicationId,
        userId: currentUser.id,
        answers: answers,
        scores: scores,
        completedAt: new Date().toISOString(),
        timeUsed: (45 * 60) - timeLeft
    };
    
    testResults.push(result);
    localStorage.setItem('pkg_test_results', JSON.stringify(testResults));
    
    // Update application status
    const applications = JSON.parse(localStorage.getItem('pkg_applications') || '[]');
    const app = applications.find(a => a.id === applicationId);
    
    if (app) {
        app.status = 'test_done';
        app.testCompleted = true;
        app.testScores = scores;
        localStorage.setItem('pkg_applications', JSON.stringify(applications));
    }
    
    // Clear progress
    localStorage.removeItem(`test_progress_${applicationId}`);
    
    // Create notification
    createNotification(
        currentUser.id,
        'ส่งแบบทดสอบสำเร็จ',
        'คุณได้ส่งแบบทดสอบเรียบร้อยแล้ว HR จะประเมินผลและแจ้งผลต่อไป',
        'test_completed'
    );
    
    // Show success message
    showSuccessMessage(scores);
}

// ===== CALCULATE SCORES =====
function calculateScores() {
    const scores = {};
    
    // Attitude (0-100)
    const attitudeTotal = Object.values(answers.attitude).reduce((sum, v) => sum + v, 0);
    const attitudeMax = TESTS.attitude.questions.length * 5;
    scores.attitude = Math.round((attitudeTotal / attitudeMax) * 100);
    
    // Skill (0-100)
    const skillTotal = Object.values(answers.skill).reduce((sum, v) => sum + v, 0);
    const skillMax = TESTS.skill.questions.length * 5;
    scores.skill = Math.round((skillTotal / skillMax) * 100);
    
    // CC (0-100)
    const ccTotal = Object.values(answers.cc).reduce((sum, v) => sum + v, 0);
    const ccMax = TESTS.cc.questions.length * 5;
    scores.cc = Math.round((ccTotal / ccMax) * 100);
    
    // 3E3P (0-100)
    const e3pTotal = Object.values(answers.e3p).reduce((sum, v) => sum + v, 0);
    const e3pMax = TESTS.e3p.questions.length * 5;
    scores.e3p = Math.round((e3pTotal / e3pMax) * 100);
    
    // Overall
    scores.overall = Math.round((scores.attitude + scores.skill + scores.cc + scores.e3p) / 4);
    
    return scores;
}

// ===== CREATE NOTIFICATION =====
function createNotification(userId, title, message, type) {
    const notifications = JSON.parse(localStorage.getItem('pkg_notifications') || '[]');
    
    notifications.push({
        id: 'NOTIF-' + Date.now(),
        userId: userId,
        title: title,
        message: message,
        type: type,
        read: false,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('pkg_notifications', JSON.stringify(notifications));
}

// ===== SHOW SUCCESS MESSAGE =====
function showSuccessMessage(scores) {
    const content = document.getElementById('testContent');
    content.innerHTML = `
        <div class="text-center py-12">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-check-circle text-green-600 text-4xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">ส่งแบบทดสอบสำเร็จ!</h2>
            <p class="text-gray-600 mb-8">ขอบคุณที่ทำแบบทดสอบครบทั้ง 4 ชุด</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-purple-50 p-4 rounded-lg">
                    <i class="fas fa-smile text-2xl text-purple-600 mb-2"></i>
                    <p class="text-sm text-gray-600">ทัศนคติ</p>
                    <p class="text-2xl font-bold text-purple-600">${scores.attitude}</p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg">
                    <i class="fas fa-tools text-2xl text-blue-600 mb-2"></i>
                    <p class="text-sm text-gray-600">ทักษะ</p>
                    <p class="text-2xl font-bold text-blue-600">${scores.skill}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <i class="fas fa-star text-2xl text-yellow-600 mb-2"></i>
                    <p class="text-sm text-gray-600">CC 7 ด้าน</p>
                    <p class="text-2xl font-bold text-yellow-600">${scores.cc}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <i class="fas fa-chart-line text-2xl text-green-600 mb-2"></i>
                    <p class="text-sm text-gray-600">3E3P</p>
                    <p class="text-2xl font-bold text-green-600">${scores.e3p}</p>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg mb-8">
                <p class="text-lg font-semibold mb-2">คะแนนรวม</p>
                <p class="text-5xl font-bold">${scores.overall}</p>
                <p class="text-sm opacity-90 mt-2">จาก 100 คะแนน</p>
            </div>
            
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 text-left mb-8">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-blue-600 mr-2 mt-1"></i>
                    <div class="text-sm text-blue-700">
                        <p class="font-semibold mb-2">ขั้นตอนถัดไป:</p>
                        <ol class="list-decimal list-inside space-y-1">
                            <li>HR จะประเมินผลแบบทดสอบของคุณ</li>
                            <li>หากผ่านเกณฑ์ คุณจะได้รับการนัดสัมภาษณ์</li>
                            <li>ติดตามสถานะได้ที่หน้า Dashboard</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <button onclick="window.location.href='applicant-dashboard.html'" 
                    class="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                <i class="fas fa-tachometer-alt mr-2"></i>กลับหน้า Dashboard
            </button>
        </div>
    `;
    
    // Hide navigation buttons
    document.querySelector('.flex.justify-between.mt-6').classList.add('hidden');
}

// ===== UTILITY FUNCTIONS =====
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
