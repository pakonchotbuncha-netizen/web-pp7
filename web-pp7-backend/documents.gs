/**
 * documents.gs — API handler สำหรับระบบเอกสาร PM/WI/SD/FM
 * 
 * รองรับ CRUD เอกสาร 4 ประเภท:
 * - PM (Process Manual): คู่มือกระบวนการทำงาน
 * - WI (Work Instruction): คู่มือปฏิบัติงาน
 * - SD (Standard): มาตรฐานการปฏิบัติงาน
 * - FM (Form): แบบฟอร์ม
 */

/**
 * GET /documents
 * List เอกสารทั้งหมด (รองรับ filter)
 */
function handleDocumentsGet() {
  const params = getQueryParams();
  const filters = {
    type: params.type || null,           // PM, WI, SD, FM
    linked_process: params.process || null, // P1-P7
    status: params.status || null,       // Draft, In Review, Approved, Archived
    owner: params.owner || null,
    search: params.search || null
  };
  
  // RBAC check
  const user = getCurrentUser();
  if (user.role === 'guest') {
    return errorResponse(403, 'Guest ไม่มีสิทธิ์เข้าถึงเอกสาร');
  }
  
  const docs = Database.search('documents', filters);
  
  // Filter by RBAC (bu_manager sees only their BU)
  const filtered = docs.filter(doc => {
    if (user.role === 'bu_manager') {
      return doc.bu === user.bu;
    }
    if (user.role === 'employee') {
      return doc.bu === user.bu && doc.status === 'Approved';
    }
    return true;
  });
  
  return successResponse(filtered);
}

/**
 * GET /documents/:id
 * อ่านเอกสาร 1 รายการ
 */
function handleDocumentGetById(id) {
  const user = getCurrentUser();
  const doc = Database.findById('documents', id);
  
  if (!doc) {
    return errorResponse(404, 'ไม่พบเอกสาร');
  }
  
  // RBAC check
  if (user.role === 'guest') {
    return errorResponse(403, 'Guest ไม่มีสิทธิ์เข้าถึงเอกสาร');
  }
  if (user.role === 'bu_manager' && doc.bu !== user.bu) {
    return errorResponse(403, 'ไม่มีสิทธิ์เข้าถึงเอกสาร BU อื่น');
  }
  
  // Log access
  Database.insert('document_access_log', {
    document_id: id,
    user_id: user.id,
    action: 'View',
    accessed_at: new Date().toISOString()
  });
  
  return successResponse(doc);
}

/**
 * POST /documents
 * สร้างเอกสารใหม่
 */
function handleDocumentPost(body) {
  const user = getCurrentUser();
  
  // RBAC check
  if (!['admin', 'hr_manager', 'bu_manager'].includes(user.role)) {
    return errorResponse(403, 'ไม่มีสิทธิ์สร้างเอกสาร');
  }
  
  // Validate
  if (!body.title || !body.document_type || !body.linked_process) {
    return errorResponse(400, 'กรุณากรอกข้อมูลให้ครบ');
  }
  
  if (!['PM', 'WI', 'SD', 'FM'].includes(body.document_type)) {
    return errorResponse(400, 'document_type ต้องเป็น PM, WI, SD, หรือ FM เท่านั้น');
  }
  
  if (!['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'].includes(body.linked_process)) {
    return errorResponse(400, 'linked_process ต้องเป็น P1-P7 เท่านั้น');
  }
  
  const data = {
    document_id: generateId('DOC'),
    title: body.title,
    document_type: body.document_type,
    linked_process: body.linked_process,
    description: body.description || '',
    version: body.version || '1.0',
    status: 'Draft',
    owner_user_id: user.id,
    owner_bu: user.bu,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: user.id,
    file_url: body.file_url || '',
    file_size_kb: body.file_size_kb || 0,
    content_summary: body.content_summary || '',
    tags: body.tags || '',
    approval_status: 'Pending',
    review_count: 0,
    country: body.country || 'TH'
  };
  
  const result = Database.insert('documents', data);
  return successResponse(result, 201, 'สร้างเอกสารสำเร็จ');
}

/**
 * PUT /documents/:id
 * อัปเดตเอกสาร
 */
function handleDocumentPut(id, body) {
  const user = getCurrentUser();
  const existing = Database.findById('documents', id);
  
  if (!existing) {
    return errorResponse(404, 'ไม่พบเอกสาร');
  }
  
  // RBAC check
  if (user.role === 'employee' || user.role === 'auditor' || user.role === 'guest') {
    return errorResponse(403, 'ไม่มีสิทธิ์แก้ไขเอกสาร');
  }
  if (user.role === 'bu_manager' && existing.owner_bu !== user.bu) {
    return errorResponse(403, 'แก้ไขเฉพาะเอกสาร BU ของตนเอง');
  }
  
  // Create revision record
  const revision = {
    revision_id: generateId('REV'),
    document_id: id,
    version_from: existing.version,
    version_to: body.version || existing.version,
    changed_by: user.id,
    changed_at: new Date().toISOString(),
    change_summary: body.change_summary || 'Updated document',
    file_url_before: existing.file_url,
    file_url_after: body.file_url || existing.file_url
  };
  Database.insert('document_revisions', revision);
  
  // Update document
  const updated = {
    ...existing,
    ...body,
    updated_at: new Date().toISOString(),
    review_count: (existing.review_count || 0) + 1
  };
  
  const result = Database.update('documents', id, updated);
  return successResponse(result, 200, 'อัปเดตเอกสารสำเร็จ');
}

/**
 * DELETE /documents/:id
 * Archive เอกสาร (soft delete)
 */
function handleDocumentDelete(id) {
  const user = getCurrentUser();
  const doc = Database.findById('documents', id);
  
  if (!doc) {
    return errorResponse(404, 'ไม่พบเอกสาร');
  }
  
  // RBAC check
  if (!['admin', 'hr_manager'].includes(user.role)) {
    return errorResponse(403, 'เฉพาะ Admin/HR Manager เท่านั้นที่ archive เอกสารได้');
  }
  
  const result = Database.update('documents', id, {
    status: 'Archived',
    archived_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  return successResponse(result, 200, 'Archive เอกสารสำเร็จ');
}

/**
 * POST /documents/:id/approve
 * อนุมัติเอกสาร
 */
function handleDocumentApprove(id) {
  const user = getCurrentUser();
  const doc = Database.findById('documents', id);
  
  if (!doc) {
    return errorResponse(404, 'ไม่พบเอกสาร');
  }
  
  // RBAC check
  if (!['admin', 'hr_manager'].includes(user.role)) {
    return errorResponse(403, 'ไม่มีสิทธิ์อนุมัติเอกสาร');
  }
  
  const result = Database.update('documents', id, {
    status: 'Approved',
    approval_status: 'Approved',
    approver_user_id: user.id,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  return successResponse(result, 200, 'อนุมัติเอกสารสำเร็จ');
}

/**
 * GET /documents/stats
 * Dashboard statistics
 */
function handleDocumentStats() {
  const allDocs = Database.getAll('documents');
  
  const stats = {
    total: allDocs.length,
    by_type: {
      PM: allDocs.filter(d => d.document_type === 'PM').length,
      WI: allDocs.filter(d => d.document_type === 'WI').length,
      SD: allDocs.filter(d => d.document_type === 'SD').length,
      FM: allDocs.filter(d => d.document_type === 'FM').length
    },
    by_status: {
      Draft: allDocs.filter(d => d.status === 'Draft').length,
      'In Review': allDocs.filter(d => d.status === 'In Review').length,
      Approved: allDocs.filter(d => d.status === 'Approved').length,
      Archived: allDocs.filter(d => d.status === 'Archived').length
    },
    by_process: {},
    recent_updates: allDocs
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 10)
  };
  
  // Count by process (P1-P7)
  for (let i = 1; i <= 7; i++) {
    const pKey = `P${i}`;
    stats.by_process[pKey] = allDocs.filter(d => d.linked_process === pKey).length;
  }
  
  return successResponse(stats);
}

/**
 * GET /documents/search
 * ค้นหาเอกสาร
 */
function handleDocumentSearch() {
  const params = getQueryParams();
  const q = (params.q || '').toLowerCase();
  
  if (!q) {
    return errorResponse(400, 'กรุณาระบุคำค้นหา (q)');
  }
  
  const allDocs = Database.getAll('documents');
  const results = allDocs.filter(doc => {
    return (doc.title || '').toLowerCase().includes(q) ||
           (doc.description || '').toLowerCase().includes(q) ||
           (doc.content_summary || '').toLowerCase().includes(q) ||
           (doc.tags || '').toLowerCase().includes(q);
  });
  
  return successResponse(results);
}
