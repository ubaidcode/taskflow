// ===== Sirf yeh file backend se jorne ke liye badalni hai =====
window.TMS_CONFIG = {
  USE_MOCK: true,                              // true = bina backend ke demo; real backend ke liye false karein
  API_BASE_URL: "http://localhost:3000/api",   // backend ka base URL
  ENDPOINTS: {
    sendOtp:   { method: "POST",   path: "/auth/send-otp" },    // body: { email }
    verifyOtp: { method: "POST",   path: "/auth/verify-otp" },  // body: { email, otp } -> { token, user }
    listTasks: { method: "GET",    path: "/tasks" },
    createTask:{ method: "POST",   path: "/tasks" },
    updateTask:{ method: "PUT",    path: "/tasks/:id" },
    deleteTask:{ method: "DELETE", path: "/tasks/:id" }
  },
  // Frontend field -> backend field (agar backend ke naam alag hon to yahan badlein)
  FIELDS: { id: "id", title: "title", description: "description", status: "status", priority: "priority", dueDate: "dueDate" },
  // Frontend status -> backend status value
  STATUSES: [
    { key: "todo",        label: "To do",       backend: "todo" },
    { key: "in_progress", label: "In progress", backend: "in_progress" },
    { key: "done",        label: "Done",        backend: "done" }
  ],
  TOKEN_PATH: "token",          // verify-otp response mein token kis key par hai
  TOKEN_HEADER: "Authorization", // "Bearer <token>" is header mein jata hai
  LIST_PATH: ""                  // agar list response { data: [...] } ho to "data" likhein
};
