// ===== Edit these: the sites (streets, extensions, sections) in your area =====
const SITES = ["Extension 1", "Extension 2", "Extension 3", "Extension 4", "Extension 5", "Extension 6"];
const ADMIN_PIN = "2468"; // DEMO ONLY: anyone can read this in the code. Real security comes with Firebase rules.
// ======================
const CATS = [["issue", "Issues", "#2F6FB5", "Water, power, roads"], ["business", "Businesses", "#FF7A00", "Plumbers, mechanics"], ["room", "Rooms", "#2F8A12", "Available and wanted"], ["notice", "Notices", "#B5472F", "Meetings and alerts"]];
const KEY = "neighbournet-demo-v1";
const $ = s => document.querySelector(s);
const day = 864e5, t0 = Date.now();
const seed = [
  { id: "s1", cat: "issue", site: "Extension 4", title: "Sample: No power since this morning", details: "Streets near the taxi rank. Add your reference number if you reported it.", contact: "", t: t0 - day, status: "approved" },
  { id: "s2", cat: "issue", site: "Extension 2", title: "Sample: Burst water pipe", details: "Water running down the street since Monday.", contact: "", t: t0 - 3 * day, status: "approved" },
  { id: "s3", cat: "business", site: "Extension 4", title: "Sample: Plumber, serves the whole area", details: "Leaks, geysers, blocked drains. Call or WhatsApp for a quote.", contact: "0710000000", t: t0 - 2 * day, status: "approved" },
  { id: "s4", cat: "room", site: "Extension 4", title: "Sample: Backroom to rent", details: "Own entrance, prepaid electricity. Price on request.", contact: "0720000000", t: t0 - day, status: "approved" },
  { id: "s5", cat: "room", site: "Extension 2", title: "Sample: Looking for a room near the taxi rank", details: "One working person, no smoking.", contact: "0730000000", t: t0 - 4 * day, status: "approved" },
  { id: "s6", cat: "notice", site: "Extension 4", title: "Sample: Street committee meeting", details: "Saturday at 10:00 at the community hall.", contact: "", t: t0 - 2 * day, status: "approved" }
];
function read(k, fallback) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fallback; } catch (e) { return fallback; } }
function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
seed.forEach(p => p.author = "Sample neighbour");
let posts = read(KEY, seed), meToo = read(KEY + ":me", []);
let users = read(KEY + ":users", []), session = read(KEY + ":session", ""), authMode = "in", pending = null;
const user = () => users.find(u => u.phone === session);
function requireUser(cb) { if (user()) return cb(); pending = cb; setMode("in"); $("#authDlg").showModal(); }
let site = read(KEY + ":site", ""), cat = "issue", admin = false;

function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
function phone(n) { let d = String(n).replace(/\D/g, ""); if (d.startsWith("0")) d = "27" + d.slice(1); return d; }
function ago(t) { const d = Math.floor((Date.now() - t) / day); return d < 1 ? "Today" : d === 1 ? "Yesterday" : d + " days ago"; }
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2800); }
function save() { write(KEY, posts); }
function opts(sel, list, first) {
  sel.textContent = "";
  if (first) sel.append(new Option(first, ""));
  list.forEach(v => sel.append(new Option(Array.isArray(v) ? v[1] : v, Array.isArray(v) ? v[0] : v)));
}

function setMode(m) {
  authMode = m; $("#nameRow").hidden = m === "in"; $("#aName").required = m === "new"; $("#aErr").textContent = "";
  $("#authTitle").textContent = m === "in" ? "Sign in to post" : "Create your free account";
  $("#authGo").textContent = m === "in" ? "Sign in" : "Create account";
  $("#tabIn").classList.toggle("active", m === "in"); $("#tabNew").classList.toggle("active", m === "new");
  $("#aPin").autocomplete = m === "in" ? "current-password" : "new-password";
}
function card(p) {
  const cinfo = CATS.find(c => c[0] === p.cat), who = p.author || "Neighbour";
  const c = el("article", "card nn-card post"), b = el("div", "card-body d-grid gap-2"); c.append(b); c.style.setProperty("--c", cinfo[2]);
  const top = el("div", "d-flex flex-wrap gap-2 align-items-center");
  top.append(el("span", "badge bg-light text-dark border", cinfo[1]), el("span", "badge text-bg-success", p.site));
  if (p.status !== "approved") top.append(el("span", "badge text-bg-warning", "Waiting for approval"));
  top.append(el("span", "ms-auto small text-secondary", ago(p.t)));
  const by = el("div", "d-flex align-items-center gap-2 small text-secondary"); by.append(el("span", "avatar", who[0].toUpperCase()), el("span", "", "Posted by " + who));
  b.append(top, el("h3", "h6 fw-bold mb-0", p.title), el("p", "mb-0 text-secondary pre", p.details), by);
  const acts = el("div", "d-flex flex-wrap gap-2");
  if (p.contact) {
    const wa = el("a", "btn btn-success", "WhatsApp"); wa.href = "https://wa.me/" + phone(p.contact); wa.target = "_blank"; wa.rel = "noopener";
    const call = el("a", "btn btn-outline-success", "Call"); call.href = "tel:+" + phone(p.contact);
    acts.append(wa, call);
  }
  if (p.cat === "issue") {
    const m = el("button", "btn btn-outline-success", "Me too \u00b7 " + (p.me || 0)); m.type = "button";
    m.disabled = !!user() && meToo.includes(user().phone + ":" + p.id);
    m.onclick = () => requireUser(() => { p.me = (p.me || 0) + 1; meToo.push(user().phone + ":" + p.id); write(KEY + ":me", meToo); save(); render(); });
    acts.append(m);
  }
  const sh = el("a", "btn btn-outline-secondary", "Share");
  sh.href = "https://wa.me/?text=" + encodeURIComponent(p.title + " (" + p.site + ") " + location.href.split("#")[0]);
  sh.target = "_blank"; sh.rel = "noopener"; acts.append(sh);
  if (admin) {
    if (p.status !== "approved") { const a = el("button", "btn btn-success", "Approve"); a.type = "button"; a.onclick = () => { p.status = "approved"; save(); render(); }; acts.append(a); }
    const r = el("button", "btn btn-outline-danger", "Remove"); r.type = "button";
    r.onclick = () => { if (confirm("Remove this post?")) { posts = posts.filter(x => x.id !== p.id); save(); render(); } };
    acts.append(r);
  }
  b.append(acts);
  return c;
}

function render() {
  const nu = $("#navUser"); nu.textContent = "";
  const u = user();
  if (u) { const o = el("button", "btn btn-outline-secondary btn-sm", "Sign out"); o.type = "button"; o.onclick = () => { session = ""; write(KEY + ":session", ""); render(); toast("Signed out"); }; nu.append(el("span", "small d-none d-sm-inline", "Hi, " + u.name.split(" ")[0]), o); }
  else { const i = el("button", "btn btn-outline-secondary btn-sm", "Sign in"); i.type = "button"; i.onclick = () => requireUser(() => {}); nu.append(i); }
  const here = posts.filter(p => !site || p.site === site), ok = here.filter(p => p.status === "approved");
  const stats = $("#stats"); stats.textContent = "";
  CATS.forEach(([id, name, col, desc]) => {
    const w = el("div", "col-6 col-md-3"), b = el("button", "stat");
    b.type = "button"; b.style.setProperty("--c", col); b.setAttribute("aria-pressed", id === cat);
    b.append(el("b", "", String(ok.filter(p => p.cat === id).length)), el("span", "", name), el("small", "", desc));
    b.onclick = () => { cat = id; render(); }; w.append(b); stats.append(w);
  });
  $("#feedTitle").textContent = CATS.find(c => c[0] === cat)[1] + " in " + (site || "all sites");
  const list = here.filter(p => p.cat === cat && (admin || p.status === "approved"));
  const main = $("#list"); main.textContent = "";
  if (!list.length) main.append(el("p", "text-center text-secondary py-4", "Nothing here yet. Be the first to post."));
  list.forEach(p => main.append(card(p)));
  const top = $("#top"); top.textContent = "";
  const hot = ok.filter(p => p.cat === "issue" && p.me > 0).sort((a, b) => b.me - a.me).slice(0, 3);
  if (!hot.length) top.append(el("li", "small text-secondary", "No issues yet. Tap Me too on an issue you share."));
  hot.forEach(p => { const li = el("li", "tops"), b = el("button", "", p.me + " neighbours: " + p.title); b.type = "button"; b.onclick = () => { cat = "issue"; render(); }; li.append(b); top.append(li); });
  $("#adminBtn").textContent = admin ? "Leave admin mode" : "Admin";
}

opts($("#site"), SITES, "All sites"); $("#site").value = site;
opts($("#fSite"), SITES); opts($("#fCat"), CATS);
$("#site").onchange = e => { site = e.target.value; write(KEY + ":site", site); render(); };
function openForm(c) { requireUser(() => { $("#fCat").value = c; if (site) $("#fSite").value = site; if (!$("#fContact").value) $("#fContact").value = user().phone; $("#dlg").showModal(); }); }
document.querySelectorAll(".js-post").forEach(b => b.onclick = () => openForm(cat));
$("#adBtn").onclick = () => openForm("business");
$("#cancel").onclick = () => $("#dlg").close();
$("#tabIn").onclick = () => setMode("in"); $("#tabNew").onclick = () => setMode("new");
$("#authCancel").onclick = () => { pending = null; $("#authDlg").close(); };
$("#authForm").onsubmit = e => {
  e.preventDefault();
  const ph = phone($("#aPhone").value), pin = $("#aPin").value, name = $("#aName").value.trim(), err = $("#aErr");
  if (ph.length < 10) { err.textContent = "Enter a valid cell number."; return; }
  const found = users.find(x => x.phone === ph);
  if (authMode === "new") {
    if (found) { err.textContent = "This number already has an account. Tap Sign in."; return; }
    users.push({ name, phone: ph, pin }); write(KEY + ":users", users);
  } else if (!found || found.pin !== pin) { err.textContent = "Wrong number or PIN."; return; }
  session = ph; write(KEY + ":session", ph); e.target.reset(); $("#authDlg").close(); render();
  toast("Welcome, " + user().name.split(" ")[0]);
  const f = pending; pending = null; if (f) f();
};
$("#form").onsubmit = e => {
  e.preventDefault(); const u = user(); if (!u) return;
  posts.unshift({ id: "p" + Date.now(), cat: $("#fCat").value, site: $("#fSite").value, title: $("#fTitle").value.trim(), details: $("#fDetails").value.trim(), contact: $("#fContact").value.trim(), t: Date.now(), status: "pending", me: 0, author: u.name, authorPhone: u.phone });
  save(); e.target.reset(); $("#dlg").close(); render();
  toast("Sent. It shows after the admin approves it.");
};
$("#adminBtn").onclick = () => {
  if (admin) { admin = false; render(); return; }
  const pin = prompt("Admin PIN"); if (pin === null) return;
  if (pin === ADMIN_PIN) { admin = true; render(); toast("Admin mode on"); } else toast("Wrong PIN");
};
render();
