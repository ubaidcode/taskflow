# Integration guide (Claude ke liye)

Yeh file us Claude ko di jaye jo is frontend ko backend repo ke saath merge kar raha hai.

## Context
- Backend repo: https://github.com/Muhammad-333/Task-Management-System-API (folders `be` aur `fe`)
- Yeh folder ek naya frontend hai: plain HTML/CSS/JS, koi framework ya build step nahi.
- Features: email + OTP login, task board (To do / In progress / Done), add/edit/delete, search.
- Backend ke owner ki ijazat ke saath is code ko merge kiya ja raha hai.

## Tumhara kaam (is order mein)
1. Backend (`be`) poora parho: framework, routes, models, auth (JWT/session), env variables.
2. Check karo ke backend mein yeh maujood hai ya nahi:
   - OTP bhejna (`send-otp`) aur OTP verify karna (`verify-otp`) jo token wapas de.
   - Tasks ke CRUD endpoints, jo token se user ke apne tasks hi dein.
3. Jo missing ho woh `be` mein banao:
   - OTP: 6-digit random code, hash karke store karo, 5 minute expiry, 5 galat koshishon ke baad lock, resend par rate limit.
   - OTP bhejna: email (nodemailer/SMTP ya jo project mein pehle se ho). SMTP credentials `.env` mein rakho, `.env.example` bhi banao. OTP response mein kabhi wapas na bhejo.
   - CORS: frontend ke origin ko allow karo.
4. `js/config.js` ko backend ke asal endpoints, field names, status values aur token path ke mutabiq update karo.
   `js/api.js` mein sirf zaroorat par badlo. UI (`app.js`, `index.html`, `styles.css`) ko nahi chhedna jab tak zaroorat na ho.
5. `USE_MOCK` ko `false` karo aur `API_BASE_URL` set karo.
6. Backend ka `fe` folder: purane `fe` ko replace karne se pehle poochho ya `fe-old` mein rakh do. Static files backend se serve karni ho to wohi setup karo.
7. Root `README.md` mein chalane ke steps likho (install, `.env`, backend start, frontend kholna) aur kam se kam login + task CRUD ka ek smoke test karke dikhao.

## Frontend jo API expect karta hai (config.js mein badla ja sakta hai)
| Kaam | Request | Response |
|---|---|---|
| OTP bhejna | `POST /auth/send-otp` `{ email }` | `200` |
| OTP verify | `POST /auth/verify-otp` `{ email, otp }` | `{ token: "..." }` |
| List | `GET /tasks` | `[ {id,title,description,status,priority,dueDate} ]` |
| Create | `POST /tasks` | naya task |
| Update | `PUT /tasks/:id` | update hua task |
| Delete | `DELETE /tasks/:id` | `200` |

Auth header: `Authorization: Bearer <token>`. Errors: JSON mein `message`.
`status`: `todo` / `in_progress` / `done`. `priority`: `low` / `medium` / `high`. `dueDate`: `YYYY-MM-DD`.

## Dhyan rakhne wali baatein
- Secrets (SMTP password, JWT secret) kabhi commit na karo.
- Jo cheez backend mein pehle se kaam kar rahi hai usay tod ke dobara na likho; frontend ko uske mutabiq dhalo.
- Agar backend aur frontend ke contract mein farq ho to config.js badlo, backend nahi, jab tak mumkin ho.
