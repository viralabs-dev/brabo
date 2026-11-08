/* Menu móvel, alternar tema, seletores de idioma/degrau, Mermaid nas cores do tema. A busca é da lane A4. */
(function () {
  var d = document;
  d.querySelectorAll('[data-seletor]').forEach(function (s) {
    s.addEventListener('change', function () { window.location.href = s.value; });
  });
  var menu = d.querySelector('[data-menu-alternar]');
  if (menu) menu.addEventListener('click', function () { d.body.classList.toggle('menu-aberto'); });
  function mermaidTema() {
    if (!window.mermaid) return;
    var cs = getComputedStyle(d.documentElement);
    var v = function (n) { return cs.getPropertyValue(n).trim(); };
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        background: v('--surface-0'), primaryColor: v('--surface-2'), primaryTextColor: v('--text-primary'),
        primaryBorderColor: v('--border-strong'), lineColor: v('--text-secondary'), fontFamily: v('--font-body'),
        secondaryColor: v('--surface-1'), tertiaryColor: v('--surface-1'), clusterBkg: v('--surface-1'), clusterBorder: v('--border'),
        edgeLabelBackground: v('--surface-0'), nodeTextColor: v('--text-primary'), titleColor: v('--text-primary'),
      },
    });
    d.querySelectorAll('[data-mermaid]').forEach(function (el) {
      if (!el.dataset.fonte) el.dataset.fonte = el.textContent;
      el.removeAttribute('data-processed');
      el.textContent = el.dataset.fonte;
    });
    window.mermaid.run({ querySelector: '[data-mermaid]' });
  }
  var alt = d.querySelector('[data-tema-alternar]');
  if (alt) alt.addEventListener('click', function () {
    var novo = d.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    d.documentElement.setAttribute('data-theme', novo);
    d.documentElement.classList.toggle('dark', novo === 'dark');
    try { window.localStorage.setItem('brabo.docs.theme', novo); } catch (e) {}
    mermaidTema();
  });
  // Abas (:::abas): sem JS as seções ficam empilhadas, com o rótulo de cada uma.
  d.querySelectorAll('[data-abas]').forEach(function (grupo, g) {
    var abas = Array.prototype.slice.call(grupo.querySelectorAll(':scope > .aba'));
    var lista = d.createElement('div');
    lista.className = 'abas-lista';
    lista.setAttribute('role', 'tablist');
    var botoes = abas.map(function (aba, i) {
      var b = d.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.id = 'aba-' + g + '-' + i;
      b.textContent = aba.dataset.aba;
      aba.setAttribute('role', 'tabpanel');
      aba.setAttribute('aria-labelledby', b.id);
      b.addEventListener('click', function () { abrir(i); });
      b.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
        if (n < 0) return;
        abrir((n + abas.length) % abas.length);
        botoes[(n + abas.length) % abas.length].focus();
      });
      lista.appendChild(b);
      return b;
    });
    function abrir(i) {
      abas.forEach(function (aba, k) {
        aba.hidden = k !== i;
        botoes[k].setAttribute('aria-selected', String(k === i));
        botoes[k].tabIndex = k === i ? 0 : -1;
      });
    }
    grupo.insertBefore(lista, grupo.firstChild);
    grupo.classList.add('abas-js');
    abrir(0);
  });
  mermaidTema();
})();
