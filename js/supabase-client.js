// Lớp kết nối Supabase (REST/PostgREST) bằng fetch - không cần backend riêng.
const Supa = (() => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.TECHUP_CONFIG || {};

  class DbError extends Error {
    constructor(message, code) { super(message); this.code = code; }
  }

  const MESSAGES = {
    ALREADY_REGISTERED: "Email này đã đăng ký khóa học này rồi.",
    NOT_ALLOWED: "Bạn không có quyền thao tác hoặc đăng ký đã bị hủy.",
    COURSE_NOT_FOUND: "Không tìm thấy khóa học."
  };

  async function request(path, { method = "GET", body, token, prefer } = {}) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new DbError("Chưa cấu hình Supabase (js/config.js).", "NO_CONFIG");
    }
    let res;
    try {
      res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method,
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(prefer ? { Prefer: prefer } : {})
        },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      throw new DbError("Không thể kết nối tới máy chủ dữ liệu. Vui lòng kiểm tra mạng và thử lại.", "NETWORK");
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
    if (!res.ok) {
      const raw = (data && (data.message || data.error)) || "";
      const key = Object.keys(MESSAGES).find(k => raw.includes(k));
      if (key) throw new DbError(MESSAGES[key], key);
      if (data && data.code === "23514") throw new DbError("Dữ liệu không hợp lệ (kiểm tra các trường đã nhập).", "CHECK");
      if (data && data.code === "23505") throw new DbError("Dữ liệu bị trùng (ví dụ slug đã tồn tại).", "DUP");
      if (data && data.code === "23503") throw new DbError("Khóa học đã có đăng ký nên không thể xóa.", "FK");
      if (token && (res.status === 401 || res.status === 403 || (data && data.code === "42501"))) {
        throw new DbError("Phiên đăng nhập hết hạn hoặc tài khoản không có quyền quản trị.", "FORBIDDEN");
      }
      throw new DbError("Thao tác thất bại. Vui lòng thử lại sau.", "HTTP_" + res.status);
    }
    return data;
  }

  return { request, DbError };
})();
