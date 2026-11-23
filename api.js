(function () {
  const C = window.TMS_CONFIG;
  const get = (o, p) => (p ? p.split(".").reduce((a, k) => (a == null ? a : a[k]), o) : o);

  // ---------- Field mapping ----------
  const toBackendStatus = k => (C.STATUSES.find(s => s.key === k) || {}).backend || k;
  const toFrontStatus = b => (C.STATUSES.find(s => s.backend === b) || C.STATUSES[0]).key;
  const normalize = t => ({
    id: t[C.FIELDS.id], title: t[C.FIELDS.title] || "", description: t[C.FIELDS.description] || "",
    status: toFrontStatus(t[C.FIELDS.status]), priority: t[C.FIELDS.priority] || "medium",
    dueDate: t[C.FIELDS.dueDate] ? String(t[C.FIELDS.dueDate]).slice(0, 10) : ""
  });
  const payload = t => ({
    [C.FIELDS.title]: t.title, [C.FIELDS.description]: t.description,
    [C.FIELDS.status]: toBackendStatus(t.status), [C.FIELDS.priority]: t.priority,
    [C.FIELDS.dueDate]: t.dueDate || null
  });

  // ---------- Real backend ----------
  const token = { get: () => localStorage.getItem("tms_token"), set: v => localStorage.setItem("tms_token", v), clear: () => localStorage.removeItem("tms_token") };
  async function call(name, { id, body } = {}) {
    const ep = C.ENDPOINTS[name];
    const headers = { "Content-Type": "application/json" };
    if (token.get()) headers[C.TOKEN_HEADER] = "Bearer " + token.get();
    const res = await fetch(C.API_BASE_URL + ep.path.replace(":id", encodeURIComponent(id ?? "")), {
      method: ep.method, headers, body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && name !== "verifyOtp") { token.clear(); location.reload(); }
    if (!res.ok) throw new Error(data.message || data.error || "Request failed (" + res.status + ")");
    return data;
  }
  const real = {
    sendOtp: email => call("sendOtp", { body: { email } }),
    async verifyOtp(email, otp) {
      const d = await call("verifyOtp", { body: { email, otp } });
      const t = get(d, C.TOKEN_PATH); if (!t) throw new Error("Server did not return a token");
      token.set(t); return d;
    },
    async listTasks() { const d = await call("listTasks"); const l = get(d, C.LIST_PATH); return (Array.isArray(l) ? l : []).map(normalize); },
    async createTask(t) { return normalize(await call("createTask", { body: payload(t) })); },
    async updateTask(id, t) { return normalize(await call("updateTask", { id, body: payload(t) })); },
    deleteTask: id => call("deleteTask", { id })
  };

  // ---------- Mock (demo, localStorage) ----------
  const db = { read: () => JSON.parse(localStorage.getItem("tms_mock") || "[]"), write: v => localStorage.setItem("tms_mock", JSON.stringify(v)) };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let mockOtp = null;
  const mock = {
    async sendOtp(email) { await sleep(300); mockOtp = String(Math.floor(100000 + Math.random() * 900000)); return { demoOtp: mockOtp }; },
    async verifyOtp(email, otp) { await sleep(300); if (otp !== mockOtp) throw new Error("Wrong code. Check the code and try again."); token.set("demo-token"); return { token: "demo-token" }; },
    async listTasks() { await sleep(150); return db.read(); },
    async createTask(t) { const all = db.read(); const n = { ...t, id: Date.now().toString() }; all.push(n); db.write(all); return n; },
    async updateTask(id, t) { const all = db.read().map(x => (x.id === id ? { ...x, ...t, id } : x)); db.write(all); return all.find(x => x.id === id); },
    async deleteTask(id) { db.write(db.read().filter(x => x.id !== id)); }
  };

  window.API = { ...(C.USE_MOCK ? mock : real), token, isMock: C.USE_MOCK };
})();
