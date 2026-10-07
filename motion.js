(function () {
  const main = document.querySelector('main');
  if (!main) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const textSelector = 'h1, h2, .eyebrow, p';
  const sections = main.querySelectorAll('section:not(.final-cta)');

  sections.forEach((section, index) => {
    section.classList.add('motion-background');
    section.style.setProperty('--background-delay', `${index * -1.4}s`);
  });

  if (reducedMotion) return;

  const targets = new Set();
  let motionOrder = 0;

  function prepareTargets(root) {
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (root.matches(textSelector) && !root.hasAttribute('data-motion-ready')) targets.add(root);
    root.querySelectorAll(textSelector).forEach((target) => {
      if (!target.hasAttribute('data-motion-ready')) targets.add(target);
    });

    targets.forEach((target) => {
      target.setAttribute('data-motion-ready', '');
      target.classList.add('motion-reveal');
      target.style.setProperty('--motion-order', String(motionOrder % 5));
      motionOrder += 1;
      if (observer) observer.observe(target);
    });
    targets.clear();
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' })
    : null;

  prepareTargets(main);
  document.body.classList.add('motion-ready');

  if (!observer) {
    main.querySelectorAll('.motion-reveal').forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(prepareTargets);
    });
  });
  mutationObserver.observe(main, { childList: true, subtree: true });
})();