# 📋 Club Attendance Tracker

Your attendance data is saved **permanently to `data.json`** on your computer — no browser, no cloud, no account needed.

---

## ▶ How to Run

### Option A — Double-click (Windows)
Double-click `start.bat`

### Option B — Double-click (Mac / Linux)
Double-click `start.sh`  
*(If it won't open, right-click → Open, or run in terminal)*

### Option C — Terminal (any OS)
```
node server.js
```
Then open your browser and go to: **http://localhost:3000**

---

## 📁 Files

| File | Purpose |
|------|---------|
| `server.js` | Local web server (Node.js, no installs needed) |
| `index.html` | The app UI |
| `data.json` | **Your attendance data** — back this up! |
| `start.bat` | One-click launcher for Windows |
| `start.sh` | One-click launcher for Mac/Linux |

---

## ✅ Requirements

- **Node.js** installed → https://nodejs.org (free)
- No other packages needed

---

## 💾 Backing Up Your Data

Just copy `data.json` anywhere — it's plain text (JSON format).  
You can also export CSV or JSON anytime from the **History** tab inside the app.

---

## 🔁 Changing the Port

Edit `server.js` line 12: `const PORT = 3000;`
