(function () {
  const data = window.HamperData;
  const ui = window.HamperUI;
  const dialog = document.querySelector('#site-dialog');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogCopy = document.querySelector('#dialog-copy');
  const header = document.querySelector('#site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-navigation');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelector('#category-grid').innerHTML = data.categories.map(ui.categoryCard).join('');
  document.querySelector('#product-grid').innerHTML = data.products.map(ui.productCard).join('');
  document.querySelector('#feature-grid').innerHTML = data.features.map(ui.featureCard).join('');
  document.querySelector('#process-list').innerHTML = data.steps.map(ui.processStep).join('');
  document.querySelector('#occasion-track').innerHTML = data.occasions.map(ui.occasionCard).join('');
  document.querySelector('#testimonial-grid').innerHTML = data.testimonials.map(ui.testimonialCard).join('');

  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    navigation.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  function openDialog(title, copy) {
    dialogTitle.textContent = title;
    dialogCopy.textContent = copy;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-dialog], [data-action]');
    if (!trigger) return;

    if (trigger.dataset.dialog) {
      const type = trigger.dataset.dialog;
      const title = trigger.dataset.title || (type === 'custom' ? 'Make it personal.' : 'A little more soon.');
      const copy = type === 'custom'
        ? 'Our custom hamper builder is coming soon. We’re getting the finishing touches just right.'
        : 'This page is being prepared and will be available soon.';
      openDialog(title, copy);
      return;
    }

    const product = data.products.find((item) => item.id === trigger.dataset.productId);
    if (!product) return;
    const isOrder = trigger.dataset.action === 'order';
    openDialog(isOrder ? 'Orders are coming soon.' : product.name, isOrder
      ? `Ordering “${product.name}” is not available yet. Product details and checkout will be added when our catalogue opens.`
      : `${product.description} ${product.size} hamper. ${product.price}. Catalogue details are a preview for now.`);
  });

  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  document.querySelector('.dialog-action').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }
})();
