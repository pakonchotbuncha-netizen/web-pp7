# Web PP7 Data Flow & API Design (Draft v1)

## 1. ภาพรวม Data Flow
[P1 แสวงหา] → [P2 ประเมินก่อนรบ] → [P3 จับคู่] → [P4 ประเมินผล] → [P5 พัฒนา] + [P6 ค่าตอบแทน] → [P7 คุณภาพชีวิต]
(ทุกขั้นตอนส่งข้อมูลสองทางกับ AI Core Engine)

## 2. กฎการไหลของข้อมูล (Data Flow Rules)
1. **Evidence-First Rule (P4)**: ระบบจะไม่ยอมให้ Submit การประเมิน 360 องศา หากช่อง `evidence_links` ว่างเปล่า และคะแนนต่ำกว่าเกณฑ์ (แก้ปัญหาการประเมินจาก "ความรู้สึก")
2. **Cascade Update**: เมื่อ P4 ประเมินเสร็จ → ระบบจะ Trigger สร้าง Draft `development_plans` (P5) อัตโนมัติผ่าน AI
3. **Feedback Loop**: ข้อมูล P7 ที่แสดงแนวโน้มเชิงลบ จะถูกส่งเป็น Alert ไปยัง Manager Dashboard

## 3. AI Core Integration Points (ตัวอย่าง)
- `POST /api/v1/ai/analyze-match` (ใช้โดย P3): วิเคราะห์ความเหมาะสมระหว่างผู้สมัครกับตำแหน่ง
- `POST /api/v1/ai/generate-dev-plan` (ใช้โดย P5): สร้างแผนพัฒนารายบุคคลจากจุดอ่อนใน P4
- `POST /api/v1/ai/predict-flight-risk` (ใช้โดย P7): คาดการณ์ความเสี่ยงที่พนักงานจะลาออก
