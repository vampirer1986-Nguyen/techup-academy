// Truy vấn khóa học
const Courses = {
  list() {
    return Supa.request("courses?select=*&order=created_at.asc,title.asc");
  },
  async getById(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id || "")) return null;
    const rows = await Supa.request(`courses?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
    return rows && rows[0] ? rows[0] : null;
  }
};
