/* ---------- Viewport meta (added 22 Jul 2026) — every app page needs this for tablet/phone;
   injected once here so no page has to carry it. Runs synchronously before layout. ---------- */
(function(){
  if (!document.querySelector('meta[name="viewport"]')){
    var m = document.createElement('meta');
    m.name = 'viewport';
    m.content = 'width=device-width, initial-scale=1';
    document.head.appendChild(m);
  }
})();

/* ---------- Mobile search toggle (app-top search-box collapses to an icon under 720px) ---------- */
document.addEventListener('DOMContentLoaded', function(){
  var box = document.querySelector('.app-top .search-box');
  var top = document.querySelector('.app-top');
  if (!box || !top || document.getElementById('hkSearchToggle')) return;
  var btn = document.createElement('button');
  btn.id = 'hkSearchToggle';
  btn.className = 'icon-btn search-toggle-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Search');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  box.parentNode.insertBefore(btn, box);
  btn.addEventListener('click', function(){
    var open = top.classList.toggle('search-open');
    if (open){ var inp = box.querySelector('input'); if (inp) setTimeout(function(){ inp.focus(); }, 50); }
  });
});

/* ---------- Color mode (light/dark) — shared toggle, injected into every rail ---------- */
(function(){
  var KEY='hakiqa-color-mode';
  function apply(mode){ document.documentElement.setAttribute('data-theme', mode==='dark' ? 'dark' : 'light'); }
  var saved = localStorage.getItem(KEY) || 'light';
  apply(saved);
  var SUN='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
  function updateIcon(){
    var btn = document.getElementById('hkModeToggle');
    if (!btn) return;
    var dark = document.documentElement.getAttribute('data-theme')==='dark';
    btn.innerHTML = dark ? SUN : MOON;
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  window.hkToggleColorMode = function(){
    var next = document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    apply(next);
    updateIcon();
  };
  document.addEventListener('DOMContentLoaded', function(){
    var rail = document.querySelector('.rail');
    if (!rail || document.getElementById('hkModeToggle')) return;
    var spacer = rail.querySelector('.rail-spacer');
    var btn = document.createElement('div');
    btn.className = 'rail-icon';
    btn.id = 'hkModeToggle';
    btn.onclick = window.hkToggleColorMode;
    if (spacer) spacer.insertAdjacentElement('afterend', btn); else rail.appendChild(btn);
    updateIcon();
  });
})();

function smartBack(e){
  if (window.history.length > 1 && document.referrer){
    e.preventDefault();
    history.back();
    return false;
  }
  return true;
}
function foldNav(url){
  document.body.classList.add('fold-out');
  sessionStorage.setItem('hakiqa-fold','1');
  setTimeout(()=>{ location.href=url; }, 190);
  return false;
}
function foldToHome(){
  sessionStorage.setItem('hakiqa-last-screen', location.href);
  return foldNav('Home Screen Concept.html');
}
function foldToLastScreen(){
  const last = sessionStorage.getItem('hakiqa-last-screen');
  if (last){ sessionStorage.removeItem('hakiqa-last-screen'); return foldNav(last); }
  return false;
}
function pillSwitch(url){
  event.preventDefault();
  location.replace(url);
  return false;
}
window.__hkFoldedIn = !!sessionStorage.getItem('hakiqa-fold');
if (window.__hkFoldedIn){
  sessionStorage.removeItem('hakiqa-fold');
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.classList.add('fold-in');
    setTimeout(()=>document.body.classList.remove('fold-in'), 320);
  });
}
fetch('assets/icons.svg').then(r=>r.text()).then(svg=>{
  const div = document.createElement('div');
  div.style.display = 'none';
  div.innerHTML = svg;
  const inject = () => document.body.insertBefore(div, document.body.firstChild);
  if (document.body) inject(); else document.addEventListener('DOMContentLoaded', inject);
}).catch(()=>{});

/* ---------- Support: quick tips + chat (shared everywhere) ---------- */
const HK_TIPS = {
  home: ['Quick actions on Home jump straight into the most common tasks. Open Shop, Add Customer, New Product.','The forward arrow (top right) appears after you use the back-arrow, so you can jump straight back to where you were.','Switch Business Mode in Settings to relabel Materials, Recipe and Worker to match how your business actually talks.'],
  settings: ['Business Mode changes vocabulary everywhere, the data model underneath stays the same.','Roles & Access hides apps a role doesn’t need, based on your current Business Mode.','Daily Close now lives inside Point of Sale, not here.'],
  'point of sale': ['Daily Close reconciles cash + M-Pesa at end of day, open it from the POS session menu.','Held sales can be recalled from the queue before checkout.','Discounts above your role’s threshold need manager approval.'],
  crm: ['A deal auto-creates a Project once marked Won, so delivery and budget tracking start immediately.','Drag a deal card between pipeline columns to update its stage.','Contacts show every linked deal, project and invoice in one place.'],
  inventory: ['Reorder points can trigger a suggested Purchase Order automatically.','Recipe-based products consume stock at the point you set in Offer Builder.','Low-stock items surface first in the product list.'],
  'purchase orders': ['A Purchase Order can be created straight from a low-stock alert on the Products tab.','Receiving a PO updates on-hand stock automatically.'],
  sales: ['Orders link back to the originating CRM deal when there is one.','Partial payments keep an order in \u201cPart Paid\u201d until fully settled.'],
  expenses: ['Every expense needs a money-movement classification, it drives the accounting treatment.','Link an expense to a Project to keep budget-vs-actual accurate.'],
  analytics: ['Each signal card shows the underlying evidence, open Evidence to see the sample and method.','Signals are ranked by what needs a decision this week, not by number size alone.'],
  'company brief': ['Each signal card shows the underlying evidence, open Evidence to see the sample and method.','Signals are ranked by what needs a decision this week, not by number size alone.'],
  ceo: ['Each signal card shows the underlying evidence, open Evidence to see the sample and method.'],
  calendar: ['Drag an event to reschedule it, no need to reopen it.','Event categories and colors are configurable from the panel on the right.'],
  'company map': ['The map groups accounts by concentration risk, a single large node is a warning sign, not a compliment.'],
  project: ['Budget-vs-actual updates live as expenses get linked to this project.','Milestones and variations both roll up into the project’s margin forecast.']
};
const HK_TIPS_DEFAULT = ['Use the back-arrow to return Home, a forward arrow appears there to jump straight back.','Your Business Mode (Settings → General) changes vocabulary across the whole app.','Look for the compass icon in Settings to configure how a new sellable thing works.'];
const HK_CHAT_REPLIES = ['Got it, noting that down for the team.','In the full product this connects you to a live agent in under 2 minutes. For now, the Quick tips tab might already answer this.','Thanks for the detail. I’ve flagged it.'];
function hkGuessApp(){
  const active = document.querySelector('.rail-icon.active[title]');
  const label = (active?.getAttribute('title') || document.querySelector('.app-top h1')?.textContent || document.title || '').toLowerCase();
  for (const k in HK_TIPS){ if (label.includes(k)) return k; }
  return null;
}
function hkBuildSupportWidget(){
  if (document.getElementById('hkSupportFab')) return;
  const style = document.createElement('style');
  style.textContent = `
#hkSupportFab{position:fixed;right:26px;bottom:26px;width:56px;height:56px;border-radius:50%;background:var(--navy,#142440);border:none;cursor:pointer;box-shadow:0 12px 24px -10px rgba(0,0,0,.4);z-index:9998;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .2s ease;}
#hkSupportFab:hover{transform:translateY(-3px) scale(1.05);}
#hkSupportFab img{width:32px;height:32px;object-fit:contain;}
#hkSupportOverlay{position:fixed;inset:0;background:rgba(10,15,25,.32);opacity:0;pointer-events:none;transition:opacity .25s ease;z-index:9997;}
#hkSupportOverlay.open{opacity:1;pointer-events:auto;}
#hkSupportPanel{position:fixed;top:0;right:0;height:100vh;width:380px;max-width:92vw;background:var(--card-bg,#fff);box-shadow:-16px 0 40px -20px rgba(0,0,0,.35);transform:translateX(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1);z-index:9999;display:flex;flex-direction:column;font-family:'Urbanist',sans-serif;}
#hkSupportPanel.open{transform:translateX(0);}
.hk-sp-head{display:flex;align-items:center;gap:12px;padding:20px 20px 14px;border-bottom:1px solid var(--line,#e5e2da);}
.hk-sp-head img{width:36px;height:36px;object-fit:contain;}
.hk-sp-head .t{font-weight:800;font-size:15.5px;color:var(--ink,#22252c);flex:1;}
.hk-sp-close{border:none;background:none;cursor:pointer;color:var(--ink-soft,#6b7280);font-size:18px;padding:6px;}
.hk-sp-tabs{display:flex;gap:4px;padding:12px 16px 0;}
.hk-sp-tabs button{flex:1;font-family:inherit;font-size:12.5px;font-weight:700;border:none;background:oklch(96% 0.006 90);color:var(--ink-soft,#6b7280);padding:9px 10px;border-radius:9px;cursor:pointer;}
.hk-sp-tabs button.active{background:var(--navy,#142440);color:#fff;}
.hk-sp-body{flex:1;overflow-y:auto;padding:16px 20px 20px;display:flex;flex-direction:column;gap:10px;}
.hk-tip-card{background:oklch(97% 0.01 260);border:1px solid var(--line,#e5e2da);border-radius:14px;padding:14px 16px;font-size:13px;line-height:1.5;color:var(--ink,#22252c);}
.hk-chat-wrap{display:flex;flex-direction:column;height:100%;}
.hk-chat-msgs{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-bottom:8px;}
.hk-msg{max-width:82%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.45;}
.hk-msg.bot{background:oklch(96% 0.006 90);color:var(--ink,#22252c);align-self:flex-start;border-bottom-left-radius:4px;}
.hk-msg.user{background:var(--navy,#142440);color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}
.hk-chat-input{display:flex;gap:8px;padding-top:10px;border-top:1px solid var(--line,#e5e2da);}
.hk-chat-input input{flex:1;font-family:inherit;font-size:13px;padding:10px 14px;border-radius:10px;border:1px solid var(--line,#e5e2da);outline:none;}
.hk-chat-input button{font-family:inherit;font-size:13px;font-weight:700;background:var(--navy,#142440);color:#fff;border:none;border-radius:10px;padding:0 16px;cursor:pointer;}
`;
  document.head.appendChild(style);
  const overlay = document.createElement('div'); overlay.id='hkSupportOverlay';
  const panel = document.createElement('div'); panel.id='hkSupportPanel';
  panel.innerHTML = `<div class="hk-sp-head"><img src="assets/mascot/haki-waving.png" alt=""><div class="t">Support</div><button class="hk-sp-close" id="hkSpClose"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" style="display:block;"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>
<div class="hk-sp-tabs"><button class="active" id="hkTabTips">Quick tips</button><button id="hkTabChat">Chat with Haki</button></div>
<div class="hk-sp-body" id="hkSpBody"></div>`;
  const fab = document.createElement('button'); fab.id='hkSupportFab'; fab.title='Support';
  fab.innerHTML = `<img src="assets/mascot/haki-waving.png" alt="Support">`;
  document.body.append(overlay, panel, fab);
  let tab = 'tips';
  const chatLog = [];
  function renderTips(){
    const key = hkGuessApp();
    const tips = (key && HK_TIPS[key]) || HK_TIPS_DEFAULT;
    document.getElementById('hkSpBody').innerHTML = tips.map(t=>`<div class="hk-tip-card">${t}</div>`).join('');
  }
  function renderChat(){
    const body = document.getElementById('hkSpBody');
    body.innerHTML = `<div class="hk-chat-wrap"><div class="hk-chat-msgs" id="hkChatMsgs"></div>
<div class="hk-chat-input"><input id="hkChatInput" type="text" placeholder="Type a message…"><button id="hkChatSend">Send</button></div></div>`;
    if (!chatLog.length) chatLog.push({who:'bot', text:'Hi, I’m Haki, how can I help?'});
    paintChat();
    document.getElementById('hkChatSend').onclick = sendChat;
    document.getElementById('hkChatInput').addEventListener('keydown', e=>{ if (e.key==='Enter') sendChat(); });
  }
  function paintChat(){
    const el = document.getElementById('hkChatMsgs');
    if (!el) return;
    el.innerHTML = chatLog.map(m=>`<div class="hk-msg ${m.who}">${m.text}</div>`).join('');
    el.scrollTop = el.scrollHeight;
  }
  function sendChat(){
    const input = document.getElementById('hkChatInput');
    const val = input.value.trim();
    if (!val) return;
    chatLog.push({who:'user', text:val});
    input.value='';
    paintChat();
    setTimeout(()=>{
      chatLog.push({who:'bot', text: HK_CHAT_REPLIES[(chatLog.length) % HK_CHAT_REPLIES.length]});
      paintChat();
    }, 650);
  }
  function setTab(t){
    tab = t;
    document.getElementById('hkTabTips').classList.toggle('active', t==='tips');
    document.getElementById('hkTabChat').classList.toggle('active', t==='chat');
    if (t==='tips') renderTips(); else renderChat();
  }
  function openPanel(){ overlay.classList.add('open'); panel.classList.add('open'); setTab(tab); }
  function closePanel(){ overlay.classList.remove('open'); panel.classList.remove('open'); }
  fab.onclick = openPanel;
  overlay.onclick = closePanel;
  document.getElementById('hkSpClose').onclick = closePanel;
  document.getElementById('hkTabTips').onclick = ()=>setTab('tips');
  document.getElementById('hkTabChat').onclick = ()=>setTab('chat');
}
document.addEventListener('DOMContentLoaded', hkBuildSupportWidget);

/* ---------- Rail avatar -> My Account (app-wide, one shared hook) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const av = document.querySelector('.rail .avatar');
  if (!av || av.closest('a')) return;
  const onAccount = /my account\.html$/i.test(location.pathname);
  av.style.cursor = 'pointer';
  if (onAccount) { av.style.outline = '2px solid white'; av.style.outlineOffset = '2px'; return; }
  av.title = 'My Account';
  av.addEventListener('click', () => { location.href = 'My Account.html'; });
});

/* ---------- Dismissible Haki Tips (shared everywhere) ---------- */
function hkDismissKey(el){
  const label = (el.querySelector('.ht-title')?.textContent || el.textContent || '').trim().slice(0,60);
  return 'hakiqa-dismissed-tip:' + location.pathname + ':' + (el.id || label);
}
function hkEnhanceTip(el){
  if (el.querySelector(':scope > .ht-dismiss') || el.dataset.htEnhancing) return;
  el.dataset.htEnhancing = '1';
  const key = hkDismissKey(el);
  if (localStorage.getItem(key)){ el.style.display = 'none'; return; }
  const btn = document.createElement('button');
  btn.className = 'ht-dismiss';
  btn.setAttribute('aria-label','Dismiss this tip');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  btn.onclick = (e) => {
    e.stopPropagation();
    localStorage.setItem(hkDismissKey(el), '1');
    el.style.transition = 'opacity .18s ease, margin-bottom .18s ease, max-height .18s ease';
    el.style.opacity = '0';
    setTimeout(()=>{ el.style.display = 'none'; }, 180);
  };
  requestAnimationFrame(() => el.appendChild(btn));
}
function hkScanTips(){ document.querySelectorAll('.haki-tip').forEach(hkEnhanceTip); }
document.addEventListener('DOMContentLoaded', hkScanTips);
new MutationObserver(hkScanTips).observe(document.documentElement, {childList:true, subtree:true});
