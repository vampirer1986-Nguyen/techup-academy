// Đăng ký / cập nhật / hủy qua RPC. Mã bí mật (token) lưu ở localStorage của người đăng ký.
const Registrations = {
  KEY: "techup_registrations",
  local() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; }
  },
  saveLocal(list) {
    try { localStorage.setItem(this.KEY, JSON.stringify(list)); } catch { /* ignore */ }
  },
  async create(courseId, name, email, phone) {
    const r = await Supa.request("rpc/register_course", { method: "POST",
      body: { p_course_id: courseId, p_name: name, p_email: email, p_phone: phone || null } });
    const list = this.local(); list.push({ id: r.id, token: r.token }); this.saveLocal(list);
    return r;
  },
  get(id, token) {
    return Supa.request("rpc/get_registration", { method: "POST", body: { p_id: id, p_token: token } });
  },
  update(id, token, name, email, phone) {
    return Supa.request("rpc/update_registration", { method: "POST",
      body: { p_id: id, p_token: token, p_name: name, p_email: email, p_phone: phone || null } });
  },
  cancel(id, token) {
    return Supa.request("rpc/cancel_registration", { method: "POST", body: { p_id: id, p_token: token } });
  },
  validate({ name, email, phone }) {
    const errors = {};
    if (!name || name.trim().length < 2) errors.name = "Vui lòng nhập họ tên (tối thiểu 2 ký tự).";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((email || "").trim())) errors.email = "Email không hợp lệ.";
    if (phone && !/^[0-9+\s().-]{8,20}$/.test(phone.trim())) errors.phone = "Số điện thoại không hợp lệ.";
    return errors;
  }
};
