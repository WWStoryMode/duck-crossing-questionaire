# Duck Crossing — Pedagogy & Game-Based Learning

A small real-time classroom activity for a 15-minute microteaching session.
Four tables of students match game mechanics from an unfinished learning game, **Duck Crossing**, to two learning outcomes (A and B). The teacher watches responses arrive live, locks submissions, reveals suggested matches and leads the discussion from a projector view, or runs the **whole lesson from one browser tab** with the built-in presentation at `/present`.

- **Students** open a URL or scan a QR code. They don't install anything or create accounts.
- **Nothing is stored.** All data lives in the memory of one Node.js process and disappears when you click *Reset all* or restart the server.

| Page | Who | What |
|---|---|---|
| `/` | Students | Pick a table, classify six mechanic cards (A only / B only / Both / Neither), explain one debatable card, submit and revise |
| `/teacher` | Teacher (access code) | Live responses per table, justifications, lock/unlock, reveal/hide, reset, demo mode, QR code |
| `/results` | Projector | One table at a time: bar charts of group answers; after reveal, suggested answers, alternatives and explanations |
| `/present` | Teacher on the projector | 8-slide lesson, *Pedagogy and Game-Based Learning*, with the join QR, live results, reveal/lock, presenter notes and timers |

---

## Run it locally

Requires **Node.js 18+** (20 recommended; `.nvmrc` is included).

```bash
nvm use               # or install Node 20 another way
npm install
npm run build
TEACHER_CODE=your-code npm start
```

The server prints two addresses:

```
[duck-crossing] listening on http://localhost:3000
[duck-crossing] on your network:  http://192.168.1.42:3000  (students)  ·  /teacher  ·  /results
```

- Open **`http://localhost:3000/teacher`** and enter your code.
- The QR code on the dashboard uses your network address automatically, so phones **on the same Wi-Fi** can scan it.
- Open **`/results`** on the projector (the dashboard has an *Open projector view* button).

> University Wi-Fi often blocks device-to-device traffic. If phones can't reach your laptop, use your phone's hotspot for everyone, or deploy to a host (below).

### Development mode (hot reload)

```bash
npm run dev
```

Runs the API/Socket.IO server on `:3000` and the Vite dev server on `:5173` (proxied to the server). Open `http://localhost:5173`. If `TEACHER_CODE` is not set, the code is **`duck`**.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Server + Vite with hot reload |
| `npm run build` | Build frontend (`dist/`) and server (`dist-server/`) |
| `npm start` | Run the built app (serves everything from one process) |
| `npm run typecheck` | TypeScript checks for client and server |
| `npm run check:content` | Verifies all 24 cards, the answer key and the accepted alternatives |
| `npm run smoke` | End-to-end socket test against a running server (**resets the session — never run it during class**) |

---

## Deploy to a host

The app keeps the whole session in memory and pushes live updates over WebSockets. It must run as **one long-running Node.js process**.

✅ Works on: **Render** (Web Service), **Railway**, **Fly.io** (1 machine), **Heroku**-style dynos, any **VPS** (`npm start` behind nginx/Caddy).

❌ Will **not** work on: serverless functions (Vercel, Netlify Functions, AWS Lambda), static-only hosting, or anything running more than one instance. Each instance would have its own separate memory.

### Generic settings

| Setting | Value |
|---|---|
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Node version | 20 |
| Instances | **exactly 1** (turn off autoscaling) |
| Environment | `TEACHER_CODE=<your code>`; optionally `PUBLIC_URL=https://your-app.example.com/` |

The server listens on `PORT` from the environment (hosts set this automatically) and trusts the host's proxy, so `https://` addresses appear correctly in the QR code.

### Example: Render

1. Push this repo to GitHub.
2. Render → **New → Web Service** → pick the repo.
3. Runtime **Node**, Build `npm install && npm run build`, Start `npm start`.
4. Add environment variable `TEACHER_CODE`.
5. Deploy and open `https://<your-service>.onrender.com/teacher`.

On free plans the service may sleep when idle and **restart with empty memory**. Open the dashboard a few minutes before class to wake it up, and don't redeploy during the session.

### Example: VPS

```bash
git clone <repo> && cd duck-crossing-questionaire
npm install && npm run build
TEACHER_CODE=your-code PORT=3000 npm start      # run under pm2/systemd for resilience
```

Put nginx or Caddy in front for HTTPS. Make sure WebSocket upgrade headers are forwarded (Caddy does this by default).

---

## Presenting the lesson (`/present`)

`/present` is a 16:9 slide presentation built into the app. It shares the same live session as the questionnaire, so you can teach the whole 15-minute lesson without switching between PowerPoint, the dashboard and the results page. Open it from **Open presentation ↗** on `/teacher`, or go to `/present` directly.

| # | Slide | Time |
|---|---|---|
| 1 | Pedagogy and Game-Based Learning: opening question | 1:30 |
| 2 | What are we learning today? | 1:00 |
| 3 | From Learning Outcomes to Game Mechanics (diagram, Bloom's) | 1:00 |
| 4 | Duck Crossing: A Game in Development | 1:00 |
| 5 | Which Mechanics Support Learning? **QR code + 4-minute activity countdown** | 4:45 |
| 6 | What Did We Choose, and Why? **live results + reveal/lock** | 2:45 |
| 7 | How Do We Know Learning Has Happened? (reveals step by step) | 1:30 |
| 8 | Engagement Is Not Evidence of Learning | 0:45 |

### Controls

| Key | Action |
|---|---|
| **→**, **Space**, PageDown | Next slide (on slide 7, reveals the next point first) |
| **←**, PageUp | Previous slide |
| **Home** / **End** | First / last slide |
| **1–4** (slide 6) | Switch table |
| **F** | Fullscreen (Esc exits) |
| **O** | Slide overview |
| **N** | Presenter notes |

Slides never advance on their own. Keys are ignored while you type in a field or use the table tabs. The slide number is kept in the URL (`/present#/5`), so a refresh stays on the same slide. In fullscreen, the control bar fades after 3 seconds of inactivity and returns when you move the mouse.

### Teacher controls

Click **🔑 Sign in** and enter the same access code as `/teacher`. Slide 6 then shows **Lock submissions** and **Reveal answers**, using the same server-side controls as the dashboard. Before sign-in, no teacher controls are shown, and answers are never sent to any page until you reveal them. The **Menu** opens the dashboard, questionnaire and results in new tabs, so the presentation keeps its connection and timers.

### Timers

- **Session timer** (control bar): elapsed and remaining time of 15:00, with start/pause/reset. It turns yellow when you run over.
- **Activity countdown** (slide 5): 4:00, started manually. It stays visible on every slide while it runs. At zero it shows *Time's up* but **does not lock submissions**; you lock when you're ready.

Both timers belong to this browser tab only. Refreshing the page resets them, but never touches student submissions.

### Presenter notes

Press **N** for notes on the current slide: suggested time, key points, questions to ask, likely misconceptions and a transition. They're hidden by default. On a single screen the panel shows on the projector while open, so open it only when you need it, or present from a second tab on your laptop screen. Notes never contain answer-key content. Edit them in `src/components/presentation/notes.ts`; slide text lives in `src/components/presentation/content.tsx`.

### If the connection drops

The slides, notes and timers keep working because they're already loaded. The control bar shows **○ Offline**, and slide 6 keeps the last results it received with a *Disconnected* banner. The page reconnects by itself and resyncs from server memory. Nothing is ever reset by moving between slides.

### Suggested running order

1. Before class: on `/teacher`, add demo responses, run through `/present` (including Reveal on slide 6), then **Reset all**.
2. Open `/present`, sign in, press **F** for fullscreen, and start the session timer.
3. Slide 5: groups scan the QR code; press **▶ Start 4:00**.
4. Slide 6: **Lock submissions**, discuss a split card, **Reveal answers**, then step through tables with **1–4**.
5. Finish on slides 7–8.

---

## Running the session (dashboard only)

1. **Before class:** open `/teacher`, click **+ Add 4 demo responses** and check `/results` and **Reveal**. Then click **Reset all**.
2. **Start:** show the QR code (*Show large QR*) and ask each group to choose its table.
3. **During:** watch responses arrive; groups can edit and resubmit until you lock.
4. **Lock submissions:** students' inputs freeze on what they last submitted.
5. **Reveal answers:** students see their evaluation on their own devices; the projector highlights suggested answers, alternatives and explanations. Step through tables with **← / →**.
6. **Reset all** when you're finished.

### How answers are evaluated

Each answer gets one of three labels, always shown as icon + text + colour:

- ✓ **Matches suggested answer**: equals the preferred classification
- ◐ **Open for discussion**: an accepted alternative
- ↺ **Reconsider**: neither

These classifications are pedagogical interpretations, not scientifically established correct answers. Written justifications are shown to the teacher as-is and are never auto-graded.

The answer key, accepted alternatives and explanations live in `shared/content.ts`. They are sent to students only after the teacher clicks **Reveal**.

### Edge cases handled

- **Duplicate clicks:** the submit button locks while sending, and the server ignores a second "new" submission from the same page within 5 seconds.
- **Revisions:** the server issues a temporary submission ID, held only in the page's memory, so resubmitting updates the same response.
- **Refresh:** the ID is lost. The student page warns that submitting again counts as a **new** response.
- **Disconnects:** pages reconnect automatically and resync from server memory; a *Reconnecting…* badge is shown meanwhile.
- **Server restart:** all data is cleared and the teacher dashboard asks for the code again.
- **Demo responses:** labelled **DEMO** everywhere, counted separately, drawn as hatched bars, and removable without touching real responses.

---

## Project structure

```
shared/   content.ts (tables, cards, key, explanations) · evaluate.ts · types.ts
server/   index.ts (Express, static files, login, join URL) · sockets.ts (Socket.IO events) · store.ts (in-memory session)
src/      pages/ (Landing, Activity, Teacher, Results, Presentation) · components/ (AnswerPicker, BarChart, ResultsCard, JoinQR, …)
          components/presentation/ (slides.tsx registry, content.tsx slides, notes.ts, LiveResultsSlide, timers, controls)
scripts/  check-content.ts · smoke.ts
```

Stack: React 18, TypeScript, Vite, Tailwind CSS, Express, Socket.IO, qrcode.react.

## Licence

[MIT](LICENSE) © 2026 William Wong
