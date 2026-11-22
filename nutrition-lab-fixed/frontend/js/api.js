// ─────────────────────────────────────────────────────────────────
//  Nutrition Lab — Frontend API Client
//  Communicates with the Node.js backend REST API
// ─────────────────────────────────────────────────────────────────

const API_BASE = window.location.origin;

// ── Token management ─────────────────────────────────────────────
const Auth = {
  getToken: ()      => localStorage.getItem('nl_token'),
  setToken: (t)     => localStorage.setItem('nl_token', t),
  getUser:  ()      => { try { return JSON.parse(localStorage.getItem('nl_user')); } catch { return null; } },
  setUser:  (u)     => localStorage.setItem('nl_user', JSON.stringify(u)),
  clear:    ()      => { localStorage.removeItem('nl_token'); localStorage.removeItem('nl_user'); },
  isLoggedIn: ()    => !!localStorage.getItem('nl_token'),
};

// ── HTTP request wrapper ─────────────────────────────────────────
async function api(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error(`API ${method} ${path}:`, err.message);
    throw err;
  }
}

// ── Convenience methods ───────────────────────────────────────────
const API = {
  // Auth
  register: (d)     => api('POST', '/api/auth/register', d),
  login:    (d)     => api('POST', '/api/auth/login', d),
  logout:   ()      => api('POST', '/api/auth/logout'),

  // User
  getProfile:  ()   => api('GET',  '/api/user/profile'),
  updateProfile:(d) => api('PUT',  '/api/user/profile', d),
  getDashboard:()   => api('GET',  '/api/user/dashboard'),

  // Meals
  getMeals:  (date) => api('GET',  '/api/meals' + (date ? `?date=${date}` : '')),
  addMeal:   (d)    => api('POST', '/api/meals', d),
  deleteMeal:(id)   => api('DELETE',`/api/meals/${id}`),
  mealSummary:(date)=> api('GET',  `/api/meals/summary?date=${date}`),

  // Workouts
  getWorkouts:   ()  => api('GET',  '/api/workouts'),
  addWorkout:   (d)  => api('POST', '/api/workouts', d),
  deleteWorkout:(id) => api('DELETE',`/api/workouts/${id}`),

  // Progress
  getWeight:   ()   => api('GET',  '/api/progress/weight'),
  logWeight:  (v)   => api('POST', '/api/progress/weight', { value: v }),
  getWater:    ()   => api('GET',  '/api/progress/water'),
  updateWater:(v)   => api('POST', '/api/progress/water', { amount: v }),
  getStats:    ()   => api('GET',  '/api/progress/stats'),

  // Coach
  getInsights: ()   => api('GET',  '/api/coach/insights'),
  chat:       (msg) => api('POST', '/api/coach/chat', { message: msg }),
};

// ── Guards ────────────────────────────────────────────────────────
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}
function redirectIfLoggedIn() {
  if (Auth.isLoggedIn()) {
    window.location.href = '/pages/dashboard.html';
  }
}

// ── Toast notifications ───────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type]||'•'}</span><span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3200);
}

// ── Shared chart rendering ────────────────────────────────────────
function drawRing(canvas, percent, color = '#39FF6A') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const r = Math.min(cx, cy) - 10;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Background ring
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(57,255,106,0.1)'; ctx.lineWidth = 10; ctx.stroke();
  // Progress arc
  if (percent > 0) {
    const angle = (Math.min(percent, 100) / 100) * 2 * Math.PI;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
  }
}

function drawLineChart(canvas, labels, data, color = '#39FF6A') {
  if (!canvas || !data.length) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { t: 20, r: 20, b: 38, l: 52 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const xS = i => pad.l + (i / (data.length - 1)) * cW;
  const yS = v => pad.t + cH - ((v - min) / (max - min)) * cH;

  ctx.clearRect(0, 0, W, H);

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (cH / 4) * i;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cW, y); ctx.stroke();
    const val = (max - ((max - min) / 4) * i).toFixed(1);
    ctx.fillStyle = '#6B8F72'; ctx.font = '11px DM Mono,monospace'; ctx.textAlign = 'right';
    ctx.fillText(val, pad.l - 6, y + 4);
  }

  // Area gradient
  const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
  grad.addColorStop(0, color + '28'); grad.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.moveTo(xS(0), yS(data[0]));
  data.forEach((v, i) => { if (i > 0) ctx.lineTo(xS(i), yS(v)); });
  ctx.lineTo(xS(data.length - 1), pad.t + cH);
  ctx.lineTo(xS(0), pad.t + cH);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  data.forEach((v, i) => i === 0 ? ctx.moveTo(xS(i), yS(v)) : ctx.lineTo(xS(i), yS(v)));
  ctx.stroke();

  // Dots
  data.forEach((v, i) => {
    ctx.beginPath(); ctx.arc(xS(i), yS(v), 4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.arc(xS(i), yS(v), 2, 0, Math.PI * 2);
    ctx.fillStyle = '#080C0A'; ctx.fill();
  });

  // X labels
  ctx.fillStyle = '#6B8F72'; ctx.font = '10px DM Mono,monospace'; ctx.textAlign = 'center';
  labels.forEach((l, i) => ctx.fillText(l, xS(i), H - 8));
}

function drawDonut(canvas, segments) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const r = Math.min(cx, cy) - 8;
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (!total) return;
  let start = -Math.PI / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  segments.forEach(s => {
    const angle = (s.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.arc(cx, cy, r * 0.62, start + angle, start, true);
    ctx.closePath(); ctx.fillStyle = s.color; ctx.fill();
    start += angle;
  });
}

// ── Nav injection ─────────────────────────────────────────────────
function buildNav(activePage) {
  const user = Auth.getUser();
  const pages = [
    { key: 'dashboard', href: '/pages/dashboard.html', label: 'Dashboard' },
    { key: 'tracker',   href: '/pages/tracker.html',   label: 'Food Tracker' },
    { key: 'workout',   href: '/pages/workout.html',   label: 'Workout Lab' },
    { key: 'coach',     href: '/pages/coach.html',     label: 'AI Coach' },
    { key: 'progress',  href: '/pages/progress.html',  label: 'Progress' },
  ];
  const links = pages.map(p =>
    `<li><a href="${p.href}" class="${activePage===p.key?'active':''}">${p.label}</a></li>`
  ).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <nav id="main-nav">
      <a href="/index.html" class="logo">
        <div class="logo-icon">🔬</div>
        <span class="logo-text">Nutrition<span>Lab</span></span>
      </a>
      <ul class="nav-links">${links}</ul>
      <div class="nav-right">
        ${user
          ? `<span class="nav-user">👤 ${user.name.split(' ')[0]}</span>
             <button class="btn-cta" onclick="handleLogout()">Log Out</button>`
          : `<a href="/pages/login.html" class="btn-ghost">Log In</a>
             <a href="/pages/login.html" class="btn-cta">Get Started</a>`
        }
      </div>
    </nav>
  `);

  window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (nav) nav.style.background = window.scrollY > 30
      ? 'rgba(8,12,10,0.97)' : 'rgba(8,12,10,0.88)';
  });
}

async function handleLogout() {
  try { await API.logout(); } catch {}
  Auth.clear();
  window.location.href = '/index.html';
}
