# Task Manager Frontend

Plain HTML/CSS/JS frontend (koi build step nahi). Email + OTP login aur 3-column task board.

## Demo chalana (bina backend ke)
`index.html` browser mein kholein, ya `npx serve .` / `python -m http.server 8080` chalayein.
`js/config.js` mein `USE_MOCK: true` hai, is mode mein OTP screen par dikha diya jata hai.

## Real backend se jorna
`INTEGRATION_GUIDE.md` dekhein. Us file ko Claude ko dein, woh backend ke code ke saath is frontend ko merge kar dega.

## Structure
- `index.html`, `styles.css`
- `js/config.js`  - API URL, endpoints, field names (yahi file zyada tar badalni hoti hai)
- `js/api.js`     - backend calls + demo mock
- `js/app.js`     - UI logic
