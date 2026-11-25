// ===== Edit these: the sites (streets, extensions, sections) in your area =====
const SITES = ["Extension 1", "Extension 2", "Extension 3", "Extension 4", "Extension 5", "Extension 6"];
const ADMIN_PIN = "2468"; // DEMO ONLY: anyone can read this in the code. Real security comes with Firebase rules.
// ======================
const CATS = [["issue", "Issues"], ["business", "Businesses"], ["room", "Rooms"], ["notice", "Notices"]];
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
let posts = read(KEY, seed), meToo = read(KEY + ":me", []);
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

function card(p) {
  const c = el("article", "card");
  const top = el("div", "row");
  top.append(el("span", "tag", p.site));
  if (p.status !== "approved") top.append(el("span", "tag pend", "Waiting for approval"));
  top.append(el("span", "when", ago(p.t)));
  c.append(top, el("h3", "", p.title), el("p", "", p.details));
  const acts = el("div", "row");
  if (p.contact) {
    const wa = el("a", "btn2", "WhatsApp"); wa.href = "https://wa.me/" + phone(p.contact); wa.target = "_blank"; wa.rel = "noopener";
    const call = el("a", "btn2", "Call"); call.href = "tel:+" + phone(p.contact);
    acts.append(wa, call);
  }
  if (p.cat === "issue") {
    const done = meToo.includes(p.id);
    const m = el("button", "btn2", "Me too · " + (p.me || 0)); m.type = "button"; m.disabled = done;
    m.onclick = () => { p.me = (p.me || 0) + 1; meToo.push(p.id); write(KEY + ":me", meToo); save(); render(); };
    acts.append(m);
  }
  const sh = el("a", "btn2", "Share");
  sh.href = "https://wa.me/?text=" + encodeURIComponent(p.title + " (" + p.site + ") " + location.href.split("#")[0]);
  sh.target = "_blank"; sh.rel = "noopener"; acts.append(sh);
  if (admin) {
    if (p.status !== "approved") { const a = el("button", "btn", "Approve"); a.type = "button"; a.onclick = () => { p.status = "approved"; save(); render(); }; acts.append(a); }
    const r = el("button", "btn2 bad", "Remove"); r.type = "button";
    r.onclick = () => { if (confirm("Remove this post?")) { posts = posts.filter(x => x.id !== p.id); save(); render(); } };
    acts.append(r);
  }
  c.append(acts);
  return c;
}

function render() {
  const nav = $("#cats"); nav.textContent = "";
  CATS.forEach(([id, name]) => {
    const b = el("button", "chip", name); b.type = "button"; b.setAttribute("aria-pressed", id === cat);
    b.onclick = () => { cat = id; render(); }; nav.append(b);
  });
  const list = posts.filter(p => p.cat === cat && (!site || p.site === site) && (admin || p.status === "approved"));
  const main = $("#list"); main.textContent = "";
  if (!list.length) main.append(el("p", "empty", "Nothing here yet. Be the first to post."));
  list.forEach(p => main.append(card(p)));
  $("#adminBtn").textContent = admin ? "Leave admin mode" : "Admin";
}

opts($("#site"), SITES, "All sites"); $("#site").value = site;
opts($("#fSite"), SITES); opts($("#fCat"), CATS);
$("#site").onchange = e => { site = e.target.value; write(KEY + ":site", site); render(); };
$("#newPost").onclick = () => { $("#fCat").value = cat; if (site) $("#fSite").value = site; $("#dlg").showModal(); };
$("#cancel").onclick = () => $("#dlg").close();
$("#form").onsubmit = e => {
  e.preventDefault();
  posts.unshift({ id: "p" + Date.now(), cat: $("#fCat").value, site: $("#fSite").value, title: $("#fTitle").value.trim(), details: $("#fDetails").value.trim(), contact: $("#fContact").value.trim(), t: Date.now(), status: "pending", me: 0 });
  save(); e.target.reset(); $("#dlg").close(); render();
  toast("Sent. It shows after the admin approves it.");
};
$("#adminBtn").onclick = () => {
  if (admin) { admin = false; render(); return; }
  const pin = prompt("Admin PIN"); if (pin === null) return;
  if (pin === ADMIN_PIN) { admin = true; render(); toast("Admin mode on"); } else toast("Wrong PIN");
};
render();

