// Trang quản trị khóa học. Mọi thao tác ghi gửi kèm JWT; database (RLS) quyết định có cho phép hay không.
Pages.admin = function () {
  const loginBox = $("#login-box"), panel = $("#panel"), who = $("#who");
  const form = $("#c-form"), formWrap = $("#form-wrap"), tableBox = $("#table-box");
  let courses = [];

  const slugify = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  function showState() {
    const s = Auth.session();
    loginBox.classList.toggle("d-none", !!s);
    panel.classList.toggle("d-none", !s);
    who.replaceChildren();
    if (s) {
      who.append(`Đã đăng nhập: ${s.email} `, el("button", { class: "btn btn-outline-light btn-sm ms-2", type: "button",
        onclick: () => { Auth.logout(); location.href = "index.html"; } }, "Đăng xuất"));
      load();
    }
  }

  async function load() {
    stateBox(tableBox, "loading");
    try { courses = await Courses.list(); } catch (e) { return stateBox(tableBox, "error", e.message); }
    if (!courses.length) return stateBox(tableBox, "info", "Chưa có khóa học nào.");
    const rows = courses.map(c => el("tr", {},
      el("td", {}, c.title), el("td", {}, c.category), el("td", {}, LEVELS[c.level] || c.level),
      el("td", { class: "text-nowrap" }, priceBlock(c)), el("td", {}, c.is_featured ? "★" : ""),
      el("td", { class: "text-nowrap" },
        el("button", { class: "btn btn-outline-primary btn-sm me-1", type: "button", onclick: () => openForm(c) }, "Sửa"),
        el("button", { class: "btn btn-outline-danger btn-sm", type: "button", onclick: () => del(c) }, "Xóa"))));
    tableBox.replaceChildren(el("div", { class: "table-responsive" }, el("table", { class: "table table-hover align-middle bg-white" },
      el("thead", {}, el("tr", {}, ...["Tên", "Danh mục", "Trình độ", "Học phí", "Nổi bật", ""].map(h => el("th", { scope: "col" }, h)))),
      el("tbody", {}, rows))));
  }

  // Cấu hình giảm giá đọc từ form (cũng dùng cho bản xem trước)
  const discFromForm = () => ({ price: $("#c-price").value, discount_enabled: $("#c-disc-on").checked,
    discount_type: $("#c-disc-type").value, discount_value: $("#c-disc-value").value });

  function updateDiscountUi() {
    const on = $("#c-disc-on").checked, pct = $("#c-disc-type").value === "percentage";
    $("#disc-fields").classList.toggle("d-none", !on && !$("#c-disc-value").value);   // gọn khi tắt và chưa có cấu hình
    for (const i of ["#c-disc-type", "#c-disc-value"]) $(i).disabled = !on;
    $("#disc-value-label").textContent = pct ? "Phần trăm giảm (%)" : "Số tiền giảm (VNĐ)";
    $("#c-disc-value").max = pct ? 99.99 : ""; $("#c-disc-value").step = pct ? "any" : "1";
    const p = Pricing.compute(discFromForm());
    $("#disc-err").textContent = on ? p.error : "";
    $("#disc-preview").replaceChildren(priceBlock(discFromForm(), true));
    if (!on) $("#disc-preview").append(el("div", { class: "small text-muted" }, "Giảm giá đang tắt: website hiển thị giá gốc."));
  }

  function openForm(c) {
    form.reset();
    $("#form-err").textContent = "";
    $("#form-title").textContent = c ? "Sửa khóa học" : "Thêm khóa học";
    $("#c-id").value = c ? c.id : "";
    if (c) {
      $("#c-title").value = c.title; $("#c-slug").value = c.slug || ""; $("#c-category").value = c.category;
      $("#c-level").value = c.level; $("#c-duration").value = c.duration; $("#c-price").value = c.price;
      $("#c-image").value = c.image_url || ""; $("#c-desc").value = c.description;
      $("#c-full").value = c.full_description || ""; $("#c-featured").checked = c.is_featured;
      $("#c-disc-on").checked = !!c.discount_enabled; $("#c-disc-type").value = c.discount_type || "percentage";
      $("#c-disc-value").value = c.discount_value == null ? "" : c.discount_value;
    }
    updateDiscountUi();
    formWrap.classList.remove("d-none");
    formWrap.scrollIntoView({ behavior: "smooth" });
    $("#c-title").focus();
  }

  function readForm() {
    const v = id => $(id).value.trim();
    const title = v("#c-title");
    return {
      title, slug: v("#c-slug") || slugify(title), category: v("#c-category"), level: $("#c-level").value,
      description: v("#c-desc"), full_description: v("#c-full") || null, price: Number(v("#c-price")),
      duration: v("#c-duration"), image_url: v("#c-image") || null, is_featured: $("#c-featured").checked,
      // Khi tắt vẫn lưu lại cấu hình để bật lại sau này
      discount_enabled: $("#c-disc-on").checked, discount_type: $("#c-disc-type").value,
      discount_value: v("#c-disc-value") === "" ? null : Number(v("#c-disc-value"))
    };
  }

  function validate(r) {
    if (!r.title) return "Vui lòng nhập tên khóa học.";
    if (!r.slug) return "Không tạo được slug từ tên khóa học, vui lòng nhập slug.";
    if (!r.category) return "Vui lòng nhập danh mục.";
    if (!r.description) return "Vui lòng nhập mô tả ngắn.";
    if (!r.duration) return "Vui lòng nhập thời lượng.";
    if (!Number.isFinite(r.price) || r.price < 0 || $("#c-price").value === "") return "Học phí phải là số không âm.";
    if (r.discount_value != null && (!Number.isFinite(r.discount_value) || r.discount_value < 0)) return "Giá trị giảm phải là số không âm.";
    if (r.discount_value != null && r.discount_type === "percentage" && r.discount_value > 100) return "Phần trăm giảm không được vượt quá 100%.";
    if (r.discount_enabled) { const e = Pricing.compute(r).error; if (e) return e; }
    if (r.image_url && !/^https?:\/\//i.test(r.image_url)) return "URL ảnh phải bắt đầu bằng http:// hoặc https://.";
    return "";
  }

  async function del(c) {
    if (!confirm(`Xóa khóa học "${c.title}"? Thao tác không thể hoàn tác.`)) return;
    try {
      await Courses.remove(Auth.session().token, c.id);
      toast("Đã xóa khóa học.");
      load();
    } catch (e) { toast(e.message, "danger"); }
  }

  for (const id of ["#c-price", "#c-disc-on", "#c-disc-type", "#c-disc-value"]) $(id).addEventListener("input", updateDiscountUi);
  $("#btn-new").addEventListener("click", () => openForm(null));
  $("#btn-cancel").addEventListener("click", () => formWrap.classList.add("d-none"));

  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const row = readForm(), err = validate(row);
    $("#form-err").textContent = err;
    if (err) return;
    const s = Auth.session();
    if (!s) { toast("Phiên đăng nhập đã hết hạn.", "danger"); return showState(); }
    const id = $("#c-id").value, btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      if (id) {
        const r = await Courses.update(s.token, id, row);
        if (!r || !r.length) throw new Supa.DbError("Không lưu được: không có quyền hoặc khóa học không tồn tại.", "FORBIDDEN");
      } else {
        await Courses.create(s.token, row);
      }
      toast(id ? "Đã cập nhật khóa học." : "Đã thêm khóa học.");
      formWrap.classList.add("d-none");
      load();
    } catch (e) {
      $("#form-err").textContent = e.message;
      toast(e.message, "danger");
    } finally { btn.disabled = false; }
  });

  $("#login-form").addEventListener("submit", async ev => {
    ev.preventDefault();
    const msg = $("#login-msg"), btn = ev.target.querySelector("button");
    msg.replaceChildren();
    const email = $("#l-email").value.trim(), pass = $("#l-pass").value;
    if (!email || !pass) return msg.append(el("div", { class: "alert alert-warning" }, "Vui lòng nhập email và mật khẩu."));
    btn.disabled = true;
    try { await Auth.login(email, pass); $("#l-pass").value = ""; showState(); }
    catch (e) { msg.append(el("div", { class: "alert alert-danger" }, e.message)); }
    finally { btn.disabled = false; }
  });

  showState();
};
