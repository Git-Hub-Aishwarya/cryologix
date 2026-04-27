/* Cryologix — Supabase-backed auth
   ──────────────────────────────────────────────────
   Real backend: cross-device, cross-browser sessions persist via Supabase.
   Loads on every page; updates nav based on current session. */
(function () {
  'use strict';

  // ── Supabase client config (publishable key — safe in client code) ──────
  var SUPABASE_URL = 'https://raemjvffecnivgarrjzx.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_yT_5CgsXUUOdKCetgXpx3g_6ONMVP7N';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Cryologix] Supabase SDK not loaded — load the SDK <script> before auth.js.');
    return;
  }

  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var cachedUser = null;

  // Flatten Supabase user object into the shape the rest of the app expects.
  function flatten(u) {
    if (!u) return null;
    var md = u.user_metadata || {};
    return {
      id: u.id,
      email: u.email,
      name: md.name || '',
      phone: md.phone || '',
      role: md.role || '',
      createdAt: u.created_at
    };
  }

  // ── Public API ──────────────────────────────────────────────────────────
  window.cryAuth = {
    client: sb,

    // Synchronous read of the cached current user. Returns null if not yet
    // hydrated (briefly on first ms after page load). Fine for nav + bid pre-fill.
    get: function () { return cachedUser; },

    // Always-fresh async read of current user from Supabase.
    getAsync: function () {
      return sb.auth.getUser().then(function (res) {
        cachedUser = (res.error || !res.data) ? null : flatten(res.data.user);
        return cachedUser;
      });
    },

    signUp: function (input) {
      input = input || {};
      return sb.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name || '',
            phone: input.phone || '',
            role: input.role || ''
          }
        }
      }).then(function (res) {
        if (res.error) throw res.error;
        cachedUser = flatten(res.data.user);
        return cachedUser;
      });
    },

    signIn: function (input) {
      input = input || {};
      return sb.auth.signInWithPassword({
        email: input.email,
        password: input.password
      }).then(function (res) {
        if (res.error) throw res.error;
        cachedUser = flatten(res.data.user);
        return cachedUser;
      });
    },

    signOut: function () {
      return sb.auth.signOut().then(function () {
        cachedUser = null;
      });
    }
  };

  // ── Hydrate on load + subscribe to auth changes ────────────────────────
  sb.auth.getUser().then(function (res) {
    cachedUser = (res.error || !res.data) ? null : flatten(res.data.user);
    updateNav();
  });

  sb.auth.onAuthStateChange(function (event, session) {
    cachedUser = session && session.user ? flatten(session.user) : null;
    updateNav();
  });

  // ── Nav state updater ──────────────────────────────────────────────────
  function firstName(name) {
    if (!name) return '';
    return String(name).trim().split(/\s+/)[0];
  }

  function updateNav() {
    var navCta = document.querySelector('[data-cry-auth-cta]');
    if (!navCta) return;

    if (cachedUser && cachedUser.email) {
      var fn = firstName(cachedUser.name) || cachedUser.email.split('@')[0];
      navCta.textContent = 'Hi, ' + fn;
      navCta.setAttribute('href', '#');
      navCta.removeAttribute('data-access-trigger');
      navCta.setAttribute('data-cry-logout', 'true');
      navCta.title = 'Click to log out';
    } else {
      navCta.textContent = 'Sign up';
      navCta.setAttribute('href', '/signup.html');
      navCta.removeAttribute('data-access-trigger');
      navCta.removeAttribute('data-cry-logout');
      navCta.title = '';
    }
  }

  // ── Logout click binding ──────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('[data-cry-logout]');
    if (!t) return;
    e.preventDefault();
    if (confirm('Log out of Cryologix?')) {
      window.cryAuth.signOut();
    }
  });

  // ── Defensive: ensure Blog link exists in any page's .nav-links ─────────
  // Inserts Blog *before* Roadmap (or appends if Roadmap is missing).
  function ensureBlogInNav() {
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    var hasBlog = Array.prototype.some.call(navLinks.children, function (el) {
      return el.tagName === 'A' && /\bblog\b/i.test(el.textContent || '');
    });
    if (hasBlog) return;

    var blogLink = document.createElement('a');
    blogLink.href = '/#blog';
    blogLink.textContent = 'Blog';

    // Find Roadmap link and insert Blog before it if present
    var roadmapLink = null;
    var children = navLinks.children;
    for (var i = 0; i < children.length; i++) {
      if (children[i].tagName === 'A' && /\broadmap\b/i.test(children[i].textContent || '')) {
        roadmapLink = children[i];
        break;
      }
    }

    if (roadmapLink) {
      navLinks.insertBefore(blogLink, roadmapLink);
    } else {
      navLinks.appendChild(blogLink);
    }
  }

  // ── Defensive: ensure standard footer exists on every page ───────────────
  function ensureFooter() {
    // Skip if any <footer> already exists (index.html, match.html have one)
    if (document.querySelector('footer')) return;

    var container = document.querySelector('.container') || document.body;
    if (!container) return;

    // Inject footer styles once
    if (!document.getElementById('cry-footer-css')) {
      var style = document.createElement('style');
      style.id = 'cry-footer-css';
      style.textContent =
        'footer.cry-footer{' +
          'padding:18px 0 22px;' +
          'border-top:1px solid var(--line, #e7e8ec);' +
          'display:flex;justify-content:center;' +
          'color:var(--ink-mute, #8b93a4);font-size:13px;' +
          'flex-wrap:wrap;gap:12px;letter-spacing:-0.005em;' +
        '}';
      document.head.appendChild(style);
    }

    var footer = document.createElement('footer');
    footer.className = 'cry-footer';
    footer.innerHTML = '<span>&copy; ' + new Date().getFullYear() + ' Cryologix</span>';
    container.appendChild(footer);
  }

  // First nav paint (in case cache hydration is slower than DOM ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateNav();
      ensureBlogInNav();
      ensureFooter();
    });
  } else {
    updateNav();
    ensureBlogInNav();
    ensureFooter();
  }
})();
