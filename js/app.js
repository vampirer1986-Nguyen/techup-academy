// Tiện ích dùng chung + điều khiển từng trang (theo data-page của <body>)
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
}

const fmtPrice = p => new Intl.NumberFormat("vi-VN").format(p) + " ₫";
const LEVELS = { Beginner: "Cơ bản", Intermediate: "Trung cấp", Advanced: "Nâng cao" };
const ICONS = { Web: "🌐", "Lập trình": "💻", "Thiết kế": "🎨", AI: "🤖" };

function toast(message, type = "success") {
  let box = $("#toast-box");
  if (!box) {
    box = el("div", { id: "toast-box", class: "toast-container position-fixed top-0 end-0 p-3", "aria-live": "polite" });
    document.body.append(box);
  }
  const t = el("div", { class: `alert alert-${type} shadow mb-2`, role: "alert" }, message);
  box.append(t);
  setTimeout(() => t.remove(), 5000);
}

function renderChrome() {
  const page = document.body.dataset.page;
  const link = (href, text, key) => el("li", { class: "nav-item" },
    el("a", { class: "nav-link" + (page === key ? " active" : ""), href }, text));
  const nav = el("nav", { class: "navbar navbar-expand-lg navbar-dark sticky-top" },
    el("div", { class: "container" },
      el("a", { class: "navbar-brand fw-bold d-flex align-items-center gap-2", href: "./index.html" },
        el("span", { class: "logo-badge" }, el("img", { src: "./assets/images/logo.png", alt: "", width: "28", height: "28" })),
        "TechUp Academy"),
      el("button", { class: "navbar-toggler", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#nav", "aria-controls": "nav", "aria-expanded": "false", "aria-label": "Mở menu" },
        el("span", { class: "navbar-toggler-icon" })),
      el("div", { class: "collapse navbar-collapse", id: "nav" },
        el("ul", { class: "navbar-nav ms-auto" },
          link("./index.html", "Trang chủ", "home"),
          link("./courses.html", "Khóa học", "courses"),
          link("./my-registrations.html", "Đăng ký của tôi", "mine"),
          link("./about.html", "Về chúng tôi", "about")))));
  document.body.prepend(nav);
  document.body.append(el("footer", { class: "site-footer mt-5 py-4" }, el("div", { class: "container" },
    el("div", { class: "row g-3" },
      el("div", { class: "col-md-5" }, el("h5", { class: "d-flex align-items-center gap-2" },
          el("span", { class: "logo-badge" }, el("img", { src: "./assets/images/logo.png", alt: "", width: "28", height: "28" })), "TechUp Academy")),
      el("div", { class: "col-md-4" }, el("h6", {}, "Liên hệ"),
        el("p", { class: "mb-0 small" }, "Email: vampirer1986@gmail.com", el("br"), "Điện thoại: 0919 601 670", el("br"), "Địa chỉ: Số 311, đường số 8, phường An Khánh, TP Hồ Chí Minh")),
      el("div", { class: "col-md-3" }, el("h6", {}, "Liên kết nhanh"),
        el("a", { href: "./courses.html" }, "Khóa học"), el("br"), el("a", { href: "./about.html" }, "Về chúng tôi"), el("br"), el("a", { href: "./admin.html" }, "Quản trị"))),
    el("hr"), el("p", { class: "small mb-0" }, "© 2026 TechUp Academy"))));
}

function stateBox(container, kind, text) {
  container.replaceChildren();
  if (kind === "loading") {
    container.append(el("div", { class: "text-center py-5" },
      el("div", { class: "spinner-border text-primary", role: "status" }),
      el("p", { class: "mt-2 text-muted" }, text || "Đang tải dữ liệu...")));
  } else {
    container.append(el("div", { class: `alert alert-${kind === "error" ? "danger" : "info"}`, role: "alert" }, text));
  }
}

// Ảnh khóa học (image_url); không có ảnh hoặc ảnh lỗi thì dùng biểu tượng theo danh mục.
function courseVisual(c, cls) {
  const box = el("div", { class: cls, role: "img", "aria-label": c.category }, ICONS[c.category] || "📘");
  if (c.image_url) {
    const img = el("img", { src: c.image_url, alt: "", referrerpolicy: "no-referrer" });
    img.onload = () => box.replaceChildren(img);
    box.classList.add("has-image");
  }
  return box;
}

function courseCard(c) {
  return el("div", { class: "col-md-6 col-lg-4" }, el("div", { class: "card course-card h-100" },
    courseVisual(c, "course-thumb"),
    el("div", { class: "card-body d-flex flex-column" },
      el("div", { class: "mb-2" },
        el("span", { class: "badge text-bg-primary me-1" }, c.category),
        el("span", { class: "badge text-bg-light border" }, LEVELS[c.level] || c.level)),
      el("h3", { class: "h5 card-title" }, c.title),
      el("p", { class: "card-text text-muted flex-grow-1" }, c.description),
      el("div", { class: "d-flex justify-content-between align-items-center mb-3" },
        el("strong", { class: "text-primary" }, fmtPrice(c.price)),
        el("span", { class: "small text-muted" }, "⏱ " + c.duration)),
      el("a", { class: "btn btn-primary", href: `./course-detail.html?id=${encodeURIComponent(c.id)}` }, "Xem chi tiết"))));
}

async function renderCourseGrid(container, filter) {
  stateBox(container, "loading");
  try {
    let list = await Courses.list();
    if (filter) list = filter(list);
    container.replaceChildren();
    if (!list.length) return stateBox(container, "info", "Chưa có khóa học nào.");
    container.append(...list.map(courseCard));
  } catch (e) {
    stateBox(container, "error", e.message);
  }
}

// ---------- Các trang ----------
const Pages = {
  home() {
    renderCourseGrid($("#featured"), l => {
      const f = l.filter(c => c.is_featured);
      return (f.length ? f : l).slice(0, 6);
    });
  },

  courses() {
    const grid = $("#grid");
    let all = [];
    const apply = () => {
      const q = $("#q").value.trim().toLowerCase(), cat = $("#cat").value, lv = $("#lv").value, sort = $("#sort").value;
      const r = all.filter(c => (!q || c.title.toLowerCase().includes(q)) && (!cat || c.category === cat) && (!lv || c.level === lv));
      if (sort) r.sort((a, b) => sort === "asc" ? a.price - b.price : b.price - a.price);
      grid.replaceChildren();
      if (!r.length) return stateBox(grid, "info", "Không tìm thấy khóa học phù hợp.");
      grid.append(...r.map(courseCard));
    };
    stateBox(grid, "loading");
    Courses.list().then(l => {
      all = l;
      [...new Set(l.map(c => c.category))].forEach(c => $("#cat").append(el("option", { value: c }, c)));
      apply();
      const btn = $("#export-csv");
      btn.disabled = !l.length;
      btn.addEventListener("click", () => { Courses.downloadCsv(all); toast("Đã xuất file techup-courses.csv"); });
    }).catch(e => stateBox(grid, "error", e.message));
    ["q", "cat", "lv", "sort"].forEach(id => $("#" + id).addEventListener("input", apply));
  },

  async detail() {
    const box = $("#detail");
    stateBox(box, "loading");
    const id = new URLSearchParams(location.search).get("id");
    let c;
    try { c = await Courses.getById(id); } catch (e) { return stateBox(box, "error", e.message); }
    if (!c) {
      box.replaceChildren(el("div", { class: "alert alert-warning" },
        "Không tìm thấy khóa học. ", el("a", { href: "./courses.html" }, "← Quay lại danh sách khóa học")));
      return;
    }
    document.title = c.title + " – TechUp Academy";
    const lines = (c.full_description || c.description).split("\n").filter(Boolean);
    const outline = lines.filter(l => l.startsWith("- ")).map(l => el("li", {}, l.slice(2)));
    const intro = lines.filter(l => !l.startsWith("- ")).map(l => el("p", {}, l));
    box.replaceChildren(el("div", { class: "row g-4" },
      el("div", { class: "col-lg-8" },
        courseVisual(c, "course-hero mb-3"),
        el("h1", { class: "h2" }, c.title), el("p", { class: "lead" }, c.description), intro,
        outline.length ? [el("h2", { class: "h5 mt-4" }, "Nội dung khóa học"), el("ul", {}, outline)] : null),
      el("div", { class: "col-lg-4" }, el("div", { class: "card shadow-sm" }, el("div", { class: "card-body" },
        el("p", { class: "h3 text-primary" }, fmtPrice(c.price)),
        el("p", { class: "mb-1" }, "⏱ Thời lượng: ", c.duration),
        el("p", { class: "mb-1" }, "📊 Trình độ: ", LEVELS[c.level] || c.level),
        el("p", {}, "🏷 Danh mục: ", c.category),
        el("a", { class: "btn btn-primary w-100", href: "#dang-ky" }, "Đăng ký khóa học"))))));
    $("#reg-section").classList.remove("d-none");
    const form = $("#reg-form");
    const select = $("#course");
    select.append(el("option", { value: c.id }, c.title));
    select.value = c.id;
    Courses.list().then(all => {
      select.replaceChildren(...all.map(x => el("option", { value: x.id }, x.title)));
      select.value = c.id;
    }).catch(() => { /* giữ lại khóa học hiện tại nếu không tải được danh sách */ });
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const v = { name: form.name.value, email: form.email.value, phone: form.phone.value };
      const errs = Registrations.validate(v);
      const courseId = select.value;
      if (!/^[0-9a-f-]{36}$/i.test(courseId)) errs.course = "Vui lòng chọn khóa học.";
      for (const f of ["course", "name", "email", "phone"]) {
        form[f].classList.toggle("is-invalid", !!errs[f]);
        $("#err-" + f).textContent = errs[f] || "";
      }
      if (Object.keys(errs).length) return;
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Đang gửi...";
      try {
        const r = await Registrations.create(courseId, v.name, v.email, v.phone);
        form.reset();
        select.value = courseId;
        $("#reg-result").replaceChildren(el("div", { class: "alert alert-success" },
          "Đăng ký thành công! Mã đăng ký: ", el("strong", {}, r.id), ". ",
          el("a", { href: "./my-registrations.html" }, "Xem / cập nhật / hủy đăng ký của tôi")));
        toast("Đăng ký thành công!");
      } catch (e) {
        $("#reg-result").replaceChildren(el("div", { class: "alert alert-danger" }, e.message));
        toast(e.message, "danger");
      } finally {
        btn.disabled = false;
        btn.textContent = "Gửi đăng ký";
      }
    });
  },

  mine() {
    const box = $("#list");
    if (!Registrations.local().length) {
      return stateBox(box, "info", "Bạn chưa có đăng ký nào trên trình duyệt này. Hãy chọn một khóa học để đăng ký.");
    }
    stateBox(box, "loading");
    const render = async () => {
      let rows;
      try {
        rows = await Promise.all(Registrations.local().map(async i => ({ i, r: await Registrations.get(i.id, i.token) })));
      } catch (e) { return stateBox(box, "error", e.message); }
      rows = rows.filter(x => x.r);
      box.replaceChildren();
      if (!rows.length) return stateBox(box, "info", "Không tìm thấy đăng ký nào.");
      rows.forEach(({ i, r }) => box.append(regCard(i, r, render)));
    };
    render();
  }
};

function field(label, name, value, type = "text") {
  const id = "f-" + name + Math.random().toString(36).slice(2, 6);
  const input = el("input", { class: "form-control", id, name, type });
  input.value = value;
  return el("div", { class: "mb-2" }, el("label", { class: "form-label", for: id }, label), input);
}

function regCard(i, r, refresh) {
  const active = r.status === "registered";
  const body = el("div", { class: "card-body" });
  const view = () => {
    body.replaceChildren(
      el("div", { class: "d-flex justify-content-between" },
        el("h2", { class: "h5" }, r.course_title),
        el("span", { class: `badge ${active ? "text-bg-success" : "text-bg-secondary"}` }, active ? "Đã đăng ký" : "Đã hủy")),
      el("p", { class: "mb-1" }, "Họ tên: ", r.student_name),
      el("p", { class: "mb-1" }, "Email: ", r.email),
      el("p", { class: "mb-2" }, "Điện thoại: ", r.phone || "—"),
      active ? el("div", {},
        el("button", { class: "btn btn-outline-primary btn-sm me-2", onclick: edit }, "Chỉnh sửa"),
        el("button", { class: "btn btn-outline-danger btn-sm", onclick: cancel }, "Hủy đăng ký")) : null);
  };
  const cancel = async () => {
    if (!confirm(`Bạn chắc chắn muốn hủy đăng ký khóa "${r.course_title}"?`)) return;
    try {
      await Registrations.cancel(i.id, i.token);
      toast("Đã hủy đăng ký.");
      refresh();
    } catch (e) { toast(e.message, "danger"); }
  };
  const edit = () => {
    const f = el("form", { novalidate: "" },
      field("Họ tên", "name", r.student_name),
      field("Email", "email", r.email, "email"),
      field("Điện thoại", "phone", r.phone || ""),
      el("button", { class: "btn btn-primary btn-sm me-2", type: "submit" }, "Lưu"),
      el("button", { class: "btn btn-light btn-sm", type: "button", onclick: view }, "Đóng"));
    f.addEventListener("submit", async ev => {
      ev.preventDefault();
      const v = { name: f.name.value, email: f.email.value, phone: f.phone.value };
      const errs = Registrations.validate(v);
      if (Object.keys(errs).length) return toast(Object.values(errs)[0], "danger");
      try {
        await Registrations.update(i.id, i.token, v.name, v.email, v.phone);
        toast("Đã cập nhật đăng ký.");
        refresh();
      } catch (e) { toast(e.message, "danger"); }
    });
    body.replaceChildren(f);
  };
  view();
  return el("div", { class: "card shadow-sm mb-3" }, body);
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const fn = Pages[document.body.dataset.page];
  if (fn) fn();
});
