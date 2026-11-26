/* =========================================================
   Nexo · demo de red social
   Datos ficticios. Nada se envía a ningún servidor.
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* Escapa texto antes de insertarlo en el DOM (evita inyección HTML). */
const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const G = {
  vio: 'linear-gradient(135deg,#6c5ce7,#b06ab3)',
  sun: 'linear-gradient(135deg,#f7971e,#ffd200)',
  sea: 'linear-gradient(135deg,#2193b0,#6dd5ed)',
  rose: 'linear-gradient(135deg,#ff7e8f,#ffb199)',
  green: 'linear-gradient(135deg,#11998e,#38ef7d)',
  night: 'linear-gradient(135deg,#232526,#414345)',
  blue: 'linear-gradient(135deg,#4568dc,#b06ab3)',
};

const ME = { id: 'me', name: 'Lucía Martín', handle: 'lucia.m', initials: 'LM', g: G.vio, verified: true };

const USERS = [
  ME,
  { id: 'u1', name: 'Marco Ruiz', handle: 'marco.ruiz', initials: 'MR', g: G.sea, bio: 'Fotógrafo urbano 📷' },
  { id: 'u2', name: 'Ana Beltrán', handle: 'ana.b', initials: 'AB', g: G.rose, bio: 'Ilustradora y plantita 🌿' },
  { id: 'u3', name: 'Diego Salas', handle: 'diegos', initials: 'DS', g: G.green, bio: 'Running, libros y café ☕' },
  { id: 'u4', name: 'Elena Vidal', handle: 'elena.vidal', initials: 'EV', g: G.sun, bio: 'Viajera empedernida ✈️' },
  { id: 'u5', name: 'Pablo Núñez', handle: 'pablon', initials: 'PN', g: G.night, bio: 'Dev front-end 💻' },
  { id: 'u6', name: 'Sara Gil', handle: 'sara.gil', initials: 'SG', g: G.blue, bio: 'Música y mindfulness 🎧' },
];

const DEFAULT_POSTS = [
  { id: 'p1', userId: 'u1', text: 'Atardecer en la azotea del barrio. A veces no hace falta ir lejos para encontrar algo bonito 🌇 #Fotografía', time: 'hace 12 min', likes: 84, liked: false, media: '🌇', comments: [{ userId: 'u2', text: '¡Qué luz tan increíble!' }] },
  { id: 'p2', userId: 'u2', text: 'Hoy tocaba dibujar papeleras con caras. Ya sabéis que mi arte es muy serious business 🎨', time: 'hace 48 min', likes: 132, liked: true, media: '🎨', comments: [{ userId: 'me', text: 'Necesito una para mi escritorio 😂' }] },
  { id: 'p3', userId: 'me', text: 'Pequeño recordatorio: descansar también es productivo. Esta tarde sin pantallas y con buen café ☕', time: 'hace 2 h', likes: 56, liked: false, media: '', comments: [{ userId: 'u6', text: 'Totalmente de acuerdo 🙌' }] },
  { id: 'p4', userId: 'u3', text: '10 km antes de desayunar. El cuerpo lo agradece, el gato no tanto 🐈', time: 'hace 4 h', likes: 41, liked: false, media: '🏃', comments: [] },
  { id: 'p5', userId: 'u4', text: 'Nueva libreta para el próximo viaje. ¿Algún destino que recomienden para octubre? 🗺️', time: 'hace 6 h', likes: 97, liked: false, media: '🧳', comments: [{ userId: 'u1', text: '¡Lisboa sin dudarlo!' }] },
];

const CONVERSATIONS = [
  { id: 'c1', userId: 'u1', messages: [{ from: 'u1', text: '¡Hola! ¿Viste mi última foto?', time: '10:24' }, { from: 'me', text: 'Sí, me encantó la luz 🌇', time: '10:26' }] },
  { id: 'c2', userId: 'u2', messages: [{ from: 'u2', text: 'Te paso el boceto del logo cuando lo termine 🎨', time: '09:12' }] },
  { id: 'c3', userId: 'u5', messages: [{ from: 'u5', text: '¿Nos vemos en el meetup del jueves?', time: 'Ayer' }] },
];

const NOTIFICATIONS = [
  { userId: 'u1', text: 'le gustó tu publicación.', time: 'hace 8 min', icon: '❤️' },
  { userId: 'u2', text: 'empezó a seguirte.', time: 'hace 35 min', icon: '👤' },
  { userId: 'u6', text: 'comentó: «Totalmente de acuerdo 🙌»', time: 'hace 2 h', icon: '💬' },
  { userId: 'u3', text: 'mencionó tu nombre en una publicación.', time: 'hace 5 h', icon: '🔔' },
];

const TOPICS = [
  { title: '#Diseño', count: '12,4 mil publicaciones', g: G.vio },
  { title: '#Fotografía', count: '8,9 mil publicaciones', g: G.sea },
  { title: '#Viajes', count: '6,2 mil publicaciones', g: G.sun },
  { title: '#Café', count: '3,1 mil publicaciones', g: G.rose },
];

const TRENDS = [
  { tag: '#LunesSinPantallas', count: '4.218 publicaciones' },
  { tag: 'Diseño de producto', count: '2.905 publicaciones' },
  { tag: 'Recetas fáciles', count: '1.740 publicaciones' },
  { tag: 'Madrid', count: '1.102 publicaciones' },
];

/* ---------- Área privada: TODOS LOS DATOS SON FICTICIOS ---------- */
const PRIVATE = {
  datos: [
    { label: 'Nombre completo', value: 'Lucía Martín Sáez' },
    { label: 'Usuario', value: '@lucia.m' },
    { label: 'Correo electrónico', value: 'lucia.martin.ejemplo@mail.com' },
    { label: 'Teléfono', value: '+34 600 123 456' },
    { label: 'Fecha de nacimiento', value: '14/06/1994' },
    { label: 'Dirección postal', value: 'Calle Olivar 28, 4º B · 28012 Madrid' },
    { label: 'Documento de identidad', value: '12345678Z (ficticio)' },
    { label: 'Miembro desde', value: 'Marzo de 2021' },
  ],
  preferencias: [
    { label: 'Idioma', value: 'Español' },
    { label: 'Visibilidad del perfil', value: 'Pública' },
    { label: 'Notificaciones por correo', value: 'Activadas' },
    { label: 'Dos factores (2FA)', value: 'Activado' },
  ],
  pagos: [
    { brand: 'VISA', holder: 'L. MARTÍN', masked: '•••• •••• •••• 4242', full: '4539 1488 0343 4242', expiry: '08/28', color: 'linear-gradient(135deg,#1a1f71,#3b5bdb)' },
    { brand: 'Mastercard', holder: 'L. MARTÍN', masked: '•••• •••• •••• 8801', full: '5412 7512 3412 8801', expiry: '11/27', color: 'linear-gradient(135deg,#eb001b,#f79e1b)' },
  ],
  movimientos: [
    { name: 'Suscripción Nexo Pro', date: '24 nov 2026', amount: '-4,99 €' },
    { name: 'Recarga de saldo', date: '18 nov 2026', amount: '+25,00 €' },
    { name: 'Compra en librería', date: '11 nov 2026', amount: '-12,40 €' },
  ],
  iban: 'ES91 2100 0418 4502 0005 1332',
  documentos: [
    { name: 'Documento de identidad', type: 'PDF · 1,2 MB', date: '12/03/2024', status: 'Verificado', icon: '🪪' },
    { name: 'Justificante de domicilio', type: 'PDF · 340 KB', date: '12/03/2024', status: 'Verificado', icon: '🏠' },
    { name: 'Contrato de adhesión', type: 'PDF · 210 KB', date: '03/03/2021', status: 'Archivado', icon: '📄' },
    { name: 'Certificado de cuenta', type: 'PDF · 180 KB', date: '02/11/2026', status: 'Disponible', icon: '🧾' },
  ],
};

/* ---------- Estado ---------- */
let posts = loadPosts();
let following = new Set(loadJSON('nexo-following', ['u1', 'u4']));
let activeChat = 'c1';
let unlocked = false; // Se bloquea de nuevo al recargar la página.
let feedFilter = 'recientes';
let searchTerm = '';
let activePrivateTab = 'datos';

function loadJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function loadPosts() {
  const saved = loadJSON('nexo-posts', null);
  return Array.isArray(saved) && saved.length ? saved : structuredClone(DEFAULT_POSTS);
}
function savePosts() { localStorage.setItem('nexo-posts', JSON.stringify(posts)); }
function saveFollowing() { localStorage.setItem('nexo-following', JSON.stringify([...following])); }

const getUser = (id) => USERS.find((u) => u.id === id) || ME;
const avatar = (user, cls = '') =>
  `<div class="avatar ${cls}" style="background:${user.g}">${esc(user.initials)}</div>`;

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 2600);
}

/* ---------- Navegación ---------- */
const VALID_VIEWS = ['inicio', 'explorar', 'mensajes', 'notificaciones', 'perfil', 'privado'];
function setView(view) {
  if (!VALID_VIEWS.includes(view)) return;
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${view}`));
  $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  location.hash = view;
}
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-view]');
  if (trigger) { e.preventDefault(); setView(trigger.dataset.view); }
});

/* ---------- Render: historias ---------- */
function renderStories() {
  $('#stories').innerHTML = USERS.slice(1).map((u) => `
    <button class="story" data-story="${esc(u.id)}" title="Historia de ${esc(u.name)}">
      <div class="story-avatar">${avatar(u)}</div><span>${esc(u.name.split(' ')[0])}</span>
    </button>`).join('');
}

/* ---------- Render: publicaciones ---------- */
function postHTML(p) {
  const u = getUser(p.userId);
  const comments = (p.comments || []).map((c) => {
    const cu = getUser(c.userId);
    return `<div class="comment">${avatar(cu)}<div><strong>${esc(cu.name)}</strong>${esc(c.text)}</div></div>`;
  }).join('');
  const text = esc(p.text).replace(/#[\wÁÉÍÓÚáéíóúÑñ]+/g, (m) => `<span class="post-tag">${m}</span>`);

  return `<article class="post" data-post="${esc(p.id)}">
    <div class="post-head">
      ${avatar(u)}
      <div class="post-head-info"><strong>${esc(u.name)} ${u.verified ? '<span class="verified" title="Verificado">✓</span>' : ''}</strong>
      <small>@${esc(u.handle)} · ${esc(p.time)}</small></div>
      <button class="post-more" title="Más opciones" aria-label="Más opciones">⋯</button>
    </div>
    <div class="post-text">${text}</div>
    ${p.media ? `<div class="post-media" aria-hidden="true">${esc(p.media)}</div>` : ''}
    <div class="post-stats"><span>❤️ ${p.likes} me gusta</span><span>${(p.comments || []).length} comentarios</span></div>
    <div class="post-actions">
      <button class="like-btn ${p.liked ? 'liked' : ''}" data-action="like">${p.liked ? '❤️' : '🤍'} Me gusta</button>
      <button data-action="comment">💬 Comentar</button>
      <button data-action="share">↗️ Compartir</button>
    </div>
    <div class="comment-box hidden"><input type="text" maxlength="180" placeholder="Escribe un comentario…" aria-label="Comentario"><button type="button">Enviar</button></div>
    <div class="comments">${comments}</div>
  </article>`;
}

function visiblePosts(list) {
  let result = [...list];
  if (searchTerm) {
    const q = searchTerm.toLocaleLowerCase();
    result = result.filter((p) => p.text.toLocaleLowerCase().includes(q) || getUser(p.userId).name.toLocaleLowerCase().includes(q));
  }
  return feedFilter === 'populares' ? result.sort((a, b) => b.likes - a.likes) : result;
}
function renderFeed() {
  const list = visiblePosts(posts);
  $('#feed').innerHTML = list.length ? list.map(postHTML).join('')
    : `<div class="card" style="padding:30px;text-align:center;color:var(--muted)">No hay publicaciones que coincidan con «${esc(searchTerm)}».</div>`;
  $('#profileFeed').innerHTML = posts.filter((p) => p.userId === 'me').map(postHTML).join('');
}

/* ---------- Render: explorar, mensajes, notificaciones ---------- */
function renderExplore() {
  $('#topicGrid').innerHTML = TOPICS.map((t) => `
    <button class="topic" style="background:${t.g}" data-topic="${esc(t.title)}">
      <strong>${esc(t.title)}</strong><small>${esc(t.count)}</small>
    </button>`).join('');

  const others = USERS.filter((u) => u.id !== 'me');
  $('#exploreUsers').innerHTML = others.map((u) => `
    <div class="user-card">${avatar(u)}<div class="info"><strong>${esc(u.name)}</strong><small>@${esc(u.handle)} · ${esc(u.bio || 'Miembro de Nexo')}</small></div>
    <button data-follow="${esc(u.id)}" class="${following.has(u.id) ? 'following' : ''}">${following.has(u.id) ? 'Siguiendo' : 'Seguir'}</button></div>`).join('');
}

function renderMessages() {
  $('#chatList').innerHTML = CONVERSATIONS.map((c) => {
    const u = getUser(c.userId);
    const last = c.messages.at(-1);
    return `<button class="chat-item ${c.id === activeChat ? 'active' : ''}" data-chat="${esc(c.id)}">
      ${avatar(u)}<div class="info"><strong>${esc(u.name)}</strong><small>${esc(last.text)}</small></div></button>`;
  }).join('');

  const chat = CONVERSATIONS.find((c) => c.id === activeChat) || CONVERSATIONS[0];
  const u = getUser(chat.userId);
  $('#chatPanel').innerHTML = `
    <div class="chat-panel-head">${avatar(u, 'avatar-sm')}<span>${esc(u.name)}</span></div>
    <div class="chat-body">${chat.messages.map((m) => `<div class="bubble ${m.from === 'me' ? 'mine' : ''}">${esc(m.text)}<br><small style="opacity:.65;font-size:10px">${esc(m.time)}</small></div>`).join('')}</div>
    <form class="chat-form" id="chatForm"><input id="chatInput" maxlength="300" placeholder="Escribe un mensaje…" autocomplete="off" required><button type="submit">Enviar</button></form>`;
}

function renderNotifications() {
  $('#notificationList').innerHTML = NOTIFICATIONS.map((n) => {
    const u = getUser(n.userId);
    return `<div class="list-item"><span style="font-size:18px">${esc(n.icon)}</span>${avatar(u, 'avatar-sm')}
      <p><strong>${esc(u.name)}</strong> ${esc(n.text)}</p><time>${esc(n.time)}</time></div>`;
  }).join('');
}

function renderSuggestions() {
  const suggested = USERS.filter((u) => u.id !== 'me' && !following.has(u.id)).slice(0, 3);
  $('#suggestions').innerHTML = suggested.length ? suggested.map((u) => `
    <div class="sugg-item">${avatar(u, 'avatar-sm')}<div class="info"><strong>${esc(u.name)}</strong><small>@${esc(u.handle)}</small></div>
    <button data-follow="${esc(u.id)}">Seguir</button></div>`).join('')
    : '<p style="color:var(--muted);font-size:12px">Ya sigues a todos 😄</p>';
  $('#trends').innerHTML = TRENDS.map((t) => `<div class="trend" data-topic="${esc(t.tag)}"><strong>${esc(t.tag)}</strong><small>${esc(t.count)}</small></div>`).join('');
}
function rerenderFollowUI() { renderExplore(); renderSuggestions(); }

/* ---------- Área privada ---------- */
function dataCard(title, icon, rows) {
  return `<div class="data-card"><div class="data-card-head"><span>${icon}</span><h3>${title}</h3></div>
    ${rows.map((r) => `<div class="data-row"><span class="label">${esc(r.label)}</span>
      <span class="value">${esc(r.value)}<button class="copy-btn" data-copy="${esc(r.value)}" title="Copiar">copiar</button></span></div>`).join('')}</div>`;
}

function renderPrivatePanels() {
  $('#panel-datos').innerHTML = `<div class="data-grid">
    ${dataCard('Identidad', '👤', PRIVATE.datos)}
    ${dataCard('Preferencias de cuenta', '⚙️', PRIVATE.preferencias)}
  </div>`;

  $('#panel-pagos').innerHTML = `<div class="data-grid">
    <div class="data-card"><div class="data-card-head"><span>💳</span><h3>Métodos de pago</h3></div>
      ${PRIVATE.pagos.map((c, i) => `<div class="card-row">
        <div class="card-brand" style="background:${c.color}">${esc(c.brand.toUpperCase())}</div>
        <div class="info"><strong>${esc(c.brand)} · <span data-cardnum="${i}">${esc(c.masked)}</span></strong>
          <small>${esc(c.holder)} · Caduca ${esc(c.expiry)}</small></div>
        <button class="copy-btn" data-reveal="${i}" title="Mostrar u ocultar">👁 ver</button>
      </div>`).join('')}
      <div class="data-row"><span class="label">IBAN (ficticio)</span><span class="value">${esc(PRIVATE.iban)}<button class="copy-btn" data-copy="${esc(PRIVATE.iban)}">copiar</button></span></div>
    </div>
    <div class="data-card"><div class="data-card-head"><span>🧾</span><h3>Últimos movimientos</h3></div>
      ${PRIVATE.movimientos.map((m) => `<div class="data-row"><span class="label">${esc(m.name)}<br><small>${esc(m.date)}</small></span><span class="value">${esc(m.amount)}</span></div>`).join('')}
    </div>
  </div>`;

  $('#panel-documentos').innerHTML = `<div class="data-grid"><div class="data-card" style="grid-column:1/-1">
    <div class="data-card-head"><span>📁</span><h3>Mis documentos (ejemplo)</h3></div>
    ${PRIVATE.documentos.map((d, i) => `<div class="doc-item"><div class="doc-icon">${esc(d.icon)}</div>
      <div class="doc-info"><strong>${esc(d.name)}</strong><small>${esc(d.type)} · Subido el ${esc(d.date)} · ${esc(d.status)}</small></div>
      <button data-doc="${i}">Descargar</button></div>`).join('')}
  </div></div>`;
}

function unlockPrivate() {
  unlocked = true;
  $('#gate').classList.add('hidden');
  $('#privateContent').classList.remove('hidden');
  renderPrivatePanels();
  toast('Área privada desbloqueada');
}
function lockPrivate() {
  unlocked = false;
  $('#gate').classList.remove('hidden');
  $('#gateError').textContent = '';
  $('#pinInput').value = '';
  $('#privateContent').classList.add('hidden');
  $$('.private-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === 'datos'));
  $$('.private-panel').forEach((p) => p.classList.remove('active'));
  activePrivateTab = 'datos';
  toast('Área privada bloqueada');
}

function downloadDoc(index) {
  const d = PRIVATE.documentos[index];
  if (!d) return;
  const content = `NEXO · DOCUMENTO DE DEMOSTRACIÓN\n\nNombre: ${d.name}\nFormato simulado: ${d.type}\nFecha: ${d.date}\nEstado: ${d.status}\n\nEste archivo es ficticio y no contiene datos reales.`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${d.name.toLowerCase().replace(/\s+/g, '-')}-demo.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Documento de ejemplo descargado');
}

/* ---------- Publicar ---------- */
function publish(text) {
  const clean = text.trim();
  if (!clean) return;
  posts.unshift({ id: `p${Date.now()}`, userId: 'me', text: clean, time: 'ahora mismo', likes: 0, liked: false, media: '', comments: [] });
  savePosts();
  renderFeed();
  toast('Publicación creada');
}

/* ---------- Eventos ---------- */
document.addEventListener('click', (e) => {
  /* Like / comentarios / compartir */
  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn) {
    const article = actionBtn.closest('[data-post]');
    const post = posts.find((p) => p.id === article.dataset.post);
    if (!post) return;
    const action = actionBtn.dataset.action;
    if (action === 'like') {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      savePosts(); renderFeed();
    } else if (action === 'comment') {
      $('.comment-box', article).classList.toggle('hidden');
      $('input', $('.comment-box', article)).focus();
    } else if (action === 'share') {
      const url = `${location.href.split('#')[0]}#${post.id}`;
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
      toast('Enlace copiado al portapapeles');
    }
    return;
  }

  /* Enviar comentario */
  const sendComment = e.target.closest('.comment-box button');
  if (sendComment) {
    const box = sendComment.closest('.comment-box');
    const input = $('input', box);
    const article = box.closest('[data-post]');
    const post = posts.find((p) => p.id === article.dataset.post);
    if (post && input.value.trim()) {
      post.comments.push({ userId: 'me', text: input.value.trim() });
      input.value = '';
      savePosts(); renderFeed(); toast('Comentario publicado');
    }
    return;
  }

  /* Seguir / dejar de seguir */
  const followBtn = e.target.closest('[data-follow]');
  if (followBtn) {
    const id = followBtn.dataset.follow;
    if (following.has(id)) { following.delete(id); toast('Has dejado de seguir'); }
    else { following.add(id); toast('Ahora sigues a esta cuenta'); }
    saveFollowing(); rerenderFollowUI();
    return;
  }

  /* Chat */
  const chatBtn = e.target.closest('[data-chat]');
  if (chatBtn) { activeChat = chatBtn.dataset.chat; renderMessages(); return; }

  /* Temas / tendencias */
  const topic = e.target.closest('[data-topic]');
  if (topic) { toast(`Explorando ${topic.dataset.topic}`); setView('explorar'); return; }

  /* Historias */
  const story = e.target.closest('[data-story]');
  if (story) { toast(`Historia de ${getUser(story.dataset.story).name} (demo)`); return; }

  /* Filtros del feed */
  const chip = e.target.closest('[data-filter]');
  if (chip) {
    feedFilter = chip.dataset.filter;
    $$('#feedFilter .chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderFeed(); return;
  }

  /* Pestañas del área privada */
  const tab = e.target.closest('.private-tab');
  if (tab && unlocked) {
    activePrivateTab = tab.dataset.tab;
    $$('.private-tab').forEach((t) => t.classList.toggle('active', t === tab));
    $$('.private-panel').forEach((p) => p.classList.toggle('active', p.id === `panel-${activePrivateTab}`));
    return;
  }

  /* Mostrar/ocultar número de tarjeta */
  const reveal = e.target.closest('[data-reveal]');
  if (reveal) {
    const i = reveal.dataset.reveal;
    const span = $(`[data-cardnum="${i}"]`);
    const card = PRIVATE.pagos[i];
    const shown = span.textContent.includes('•');
    span.textContent = shown ? card.full : card.masked;
    reveal.textContent = shown ? '🙈 ocultar' : '👁 ver';
    return;
  }

  /* Copiar dato */
  const copy = e.target.closest('[data-copy]');
  if (copy) {
    if (navigator.clipboard) navigator.clipboard.writeText(copy.dataset.copy).catch(() => {});
    toast('Copiado al portapapeles'); return;
  }

  /* Descargar documento */
  const doc = e.target.closest('[data-doc]');
  if (doc) { downloadDoc(Number(doc.dataset.doc)); return; }

  /* Cerrar modal */
  if (e.target.closest('[data-close-modal]')) closeModal();
});

/* Composer */
function openComposerForm() {
  $('#composer').classList.add('expanded');
  $$('.composer-fake-input, .composer-actions', $('#composer')).forEach((el) => el.classList.add('hidden'));
  $('#composerForm').classList.remove('hidden');
  $('#composerText').focus();
}
function closeComposerForm() {
  $('#composer').classList.remove('expanded');
  $$('.composer-fake-input, .composer-actions', $('#composer')).forEach((el) => el.classList.remove('hidden'));
  $('#composerForm').classList.add('hidden');
  $('#composerText').value = '';
  $('#charCounter').textContent = '0 / 280';
}
function openModal() { $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false'); $('#modalText').focus(); }
function closeModal() { $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true'); $('#modalText').value = ''; $('#modalCounter').textContent = '0 / 280'; }

$('#composerOpen').addEventListener('click', openComposerForm);
$('#openComposer').addEventListener('click', () => { setView('inicio'); openComposerForm(); });
$('#composerImage').addEventListener('click', () => { openComposerForm(); toast('Adjuntar foto (simulado)'); });
$('#composerFeeling').addEventListener('click', () => { openComposerForm(); $('#composerText').value = 'Me siento increíble hoy ✨'; $('#charCounter').textContent = '25 / 280'; });
$('#composerCancel').addEventListener('click', closeComposerForm);
$('#composerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  publish($('#composerText').value);
  closeComposerForm();
});
$('#composerText').addEventListener('input', (e) => { $('#charCounter').textContent = `${e.target.value.length} / 280`; });
$('#modalText').addEventListener('input', (e) => { $('#modalCounter').textContent = `${e.target.value.length} / 280`; });
$('#modalForm').addEventListener('submit', (e) => { e.preventDefault(); publish($('#modalText').value); closeModal(); });

/* Búsqueda */
$('#searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value.trim();
  setView('inicio');
  renderFeed();
});

/* Bloqueo / desbloqueo */
$('#gateForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if ($('#pinInput').value === '2468') { $('#gateError').textContent = ''; unlockPrivate(); }
  else { $('#gateError').textContent = 'PIN incorrecto. Usa el PIN de demostración 2468.'; $('#pinInput').select(); }
});
$('#pinInput').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
$('#lockBtn').addEventListener('click', lockPrivate);

/* Chat */
document.addEventListener('submit', (e) => {
  if (e.target.id === 'chatForm') {
    e.preventDefault();
    const input = $('#chatInput');
    if (!input.value.trim()) return;
    const chat = CONVERSATIONS.find((c) => c.id === activeChat);
    chat.messages.push({ from: 'me', text: input.value.trim(), time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) });
    renderMessages();
  }
});

/* Tema, banner, sugerencias */
$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('nexo-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
$('#closeBanner').addEventListener('click', () => $('.demo-banner').classList.add('hidden'));
$('#refreshSuggestions').addEventListener('click', () => { toast('Sugerencias actualizadas'); rerenderFollowUI(); });

/* ---------- Inicio ---------- */
if (localStorage.getItem('nexo-theme') === 'dark') document.body.classList.add('dark');
renderStories();
renderFeed();
renderExplore();
renderMessages();
renderNotifications();
renderSuggestions();

const initialView = location.hash.slice(1);
setView(VALID_VIEWS.includes(initialView) ? initialView : 'inicio');
