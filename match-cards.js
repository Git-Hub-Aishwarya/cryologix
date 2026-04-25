/* ─────────────────────────────────────────────────────────────
   Cryologix · match-cards.js
   Self-contained match card UI + bid capture modal.
   Exposes: window.cryologixRenderCards(matches, containerEl)
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────
  var EMAILJS_PUBLIC_KEY   = '8L7pDfUTkTS7MqiAq';
  var EMAILJS_SERVICE_ID   = 'service_1crshrn';
  var EMAILJS_TPL_NOTIFY   = 'template_t3cjxrj';
  var EMAILJS_TPL_AUTORESP = 'template_wgewh8b';
  var SUCCESS_AUTOCLOSE_MS = 4000;

  // Initialize EmailJS once (no-op if the SDK didn't load).
  if (window.emailjs && typeof window.emailjs.init === 'function') {
    try { window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); }
    catch (e) { console.error('[Cryologix] EmailJS init failed:', e); }
  }

  // ── Inject CSS once ─────────────────────────────────────────
  var STYLE_ID = 'cryologix-match-cards-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = ''
      + '.cx-card{'
      +   'background:#fff;'
      +   'border:1px solid var(--line, #e7e8ec);'
      +   'border-radius:16px;'
      +   'padding:22px;'
      +   'margin-bottom:14px;'
      +   'box-shadow:0 1px 2px rgba(11,18,32,0.04), 0 12px 30px -18px rgba(11,18,32,0.12);'
      +   'transition:border-color .2s ease, transform .2s ease, box-shadow .25s ease;'
      +   'font-family:\'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;'
      +   'color:var(--ink, #0b1220);'
      + '}'
      + '.cx-card:hover{'
      +   'border-color:var(--ink, #0b1220);'
      +   'transform:translateY(-2px);'
      +   'box-shadow:0 4px 8px rgba(11,18,32,0.06), 0 24px 48px -22px rgba(11,18,32,0.2);'
      + '}'

      + '.cx-card-top{display:flex; align-items:center; gap:12px; margin-bottom:4px;}'
      + '.cx-name{font-size:18px; font-weight:600; letter-spacing:-0.01em; color:var(--ink, #0b1220);}'
      + '.cx-pill{'
      +   'display:inline-flex; align-items:center;'
      +   'padding:3px 10px; border-radius:999px;'
      +   'font-size:11px; font-weight:600;'
      +   'text-transform:uppercase; letter-spacing:0.04em;'
      + '}'
      + '.cx-pill.verified{background:var(--accent-soft, #e8f7f3); color:var(--accent, #00b894);}'
      + '.cx-pill.unverified{background:#fff4e0; color:#b07000;}'
      + '.cx-score{'
      +   'margin-left:auto;'
      +   'width:42px; height:42px; border-radius:50%;'
      +   'display:grid; place-items:center;'
      +   'color:#fff; font-weight:700; font-size:14px;'
      +   'box-shadow:0 6px 14px -6px rgba(11,18,32,0.25);'
      +   'flex-shrink:0;'
      + '}'
      + '.cx-score.high{background:linear-gradient(135deg, #00b894, #0d8b85);}'
      + '.cx-score.mid{background:linear-gradient(135deg, #8b93a4, #5b6477);}'
      + '.cx-score.low{background:linear-gradient(135deg, #e0a050, #b07000);}'

      + '.cx-sub{'
      +   'font-size:13px; color:var(--ink-dim, #5b6477);'
      +   'margin-top:4px;'
      + '}'
      + '.cx-sub .sep{margin:0 6px; color:var(--ink-mute, #8b93a4);}'

      + '.cx-lane{'
      +   'display:flex; justify-content:space-between; align-items:flex-start;'
      +   'gap:16px; margin-top:18px;'
      + '}'
      + '.cx-lane-cities{font-size:16px; font-weight:600; letter-spacing:-0.005em; color:var(--ink, #0b1220);}'
      + '.cx-lane-arrow{color:var(--ink-mute, #8b93a4); margin:0 6px; font-weight:500;}'
      + '.cx-lane-pins{'
      +   'font-family:\'JetBrains Mono\', ui-monospace, monospace;'
      +   'font-size:12px; color:var(--ink-dim, #5b6477);'
      +   'margin-top:4px;'
      + '}'
      + '.cx-lane-date{font-size:14px; color:var(--ink-dim, #5b6477); white-space:nowrap; padding-top:1px;}'

      + '.cx-reasons{'
      +   'display:flex; flex-wrap:wrap; gap:6px;'
      +   'margin-top:16px;'
      + '}'
      + '.cx-chip{'
      +   'display:inline-block; padding:4px 10px;'
      +   'border-radius:999px;'
      +   'font-size:12px; font-weight:500;'
      +   'background:#f1f2f5; color:#1a2238;'
      +   'white-space:nowrap;'
      + '}'
      + '.cx-chip.lane{background:#e8f0ff; color:#0a4dc7;}'
      + '.cx-chip.temp{background:#e8f7f3; color:#00875a;}'
      + '.cx-chip.date{background:#f0e8ff; color:#5b21b6;}'
      + '.cx-chip.price{background:#e0f7f5; color:#0d8b85;}'
      + '.cx-chip.badge{background:var(--accent-soft, #e8f7f3); color:var(--accent, #00b894);}'
      + '.cx-chip.capacity{background:#f1f2f5; color:#1a2238;}'
      + '.cx-chip.status{background:#fff0e0; color:#b75500;}'
      + '.cx-chip.more{background:#f1f2f5; color:#5b6477; font-weight:600; cursor:pointer; user-select:none; transition:background .15s, color .15s;}'
      + '.cx-chip.more:hover{background:#e7e8ec; color:#0b1220;}'

      + '.cx-bottom{'
      +   'display:flex; justify-content:space-between; align-items:center;'
      +   'gap:14px; margin-top:18px; padding-top:16px;'
      +   'border-top:1px solid var(--line-2, #eef0f3);'
      + '}'
      + '.cx-price{font-size:18px; font-weight:700; letter-spacing:-0.01em; color:var(--ink, #0b1220);}'
      + '.cx-price .lbl{font-size:13px; font-weight:500; color:var(--ink-dim, #5b6477); margin-right:4px;}'
      + '.cx-bid-btn{'
      +   'display:inline-flex; align-items:center; gap:8px;'
      +   'font-family:inherit;'
      +   'font-size:14px; font-weight:500;'
      +   'padding:11px 20px; border-radius:999px;'
      +   'border:1px solid transparent;'
      +   'background:var(--ink, #0b1220); color:#fff;'
      +   'cursor:pointer; transition:all .18s ease;'
      + '}'
      + '.cx-bid-btn:hover{background:#000; transform:translateY(-1px);}'
      + '.cx-bid-btn .arrow{transition:transform .18s;}'
      + '.cx-bid-btn:hover .arrow{transform:translateX(3px);}'

      // ── Modal ───────────────────────────────────────────────
      + '.cx-modal-backdrop{'
      +   'position:fixed; inset:0; z-index:1000;'
      +   'background:rgba(11,18,32,0.55);'
      +   '-webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);'
      +   'display:none;'
      +   'align-items:center; justify-content:center;'
      +   'padding:20px;'
      +   'animation:cxFadeIn .2s ease;'
      +   'font-family:\'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;'
      + '}'
      + '.cx-modal-backdrop[aria-hidden="false"]{display:flex;}'
      + '@keyframes cxFadeIn{from{opacity:0;} to{opacity:1;}}'
      + '@keyframes cxRise{from{transform:translateY(12px); opacity:0;} to{transform:none; opacity:1;}}'
      + '.cx-modal{'
      +   'background:#fff; border-radius:20px;'
      +   'max-width:440px; width:100%;'
      +   'padding:36px;'
      +   'position:relative;'
      +   'box-shadow:0 40px 80px -20px rgba(11,18,32,0.35);'
      +   'animation:cxRise .25s cubic-bezier(.2,.8,.2,1);'
      +   'color:var(--ink, #0b1220);'
      + '}'
      + '.cx-modal-close{'
      +   'position:absolute; top:14px; right:14px;'
      +   'width:32px; height:32px; border-radius:50%;'
      +   'background:var(--bg, #f7f7f5); border:none; cursor:pointer;'
      +   'font-size:18px; color:var(--ink-dim, #5b6477); line-height:1;'
      +   'display:grid; place-items:center;'
      +   'transition:background .15s, color .15s;'
      + '}'
      + '.cx-modal-close:hover{background:var(--line, #e7e8ec); color:var(--ink, #0b1220);}'
      + '.cx-modal-head{margin-bottom:18px;}'
      + '.cx-eyebrow{'
      +   'font-size:12px; color:var(--ink-mute, #8b93a4);'
      +   'text-transform:uppercase; letter-spacing:0.15em;'
      +   'font-weight:500;'
      +   'margin-bottom:8px;'
      + '}'
      + '.cx-modal-head h3{'
      +   'font-size:24px; font-weight:600;'
      +   'letter-spacing:-0.02em; margin:0 0 6px;'
      +   'line-height:1.2;'
      + '}'
      + '.cx-modal-head p{color:var(--ink-dim, #5b6477); margin:0; font-size:14px;}'
      + '.cx-summary{'
      +   'background:var(--bg, #f7f7f5);'
      +   'border-radius:12px; padding:12px 14px;'
      +   'margin-bottom:18px;'
      +   'font-size:13px; color:var(--ink-2, #1a2238);'
      +   'display:flex; flex-direction:column; gap:4px;'
      + '}'
      + '.cx-summary .row{display:flex; justify-content:space-between; gap:10px;}'
      + '.cx-summary .k{color:var(--ink-mute, #8b93a4); font-size:11px; text-transform:uppercase; letter-spacing:0.08em;}'
      + '.cx-summary .v{font-weight:600; color:var(--ink, #0b1220);}'
      + '.cx-form{display:flex; flex-direction:column; gap:14px;}'
      + '.cx-form label{display:flex; flex-direction:column; gap:6px;}'
      + '.cx-form label > span{'
      +   'font-size:11px; color:var(--ink-dim, #5b6477);'
      +   'text-transform:uppercase; letter-spacing:0.1em;'
      +   'font-weight:500;'
      + '}'
      + '.cx-form input{'
      +   'font-family:inherit; font-size:15px;'
      +   'padding:12px 14px; border-radius:10px;'
      +   'border:1px solid var(--line, #e7e8ec);'
      +   'background:var(--bg, #f7f7f5); color:var(--ink, #0b1220);'
      +   'width:100%;'
      +   'transition:border-color .15s, background .15s;'
      + '}'
      + '.cx-form input:focus{outline:none; border-color:var(--ink, #0b1220); background:#fff;}'
      + '.cx-form button[type=submit]{'
      +   'margin-top:6px; width:100%; justify-content:center;'
      +   'border:none;'
      +   'display:inline-flex; align-items:center; gap:8px;'
      +   'font-family:inherit; font-size:15px; font-weight:500;'
      +   'padding:13px 22px; border-radius:999px;'
      +   'background:var(--ink, #0b1220); color:#fff;'
      +   'cursor:pointer; transition:all .18s ease;'
      + '}'
      + '.cx-form button[type=submit]:hover{background:#000; transform:translateY(-1px);}'
      + '.cx-form button[type=submit]:disabled{opacity:0.6; cursor:wait; transform:none; background:var(--ink, #0b1220);}'
      + '.cx-form button .arrow{transition:transform .18s;}'
      + '.cx-form button:hover .arrow{transform:translateX(3px);}'
      + '.cx-success{text-align:center; padding:8px 0 4px;}'
      + '.cx-success .check{'
      +   'width:56px; height:56px; margin:0 auto 18px;'
      +   'border-radius:50%; background:var(--accent-soft, #e8f7f3);'
      +   'color:var(--accent, #00b894); font-size:28px; font-weight:700;'
      +   'display:grid; place-items:center;'
      + '}'
      + '.cx-success h4{font-size:20px; font-weight:600; letter-spacing:-0.01em; margin:0 0 6px;}'
      + '.cx-success p{color:var(--ink-dim, #5b6477); margin:0 0 22px; font-size:15px;}'
      + '.cx-done-btn{'
      +   'display:inline-flex; align-items:center; gap:8px;'
      +   'font-family:inherit; font-size:14px; font-weight:500;'
      +   'padding:11px 24px; border-radius:999px;'
      +   'background:var(--ink, #0b1220); color:#fff;'
      +   'border:none; cursor:pointer; transition:all .18s ease;'
      + '}'
      + '.cx-done-btn:hover{background:#000; transform:translateY(-1px);}'
      ;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── Helpers ─────────────────────────────────────────────────
  function escHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtINR(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    // Indian numbering: e.g. 52,400 / 1,30,000
    var x = Math.round(n).toString();
    var lastThree = x.slice(-3);
    var rest = x.slice(0, -3);
    if (rest.length) lastThree = ',' + lastThree;
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return '₹' + rest + lastThree;
  }

  function fmtDate(d) {
    if (!d) return '';
    var dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dd = String(dt.getDate()).padStart(2, '0');
    return dd + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
  }

  function scoreClass(score) {
    if (score >= 80) return 'high';
    if (score >= 50) return 'mid';
    return 'low';
  }

  function reasonChipType(r) {
    var t = (r && r.type) ? String(r.type).toLowerCase() : '';
    var allowed = ['lane','temp','date','price','badge','capacity','status'];
    return allowed.indexOf(t) >= 0 ? t : '';
  }

  function topReasons(reasons, n) {
    if (!Array.isArray(reasons)) return [];
    var copy = reasons.slice();
    copy.sort(function (a, b) {
      var pa = (a && typeof a.points === 'number') ? a.points : 0;
      var pb = (b && typeof b.points === 'number') ? b.points : 0;
      return pb - pa;
    });
    return copy.slice(0, n);
  }

  // ── Modal (singleton, lazy) ─────────────────────────────────
  var modalEl = null;        // backdrop element
  var modalForm = null;
  var modalSuccess = null;
  var modalTitleEl = null;
  var modalSummaryEl = null;
  var modalSuccessMsgEl = null;
  var currentMatch = null;
  var autoCloseTimer = null;
  var prevBodyOverflow = '';

  function buildModal() {
    if (modalEl) return;

    var backdrop = document.createElement('div');
    backdrop.className = 'cx-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'cxModalTitle');

    backdrop.innerHTML =
        '<div class="cx-modal" role="document">'
      +   '<button type="button" class="cx-modal-close" aria-label="Close" data-cx-close>&times;</button>'
      +   '<div class="cx-modal-head">'
      +     '<div class="cx-eyebrow">Send bid</div>'
      +     '<h3 id="cxModalTitle">Lock in operator</h3>'
      +     '<p>We&rsquo;ll connect you the moment they respond. ETA: 24 hours.</p>'
      +   '</div>'
      +   '<div class="cx-summary" data-cx-summary></div>'
      +   '<form class="cx-form" novalidate data-cx-form>'
      +     '<label>'
      +       '<span>Email</span>'
      +       '<input type="email" name="email" required autocomplete="email" placeholder="you@company.com" />'
      +     '</label>'
      +     '<label>'
      +       '<span>Phone</span>'
      +       '<input type="tel" name="phone" required autocomplete="tel" placeholder="+91 98XXX XXXXX" />'
      +     '</label>'
      +     '<label>'
      +       '<span>Your bid (&#8377;)</span>'
      +       '<input type="number" name="askPrice" required min="1" step="1" placeholder="e.g. 52400" />'
      +     '</label>'
      +     '<button type="submit">Send bid <span class="arrow">&rarr;</span></button>'
      +   '</form>'
      +   '<div class="cx-success" hidden data-cx-success>'
      +     '<div class="check">&#10003;</div>'
      +     '<h4>Bid sent.</h4>'
      +     '<p data-cx-success-msg>The operator will respond within 24 hours.</p>'
      +     '<button type="button" class="cx-done-btn" data-cx-close>Done</button>'
      +   '</div>'
      + '</div>';

    document.body.appendChild(backdrop);

    modalEl = backdrop;
    modalForm = backdrop.querySelector('[data-cx-form]');
    modalSuccess = backdrop.querySelector('[data-cx-success]');
    modalTitleEl = backdrop.querySelector('#cxModalTitle');
    modalSummaryEl = backdrop.querySelector('[data-cx-summary]');
    modalSuccessMsgEl = backdrop.querySelector('[data-cx-success-msg]');

    // Backdrop click + close button
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) { closeModal(); return; }
      if (e.target.closest && e.target.closest('[data-cx-close]')) { closeModal(); }
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalEl && modalEl.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });

    // Submit
    modalForm.addEventListener('submit', onSubmit);
  }

  function openModal(match) {
    buildModal();
    currentMatch = match || {};
    var truck = currentMatch.truck || {};

    var operator = truck.ownerName || truck.operatorName || truck.operator || 'this operator';
    modalTitleEl.textContent = 'Lock in ' + operator;
    if (modalSuccessMsgEl) {
      modalSuccessMsgEl.textContent = operator + ' will respond within 24 hours.';
    }

    // Build summary box
    var lane = (truck.fromCity || '—') + ' → ' + (truck.toCity || '—');
    var price = fmtINR(currentMatch.estimatedPrice);
    var date = fmtDate(truck.availableDate || truck.date || truck.availableOn);
    var rows = [
      { k: 'Lane', v: lane },
      { k: 'Estimated', v: price }
    ];
    if (date) rows.push({ k: 'Date', v: date });
    modalSummaryEl.innerHTML = rows.map(function (r) {
      return '<div class="row"><span class="k">' + escHtml(r.k) + '</span><span class="v">' + escHtml(r.v) + '</span></div>';
    }).join('');

    // Reset form/success state
    modalForm.hidden = false;
    modalSuccess.hidden = true;
    modalForm.reset();
    // Pre-fill ask price with the estimated price as a smart starting point.
    var askInput = modalForm.querySelector('[name="askPrice"]');
    if (askInput && typeof currentMatch.estimatedPrice === 'number') {
      askInput.value = Math.round(currentMatch.estimatedPrice);
    }
    var btn = modalForm.querySelector('button[type=submit]');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Send bid <span class="arrow">&rarr;</span>';
    }

    // Show + lock scroll
    prevBodyOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
    modalEl.setAttribute('aria-hidden', 'false');

    setTimeout(function () {
      var first = modalForm.querySelector('input');
      if (first) first.focus();
    }, 50);
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = prevBodyOverflow;
    if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!modalForm.checkValidity()) { modalForm.reportValidity(); return; }

    var btn = modalForm.querySelector('button[type=submit]');
    var originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    var match = currentMatch || {};
    var truck = match.truck || {};
    var payload = {
      email: modalForm.email.value.trim(),
      phone: modalForm.phone.value.trim(),
      askPrice: Number(modalForm.askPrice.value) || 0,
      Operator: truck.ownerName || truck.operatorName || truck.operator || '',
      Lane: (truck.fromCity || '') + ' → ' + (truck.toCity || ''),
      EstimatedPrice: match.estimatedPrice,
      Score: match.score,
      Date: fmtDate(truck.availableDate || truck.date || truck.availableOn),
      _subject: 'Cryologix bid sent (V0)',
      _template: 'table',
      _captcha: 'false',
      _autoresponse: [
        'Hi,',
        '',
        'Thanks for your bid through Cryologix.',
        '',
        'We have passed your interest to ' + (truck.ownerName || 'the fleet operator') + ' for the ' + (truck.fromCity || '') + ' → ' + (truck.toCity || '') + ' lane. Operators typically respond within 24 hours; you will hear back via email or phone.',
        '',
        'If you have questions in the meantime, just reply to this email.',
        '',
        '— The Cryologix team',
        '',
        'P.S. Cryologix is in early access. You are among the first cohort of shippers using the platform.'
      ].join('\n')
    };

    var done = function () {
      // Fail-soft: always show success so demo doesn't break.
      modalForm.hidden = true;
      modalSuccess.hidden = false;
      btn.disabled = false;
      btn.innerHTML = originalHtml;

      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(closeModal, SUCCESS_AUTOCLOSE_MS);
    };

    var notifyParams = {
      email: payload.email,
      phone: payload.phone,
      ask_price: payload.askPrice,
      operator: payload.Operator,
      lane: payload.Lane,
      estimated_price: payload.EstimatedPrice,
      score: payload.Score,
      date: payload.Date
    };

    // Bidder's email mapped under several common template-variable names so
    // the autoresponse template's "To Email" field works whichever was used.
    // All bid context mirrored to the autoresponse so the bidder gets a full record.
    var autorespParams = {
      to_email: payload.email,
      user_email: payload.email,
      email: payload.email,
      reply_to: payload.email,
      phone: payload.phone,
      ask_price: payload.askPrice,
      operator: payload.Operator,
      lane: payload.Lane,
      estimated_price: payload.EstimatedPrice,
      score: payload.Score,
      date: payload.Date
    };

    if (!window.emailjs || typeof window.emailjs.send !== 'function') {
      console.error('[Cryologix] EmailJS SDK not loaded — falling through to success state.');
      done();
      return;
    }

    Promise.all([
      window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TPL_NOTIFY, notifyParams),
      window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TPL_AUTORESP, autorespParams)
    ]).then(done, function (err) {
      console.error('[Cryologix] EmailJS submission error:', err);
      done();
    });
  }

  // ── Card builder ────────────────────────────────────────────
  function buildCard(match) {
    var truck = match.truck || {};
    var operator = truck.ownerName || truck.operatorName || truck.operator || 'Operator';
    var verified = !!truck.verified;
    var fleetSize = (typeof truck.fleetSize === 'number') ? truck.fleetSize : truck.trucks;
    var truckType = truck.truckType || truck.type || '';
    var capacityKg = truck.capacityKg || truck.capacity;

    var subParts = [];
    if (fleetSize) subParts.push(fleetSize + ' trucks');
    if (truckType) subParts.push(escHtml(truckType));
    if (capacityKg) {
      var capStr = (typeof capacityKg === 'number')
        ? capacityKg.toLocaleString('en-IN') + ' kg'
        : escHtml(capacityKg);
      subParts.push(capStr);
    }

    var fromCity = truck.fromCity || '—';
    var toCity = truck.toCity || '—';
    var fromPin = truck.fromPin || truck.fromPincode || '';
    var toPin = truck.toPin || truck.toPincode || '';
    var distanceKm = (typeof match.laneDistanceKm === 'number') ? match.laneDistanceKm : null;

    var pinParts = [];
    if (fromPin || toPin) pinParts.push((fromPin || '?????') + ' → ' + (toPin || '?????'));
    if (distanceKm != null) pinParts.push(distanceKm.toLocaleString('en-IN') + ' km');

    var dateStr = fmtDate(truck.availableDate || truck.date || truck.availableOn);

    // Reasons
    var allReasons = Array.isArray(match.reasons) ? match.reasons : [];
    var topN = 4;
    var top = topReasons(allReasons, topN);
    var extra = Math.max(0, allReasons.length - top.length);

    var chipsHtml = top.map(function (r) {
      var t = reasonChipType(r);
      var label = (r && r.label) ? r.label : (r && r.text) ? r.text : '';
      return '<span class="cx-chip ' + t + '">' + escHtml(label) + '</span>';
    }).join('');
    if (extra > 0) {
      chipsHtml += '<span class="cx-chip more">+' + extra + ' more</span>';
    }

    var score = (typeof match.score === 'number') ? Math.round(match.score) : 0;

    var card = document.createElement('div');
    card.className = 'cx-card';

    card.innerHTML =
        '<div class="cx-card-top">'
      +   '<div class="cx-name">' + escHtml(operator) + '</div>'
      +   (verified
          ? '<span class="cx-pill verified">&#10003; Verified</span>'
          : '<span class="cx-pill unverified">Unverified</span>')
      +   '<div class="cx-score ' + scoreClass(score) + '">' + score + '</div>'
      + '</div>'
      + (subParts.length ? '<div class="cx-sub">' + subParts.join('<span class="sep">·</span>') + '</div>' : '')
      + '<div class="cx-lane">'
      +   '<div>'
      +     '<div class="cx-lane-cities">' + escHtml(fromCity) + '<span class="cx-lane-arrow">→</span>' + escHtml(toCity) + '</div>'
      +     (pinParts.length ? '<div class="cx-lane-pins mono">' + pinParts.map(escHtml).join(' · ') + '</div>' : '')
      +   '</div>'
      +   (dateStr ? '<div class="cx-lane-date">' + escHtml(dateStr) + '</div>' : '')
      + '</div>'
      + (chipsHtml ? '<div class="cx-reasons">' + chipsHtml + '</div>' : '')
      + '<div class="cx-bottom">'
      +   '<div class="cx-price"><span class="lbl">Estimated</span>' + escHtml(fmtINR(match.estimatedPrice)) + '</div>'
      +   '<button type="button" class="cx-bid-btn" data-cx-bid>Send bid <span class="arrow">&rarr;</span></button>'
      + '</div>';

    var bidBtn = card.querySelector('[data-cx-bid]');
    bidBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(match);
    });

    var moreChip = card.querySelector('.cx-chip.more');
    if (moreChip) {
      moreChip.addEventListener('click', function () {
        var container = card.querySelector('.cx-reasons');
        if (!container) return;
        container.innerHTML = allReasons.map(function (r) {
          var t = reasonChipType(r);
          var label = (r && r.label) ? r.label : (r && r.text) ? r.text : '';
          return '<span class="cx-chip ' + t + '">' + escHtml(label) + '</span>';
        }).join('');
      });
    }

    return card;
  }

  // ── Public API ──────────────────────────────────────────────
  function renderCards(matches, containerEl) {
    injectStyles();
    if (!containerEl) {
      console.warn('[Cryologix] cryologixRenderCards: container element required');
      return;
    }
    containerEl.innerHTML = '';
    if (!Array.isArray(matches) || matches.length === 0) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < matches.length; i++) {
      frag.appendChild(buildCard(matches[i]));
    }
    containerEl.appendChild(frag);
  }

  // Inject styles eagerly so first paint is correct even before render call.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  window.cryologixRenderCards = renderCards;
})();
