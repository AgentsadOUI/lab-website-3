(function () {
  const PAGE_ORDER = ['index.html', 'research.html', 'members.html', 'member.html', 'publications.html', 'contact.html'];

  function pageIndex(href) {
    const name = href.split('/').pop().split('?')[0] || 'index.html';
    const idx = PAGE_ORDER.indexOf(name);
    return idx === -1 ? 0 : idx;
  }

  const currentIndex = pageIndex(location.pathname.split('/').pop() || 'index.html');

  if (!document.startViewTransition) return;

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    link.addEventListener('click', function (e) {
      const targetIndex = pageIndex(href);
      const dir = targetIndex >= currentIndex ? 1 : -1;
      document.documentElement.dataset.navDir = dir;
      setTimeout(() => { delete document.documentElement.dataset.navDir; }, 600);
    });
  });
})();
