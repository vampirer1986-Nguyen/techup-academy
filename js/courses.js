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
    const cols = ["id", "title", "slug", "category", "level", "description", "full_description", "price", "duration", "image_url", "is_featured"];
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
