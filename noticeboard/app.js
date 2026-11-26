// ===== Edit this =====
const ADMIN_PIN = "2468"; // DEMO ONLY: anyone can read this in the code. Real security comes with Firebase rules.
// =====================
const CATS = [["issue", "Issues", "#2F6FB5", "Water, power, roads"], ["business", "Businesses", "#FF7A00", "Plumbers, mechanics"], ["room", "Rooms", "#2F8A12", "Available and wanted"], ["notice", "Notices", "#B5472F", "Meetings and alerts"]];
const KEY = "neighbournet-demo-v1", PKEY = "neighbournet-posts-v2";
const $ = s => document.querySelector(s);
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ICONS = {
  issue: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  business: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  room: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  notice: '<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
};
const NEED = ["locBtn", "q", "themeBtn", "livePill", "locDlg", "locPick", "locPath", "locAdd", "locClear", "locDone", "fLoc", "fCat", "fTitle", "fDetails", "fContact", "cancel", "navUser", "stats", "list", "board", "feedTitle", "top", "adminBtn", "adBtn", "authDlg", "authForm", "authTitle", "authGo", "authCancel", "tabIn", "tabNew", "nameRow", "aName", "aPhone", "aPin", "aErr", "form", "dlg", "toast"];
const missing = NEED.filter(id => !document.getElementById(id));
if (missing.length) {
  const m = document.createElement("div"); m.className = "alert alert-danger m-3";
  m.textContent = "NeighbourNet: your index.html is not the newest version. Missing parts: " + missing.join(", ") + ". Replace index.html with the latest one.";
  document.body.prepend(m); throw new Error("Missing elements: " + missing.join(", "));
}
const day = 864e5, t0 = Date.now();
const K = ["gauteng", "gauteng-west-rand", "gauteng-mogale", "gauteng-kagiso"];
const seed = [
  { id: "s1", cat: "issue", loc: [...K, "gauteng-kagiso-e4"], title: "Sample: No power since this morning", details: "Streets near the taxi rank. Add your reference number if you reported it.", contact: "", t: t0 - day, status: "approved" },
  { id: "s2", cat: "issue", loc: [...K, "gauteng-kagiso-e2"], title: "Sample: Burst water pipe", details: "Water running down the street since Monday.", contact: "", t: t0 - 3 * day, status: "approved" },
  { id: "s3", cat: "business", loc: [...K, "gauteng-kagiso-e4"], title: "Sample: Plumber, serves the whole area", details: "Leaks, geysers, blocked drains. Call or WhatsApp for a quote.", contact: "0710000000", t: t0 - 2 * day, status: "approved" },
  { id: "s4", cat: "room", loc: [...K, "gauteng-kagiso-e4"], title: "Sample: Backroom to rent", details: "Own entrance, prepaid electricity. Price on request.", contact: "0720000000", t: t0 - day, status: "approved" },
  { id: "s5", cat: "room", loc: [...K, "gauteng-kagiso-e2"], title: "Sample: Looking for a room near the taxi rank", details: "One working person, no smoking.", contact: "0730000000", t: t0 - 4 * day, status: "approved" },
  { id: "s6", cat: "notice", loc: [...K, "gauteng-kagiso-e4"], title: "Sample: Street committee meeting", details: "Saturday at 10:00 at the community hall.", contact: "", t: t0 - 2 * day, status: "approved" }
];
seed.forEach(p => { p.author = "Sample neighbour"; p.place = "Kagiso, " + (p.loc[4] === "gauteng-kagiso-e4" ? "Extension 4" : "Extension 2"); });
function read(k, fallback) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fallback; } catch (e) { return fallback; } }
function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
let posts = read(PKEY, seed), meToo = read(KEY + ":me", []), extra = read(KEY + ":extra", []);
let users = read(KEY + ":users", []), session = read(KEY + ":session", ""), authMode = "in", pending = null;
let loc = read(KEY + ":loc", []), tmp = [], formPath = [], cat = "issue", admin = false, q = "", skipAnim = false;
let MAP = {}, TREE = [];
const user = () => users.find(u => u.phone === session);
function requireUser(cb) { if (user()) return cb(); pending = cb; setMode("in"); $("#authDlg").showModal(); }

function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
function phone(n) { let d = String(n).replace(/\D/g, ""); if (d.startsWith("0")) d = "27" + d.slice(1); return d; }
function ago(t) { const d = Math.floor((Date.now() - t) / day); return d < 1 ? "Today" : d === 1 ? "Yesterday" : d + " days ago"; }
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2800); }
function save() { write(PKEY, posts); }
function ico(name, cls) { const s = el("span", "ico " + (cls || "")); s.innerHTML = ICONS[name] || ""; s.setAttribute("aria-hidden", "true"); return s; }
function countUp(node, to) {
  if (calm || skipAnim || to < 2) return;
  const t = performance.now();
  (function f(now) { const k = Math.max(0, Math.min(1, (now - t) / 450)); node.textContent = String(Math.round(to * k)); if (k < 1) requestAnimationFrame(f); })(t);
}
function opts(sel, list) { sel.textContent = ""; list.forEach(v => sel.append(new Option(v[1], v[0]))); }

// ----- locations -----
function index(nodes, path) { nodes.forEach(n => { n.path = [...path, n.id]; MAP[n.id] = n; if (n.c) index(n.c, n.path); }); }
function applyExtras() {
  extra.forEach(x => { const p = MAP[x.parent]; if (!p || MAP[x.id] || (p.dir && !p.loaded)) return; p.kids = p.kids || "Area"; const n = { id: x.id, name: x.name }; (p.c = p.c || []).push(n); index([n], p.path); });
}
const loading = {};
function ensureNode(id) {
  const n = MAP[id]; if (!n || !n.dir || n.loaded) return Promise.resolve();
  return loading[id] || (loading[id] = fetch(n.base + "index.json").then(r => { if (r.status === 404) return { c: [] }; if (!r.ok) throw 0; return r.json(); })
    .then(d => { n.c = d.c || []; n.c.forEach(k => { if (k.dir) k.base = n.base + k.dir; }); n.loaded = true; index(n.c, n.path); applyExtras(); })
    .catch(() => { n.c = []; n.loaded = true; n.failed = true; toast("Could not load more places for " + n.name + "."); })
    .then(() => { delete loading[id]; }));
}
function names(path, n) { return path.slice(-n).map(id => MAP[id] && MAP[id].name).filter(Boolean).join(", "); }
function picker(box, path, onChange) {
  const todo = path.map(id => MAP[id]).find(n => n && n.dir && !n.loaded);
  if (todo) { box.textContent = "Loading..."; ensureNode(todo.id).then(() => picker(box, path, onChange)); return; }
  box.textContent = "";
  let list = TREE, label = "Province", i = 0;
  while (list && list.length) {
    const sel = document.createElement("select"); sel.className = "form-select"; sel.setAttribute("aria-label", label);
    sel.append(new Option("Select " + label.toLowerCase() + "...", ""));
    list.forEach(n => sel.append(new Option(n.name, n.id)));
    sel.value = path[i] || "";
    const lvl = i;
    sel.onchange = () => { const np = path.slice(0, lvl); if (sel.value) np.push(sel.value); picker(box, np, onChange); onChange(np); };
    box.append(sel);
    const cur = path[i] && MAP[path[i]]; if (!cur) break;
    list = cur.c; label = cur.kids || "Area"; i++;
  }
}
function showTmp() {
  $("#locPath").textContent = tmp.length ? tmp.map(id => MAP[id] && MAP[id].name).filter(Boolean).join(" \u203a ") : "All of South Africa";
  $("#locAdd").hidden = !admin; $("#locAdd").disabled = !tmp.length;
}
function openLoc() { tmp = [...loc]; picker($("#locPick"), tmp, p => { tmp = p; showTmp(); }); showTmp(); $("#locDlg").showModal(); }
const inLoc = p => loc.every((id, i) => p.loc && p.loc[i] === id);

function setMode(m) {
  authMode = m; $("#nameRow").hidden = m === "in"; $("#aName").required = m === "new"; $("#aErr").textContent = "";
  $("#authTitle").textContent = m === "in" ? "Sign in to post" : "Create your free account";
  $("#authGo").textContent = m === "in" ? "Sign in" : "Create account";
  $("#tabIn").classList.toggle("active", m === "in"); $("#tabNew").classList.toggle("active", m === "new");
  $("#aPin").autocomplete = m === "in" ? "current-password" : "new-password";
}
function card(p, i = 0) {
  const cinfo = CATS.find(c => c[0] === p.cat), who = p.author || "Neighbour";
  const c = el("article", "card nn-card post"), b = el("div", "card-body d-grid gap-2"); c.append(b); c.style.setProperty("--c", cinfo[2]); if (!skipAnim) { c.classList.add("rise"); c.style.animationDelay = Math.min(i, 6) * 60 + "ms"; }
  const top = el("div", "d-flex flex-wrap gap-2 align-items-center");
  top.append(ico(p.cat, "sm"), el("span", "badge bg-light text-dark border", cinfo[1]), el("span", "badge text-bg-success", p.place || names(p.loc || [], 2) || "South Africa"));
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
  const sh = el("button", "btn btn-outline-secondary", "Share"); sh.type = "button";
  sh.onclick = () => {
    const url = location.href.split("#")[0], txt = p.title + " (" + (p.place || names(p.loc || [], 2)) + ")";
    if (navigator.share) navigator.share({ title: p.title, text: txt, url }).catch(() => {});
    else window.open("https://wa.me/?text=" + encodeURIComponent(txt + " " + url), "_blank", "noopener");
  };
  acts.append(sh);
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
  const where = loc.length ? (names(loc, 2) || "Loading area...") : "All of South Africa";
  $("#locBtn").textContent = where;
  const here = posts.filter(inLoc), ok = here.filter(p => p.status === "approved");
  $("#livePill").textContent = ok.length + " live post" + (ok.length === 1 ? "" : "s") + " in " + (loc.length ? names(loc, 1) || "your area" : "South Africa");
  const stats = $("#stats"); stats.textContent = "";
  CATS.forEach(([id, name, col, desc]) => {
    const w = el("div", "col-6 col-md-3"), b = el("button", "stat");
    b.type = "button"; b.style.setProperty("--c", col); b.setAttribute("aria-pressed", id === cat);
    const n = ok.filter(p => p.cat === id).length, num = el("b", "", String(n));
    b.append(ico(id), num, el("span", "", name), el("small", "", desc)); countUp(num, n);
    b.onclick = () => { cat = id; render(); }; w.append(b); stats.append(w);
  });
  $("#feedTitle").textContent = CATS.find(c => c[0] === cat)[1] + " in " + (loc.length ? names(loc, 1) : "South Africa");
  const list = here.filter(p => p.cat === cat && (admin || p.status === "approved") && (!q || (p.title + " " + p.details + " " + (p.place || "")).toLowerCase().includes(q)));
  const main = $("#list"); main.textContent = "";
  if (!list.length) {
    const e = el("div", "text-center py-4 empty-state"), im = document.createElement("img");
    im.src = "logo-mark.svg"; im.alt = ""; im.width = 120; im.height = 80;
    const bt = el("button", "btn btn-success", "Post something"); bt.type = "button"; bt.onclick = () => openForm(cat);
    e.append(im, el("p", "text-secondary mb-3", q ? "No posts match your search." : "Nothing here yet. Be the first to post."), bt); main.append(e);
  }
  list.forEach((p, i) => main.append(card(p, i)));
  const top = $("#top"); top.textContent = "";
  const hot = ok.filter(p => p.cat === "issue" && p.me > 0).sort((a, b) => b.me - a.me).slice(0, 3);
  if (!hot.length) top.append(el("li", "small text-secondary", "No issues yet. Tap Me too on an issue you share."));
  hot.forEach(p => { const li = el("li", "tops"), b = el("button", "", p.me + " neighbours: " + p.title); b.type = "button"; b.onclick = () => { cat = "issue"; render(); }; li.append(b); top.append(li); });
  $("#adminBtn").textContent = admin ? "Leave admin mode" : "Admin";
}

function openForm(c) { requireUser(() => { $("#fCat").value = c; formPath = [...loc]; picker($("#fLoc"), formPath, p => { formPath = p; }); if (!$("#fContact").value) $("#fContact").value = user().phone; $("#dlg").showModal(); }); }
opts($("#fCat"), CATS);
$("#locBtn").onclick = openLoc;
$("#locClear").onclick = () => { tmp = []; picker($("#locPick"), tmp, p => { tmp = p; showTmp(); }); showTmp(); };
$("#locDone").onclick = () => { loc = tmp; write(KEY + ":loc", loc); $("#locDlg").close(); render(); };
$("#locAdd").onclick = () => {
  const par = tmp[tmp.length - 1], nm = prompt("Name of the new area inside " + MAP[par].name + "?"); if (!nm || !nm.trim()) return;
  extra.push({ id: par + "-x" + Date.now().toString(36), parent: par, name: nm.trim() }); write(KEY + ":extra", extra);
  applyExtras(); picker($("#locPick"), tmp, p => { tmp = p; showTmp(); }); showTmp(); toast("Area added");
};
document.querySelectorAll(".js-post").forEach(b => b.onclick = () => openForm(cat));
document.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { cat = b.dataset.cat; render(); $("#board").scrollIntoView(); });
document.querySelectorAll(".js-ad").forEach(b => b.onclick = () => openForm("business"));
document.querySelectorAll(".js-loc").forEach(b => b.onclick = openLoc);
document.querySelectorAll("[data-icon]").forEach(e => { e.innerHTML = ICONS[e.dataset.icon] || ""; });
$("#q").oninput = e => { q = e.target.value.trim().toLowerCase(); skipAnim = true; render(); skipAnim = false; };
function themeLabel() { $("#themeBtn").textContent = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "Light mode" : "Dark mode"; }
$("#themeBtn").onclick = () => { const t = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark"; document.documentElement.setAttribute("data-bs-theme", t); write(KEY + ":theme", t); themeLabel(); };
themeLabel();
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
  if (formPath.length < 2) { toast("Choose at least a province and a municipality."); return; }
  posts.unshift({ id: "p" + Date.now(), cat: $("#fCat").value, loc: formPath, place: names(formPath, 2), title: $("#fTitle").value.trim(), details: $("#fDetails").value.trim(), contact: $("#fContact").value.trim(), t: Date.now(), status: "pending", me: 0, author: u.name, authorPhone: u.phone });
  save(); e.target.reset(); $("#dlg").close(); render();
  toast("Sent. It shows after the admin approves it.");
};
$("#adminBtn").onclick = () => {
  if (admin) { admin = false; render(); return; }
  const pin = prompt("Admin PIN"); if (pin === null) return;
  if (pin === ADMIN_PIN) { admin = true; render(); toast("Admin mode on"); } else toast("Wrong PIN");
};
fetch("locations/index.json").then(r => r.json()).then(async d => {
  TREE = d.tree; TREE.forEach(k => { if (k.dir) k.base = "locations/" + k.dir; }); index(TREE, []); applyExtras();
  for (const id of loc) { if (!MAP[id]) break; await ensureNode(id); }
  render();
}).catch(() => { $("#list").textContent = "Could not load locations/index.json. Check that the locations folder is inside the noticeboard folder with the same file names, and that you opened this page from your website, not as a file."; });
render();
