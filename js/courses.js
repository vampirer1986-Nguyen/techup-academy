// Tính giá (nguồn duy nhất cho cả giao diện người dùng lẫn form admin). price = giá gốc.
// Trả về { original, final, discounted, saved, type, value, error }. Cấu hình không hợp lệ => không giảm.
const Pricing = {
  compute(c) {
    const original = Number(c.price) || 0;
    const base = { original, final: original, discounted: false, saved: 0, type: null, value: 0, error: "" };
    if (!c.discount_enabled) return base;
    const type = c.discount_type, value = Number(c.discount_value);
    if (type !== "percentage" && type !== "fixed") return { ...base, error: "Vui lòng chọn hình thức giảm giá." };
    if (c.discount_value === "" || c.discount_value == null || !Number.isFinite(value) || value <= 0)
      return { ...base, error: "Giá trị giảm phải là số lớn hơn 0." };
    if (type === "percentage" && value >= 100) return { ...base, error: "Phần trăm giảm phải nhỏ hơn 100% (giá sau giảm phải lớn hơn 0)." };
    const final = Math.round(type === "percentage" ? original * (1 - value / 100) : original - value);
    if (final <= 0) return { ...base, error: "Mức giảm phải nhỏ hơn giá gốc để giá sau giảm lớn hơn 0." };
    return { original, final, discounted: true, saved: original - final, type, value, error: "" };
  }
};

// Truy vấn khóa học
const Courses = {
  list() {
    return Supa.request("courses?select=*&order=created_at.asc,title.asc");
  },
  // --- Chỉ admin (RLS kiểm tra ở database) ---
  create(token, row) {
    return Supa.request("courses", { method: "POST", token, body: row, prefer: "return=representation" });
  },
  update(token, id, row) {
    return Supa.request(`courses?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", token, body: row, prefer: "return=representation" });
  },
  async remove(token, id) {
    const r = await Supa.request(`courses?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", token, prefer: "return=representation" });
    // RLS từ chối thì PostgREST trả mảng rỗng chứ không báo lỗi
    if (!r || !r.length) throw new Supa.DbError("Không xóa được: không có quyền hoặc khóa học không tồn tại.", "FORBIDDEN");
  },
  // --- Xuất CSV (chạy hoàn toàn ở trình duyệt) ---
  toCsv(list) {
    const cols = ["id", "title", "slug", "category", "level", "description", "full_description", "price", "discount_enabled", "discount_type", "discount_value", "final_price", "duration", "image_url", "is_featured"];
    const esc = v => {
      let s = v == null ? "" : String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;   // chống CSV/formula injection khi mở bằng Excel
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return [cols.join(","), ...list.map(c => cols.map(k => esc(c[k])).join(","))].join("\r\n");
  },
  downloadCsv(list) {
    const blob = new Blob(["﻿" + this.toCsv(list)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "techup-courses.csv";
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  async getById(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id || "")) return null;
    const rows = await Supa.request(`courses?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
    return rows && rows[0] ? rows[0] : null;
  }
};
