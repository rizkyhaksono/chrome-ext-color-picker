(function() {
  'use strict';
  var result = [];
  var seen = {};

  function add(name, category) {
    var key = name + '|' + category;
    if (!seen[key]) {
      seen[key] = true;
      result.push({ name: name, category: category });
    }
  }

  try {
    if (typeof window === 'undefined') return result;

    // Framework / Library (window globals)
    if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) add('React', 'Framework');
    if (window.Vue || window.__VUE__) add('Vue.js', 'Framework');
    if (window.angular || window.ng) add('Angular', 'Framework');
    if (window.jQuery || window.$) add('jQuery', 'Library');
    if (window.__NEXT_DATA__) add('Next.js', 'Framework');
    if (window.__NUXT__ || window.__NUXT_INIT__) add('Nuxt', 'Framework');
    if (window.__svelte || window.__svelte_meta) add('Svelte', 'Framework');
    if (window.Ember || window.Em) add('Ember', 'Framework');
    if (window.Backbone) add('Backbone', 'Library');
    if (window.Preact) add('Preact', 'Framework');
    if (window.Alpine) add('Alpine.js', 'Framework');
    if (window.ht && window.ht.graph3d) add('HT for Web', 'Library');
    if (window.__VITE__) add('Vite', 'Build');

    // Meta generator (CMS etc.)
    var generator = document.querySelector('meta[name="generator"]');
    if (generator && generator.content) {
      var c = generator.content.toLowerCase();
      if (c.indexOf('wordpress') !== -1) add('WordPress', 'CMS');
      if (c.indexOf('drupal') !== -1) add('Drupal', 'CMS');
      if (c.indexOf('joomla') !== -1) add('Joomla', 'CMS');
      if (c.indexOf('wix') !== -1) add('Wix', 'CMS');
      if (c.indexOf('squarespace') !== -1) add('Squarespace', 'CMS');
      if (c.indexOf('ghost') !== -1) add('Ghost', 'CMS');
    }

    // Script src patterns
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = (scripts[i].src || '').toLowerCase();
      if (!src) continue;
      if (src.indexOf('wp-content') !== -1 || src.indexOf('wp-includes') !== -1) add('WordPress', 'CMS');
      if (src.indexOf('bootstrap') !== -1) add('Bootstrap', 'UI');
      if (src.indexOf('tailwind') !== -1) add('Tailwind CSS', 'UI');
      if (src.indexOf('bulma') !== -1) add('Bulma', 'UI');
      if (src.indexOf('foundation') !== -1) add('Foundation', 'UI');
      if (src.indexOf('gtag') !== -1 || src.indexOf('googletagmanager') !== -1) add('Google Tag Manager', 'Analytics');
      if (src.indexOf('google-analytics') !== -1 || src.indexOf('analytics.js') !== -1 || src.indexOf('ga.js') !== -1) add('Google Analytics', 'Analytics');
      if (src.indexOf('gtm.js') !== -1) add('Google Tag Manager', 'Analytics');
      if (src.indexOf('segment') !== -1) add('Segment', 'Analytics');
      if (src.indexOf('hotjar') !== -1) add('Hotjar', 'Analytics');
      if (src.indexOf('facebook.net') !== -1 && src.indexOf('fbevents') !== -1) add('Facebook Pixel', 'Analytics');
    }

    // Link href (styles / preload)
    var links = document.querySelectorAll('link[href]');
    for (var j = 0; j < links.length; j++) {
      var href = (links[j].href || '').toLowerCase();
      if (href.indexOf('bootstrap') !== -1) add('Bootstrap', 'UI');
      if (href.indexOf('tailwind') !== -1) add('Tailwind CSS', 'UI');
      if (href.indexOf('bulma') !== -1) add('Bulma', 'UI');
      if (href.indexOf('wp-content') !== -1) add('WordPress', 'CMS');
    }

    // DOM hints (e.g. data attributes, class names)
    var html = document.documentElement;
    var htmlClass = (html.className || '').toLowerCase();
    var htmlStr = html.outerHTML ? html.outerHTML.substring(0, 5000) : '';
    if (htmlClass.indexOf('no-js') !== -1) add('No-JS fallback', 'Other');
    if (htmlStr.indexOf('data-reactroot') !== -1 || htmlStr.indexOf('data-reactid') !== -1) add('React', 'Framework');
    if (htmlStr.indexOf('ng-version') !== -1 || htmlStr.indexOf('ng-app') !== -1) add('Angular', 'Framework');
    if (htmlStr.indexOf('v-cloak') !== -1 || htmlStr.indexOf('data-v-') !== -1) add('Vue.js', 'Framework');
  } catch (e) {
    // ignore
  }

  return result;
})();
