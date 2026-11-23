(function () {
  const C = window.TMS_CONFIG, $ = id => document.getElementById(id);
  let tasks = [], editingId = null, email = "";

  const show = loggedIn => { $("auth").hidden = loggedIn; $("app").hidden = !loggedIn; };
  const say = (el, text, ok) => { el.textContent = text || ""; el.classList.toggle("ok", !!ok); };
  const busy = (form, on) => form.querySelectorAll("button").forEach(b => (b.disabled = on));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Auth ----------
  async function sendCode() {
    say($("authMsg"), "");
    const res = await API.sendOtp(email);
    $("sentTo").textContent = email;
    $("emailForm").hidden = true; $("otpForm").hidden = false; $("otp").focus();
    say($("authMsg"), API.isMock ? "Demo mode: your code is " + res.demoOtp : "Code sent. Check your inbox.", true);
  }
  $("emailForm").addEventListener("submit", async e => {
    e.preventDefault(); email = $("email").value.trim(); busy(e.target, true);
    try { await sendCode(); } catch (err) { say($("authMsg"), err.message); } finally { busy(e.target, false); }
  });
  $("otpForm").addEventListener("submit", async e => {
    e.preventDefault(); busy(e.target, true);
    try { await API.verifyOtp(email, $("otp").value.trim()); say($("authMsg"), ""); await start(); }
    catch (err) { say($("authMsg"), err.message); } finally { busy(e.target, false); }
  });
  $("resend").onclick = () => sendCode().catch(err => say($("authMsg"), err.message));
  $("changeEmail").onclick = () => { $("otpForm").hidden = true; $("emailForm").hidden = false; say($("authMsg"), ""); };
  $("logoutBtn").onclick = () => { API.token.clear(); show(false); $("otpForm").hidden = true; $("emailForm").hidden = false; };

  // ---------- Board ----------
  function render() {
    const q = $("search").value.trim().toLowerCase(), today = new Date().toISOString().slice(0, 10);
    $("board").innerHTML = C.STATUSES.map(s => {
      const list = tasks.filter(t => t.status === s.key && (t.title + " " + t.description).toLowerCase().includes(q));
      const idx = C.STATUSES.findIndex(x => x.key === s.key);
      const cards = list.map(t => `
        <article class="card ${esc(t.priority)}">
          <h3>${esc(t.title)}</h3>${t.description ? `<p>${esc(t.description)}</p>` : ""}
          <div class="meta"><span>${esc(t.priority)} priority</span>${t.dueDate ? `<span class="${t.dueDate < today && t.status !== "done" ? "overdue" : ""}">Due ${esc(t.dueDate)}</span>` : ""}</div>
          <div class="card-actions">
            ${idx > 0 ? `<button class="link" data-move="${esc(t.id)}" data-to="${C.STATUSES[idx - 1].key}">Move to ${C.STATUSES[idx - 1].label}</button>` : ""}
            ${idx < C.STATUSES.length - 1 ? `<button class="link" data-move="${esc(t.id)}" data-to="${C.STATUSES[idx + 1].key}">Move to ${C.STATUSES[idx + 1].label}</button>` : ""}
            <button class="link" data-edit="${esc(t.id)}">Edit</button>
            <button class="link" data-del="${esc(t.id)}">Delete</button>
          </div>
        </article>`).join("");
      return `<section class="col"><h2>${s.label}<span>${list.length}</span></h2>${cards || `<p class="empty">Nothing here yet.</p>`}</section>`;
    }).join("");
  }
  $("search").addEventListener("input", render);
  $("board").addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b) return;
    const find = id => tasks.find(t => String(t.id) === id);
    try {
      if (b.dataset.move) { const t = find(b.dataset.move); await API.updateTask(t.id, { ...t, status: b.dataset.to }); await load(); }
      else if (b.dataset.edit) openDialog(find(b.dataset.edit));
      else if (b.dataset.del && confirm("Delete this task?")) { await API.deleteTask(b.dataset.del); await load(); }
    } catch (err) { say($("appMsg"), err.message); }
  });

  // ---------- Dialog ----------
  $("fStatus").innerHTML = C.STATUSES.map(s => `<option value="${s.key}">${s.label}</option>`).join("");
  function openDialog(t) {
    editingId = t ? t.id : null; $("dialogTitle").textContent = t ? "Edit task" : "Add task";
    $("fTitle").value = t ? t.title : ""; $("fDesc").value = t ? t.description : "";
    $("fStatus").value = t ? t.status : C.STATUSES[0].key; $("fPriority").value = t ? t.priority : "medium"; $("fDue").value = t ? t.dueDate : "";
    $("taskDialog").showModal(); $("fTitle").focus();
  }
  $("addBtn").onclick = () => openDialog(null);
  $("cancelBtn").onclick = () => $("taskDialog").close();
  $("taskForm").addEventListener("submit", async e => {
    e.preventDefault();
    const t = { title: $("fTitle").value.trim(), description: $("fDesc").value.trim(), status: $("fStatus").value, priority: $("fPriority").value, dueDate: $("fDue").value };
    try { editingId ? await API.updateTask(editingId, t) : await API.createTask(t); $("taskDialog").close(); await load(); }
    catch (err) { say($("appMsg"), err.message); $("taskDialog").close(); }
  });

  async function load() { say($("appMsg"), ""); try { tasks = await API.listTasks(); } catch (err) { say($("appMsg"), err.message); } render(); }
  async function start() { show(true); await load(); }
  API.token.get() ? start() : show(false);
})();
