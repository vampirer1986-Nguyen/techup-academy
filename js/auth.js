// Đăng nhập quản trị qua Supabase Auth (GoTrue REST). Token lưu ở sessionStorage (mất khi đóng tab).
// Quyền thật sự do RLS ở database quyết định; việc đăng nhập ở đây chỉ để lấy JWT.
const Auth = (() => {
  const KEY = "techup_admin_session";
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.TECHUP_CONFIG || {};

  const read = () => { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } };
  const write = s => { try { s ? sessionStorage.setItem(KEY, JSON.stringify(s)) : sessionStorage.removeItem(KEY); } catch { /* ignore */ } };

  async function login(email, password) {
    let res;
    try {
      res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
    } catch { throw new Supa.DbError("Không thể kết nối tới máy chủ. Vui lòng thử lại.", "NETWORK"); }
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Supa.DbError("Email hoặc mật khẩu không đúng.", "LOGIN");
    write({ token: d.access_token, email: d.user && d.user.email, exp: Date.now() + (d.expires_in || 3600) * 1000 });
    return read();
  }

  function session() {
    const s = read();
    if (!s || s.exp < Date.now()) { write(null); return null; }
    return s;
  }

  return { login, session, logout: () => write(null) };
})();
