(function () {
  const data = window.HamperBuilderData;
  const ui = window.BuilderUI;
  const auth = window.JustHampersAuth;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const state = {
    step: 1,
    boxId: null,
    budgetId: null,
    products: {},
    category: 'all',
    recipientName: '',
    giftMessage: '',
    logo: null,
    ribbonId: 'gold',
    customRibbonColor: '#c69b4c',
    boxColorId: 'ivory',
    checkout: { customerName: '', email: '', phone: '', recipientPhone: '', address: '', city: '', region: '', instructions: '' },
    preferredPaymentMethod: null
  };

  function applyAiRecommendationParams() {
    const params = new URLSearchParams(window.location.search);
    const aiBox = params.get('ai-box');
    const aiBudget = params.get('ai-budget');
    const aiProducts = params.get('ai-products');
    const aiRecipient = params.get('ai-recipient');

    if (aiBox && data.boxes.some((box) => box.id === aiBox)) state.boxId = aiBox;
    if (aiRecipient) state.recipientName = aiRecipient;

    if (aiBudget) {
      const parsedBudget = Number(String(aiBudget).replace(/[^\d]/g, ''));
      if (Number.isFinite(parsedBudget)) {
        const unlimitedBudget = data.budgets.find((budget) => budget.limit === null && parsedBudget >= Number(budget.id));
        const match = unlimitedBudget || data.budgets
          .filter((budget) => budget.limit !== null)
          .sort((a, b) => Math.abs(a.limit - parsedBudget) - Math.abs(b.limit - parsedBudget))[0];
        if (match) state.budgetId = match.id;
      }
    }

    if (aiProducts) {
      const ids = aiProducts.split(',').map((item) => item.trim()).filter(Boolean);
      ids.forEach((id) => {
        const product = data.products.find((entry) => entry.id === id);
        if (product) state.products[product.id] = 1;
      });
    }
  }

  applyAiRecommendationParams();

  document.addEventListener('justHampers:auth-change', () => {
    if (state.step >= 5) {
      renderStep(false);
    }
  });

  const steps = [
    { label: 'Box', title: 'Choose your box' }, { label: 'Budget', title: 'Choose your budget' },
    { label: 'Products', title: 'Choose your products' }, { label: 'Personalise', title: 'Add your personal touch' },
    { label: 'Preview', title: 'Your hamper preview' }, { label: 'Checkout', title: 'Delivery details' }
  ];
  const stepList = document.querySelector('#step-list');
  const stepContent = document.querySelector('#step-content');
  const errorMessage = document.querySelector('#builder-error');
  const backButton = document.querySelector('#back-button');
  const nextButton = document.querySelector('#next-button');
  const summaryContent = document.querySelector('#summary-content');
  const summaryPanel = document.querySelector('.summary-panel');
  const summaryToggle = document.querySelector('#summary-toggle');

  function currentBox() {
    return data.boxes.find((box) => box.id === state.boxId) || null;
  }

  function currentBudget() {
    return data.budgets.find((budget) => budget.id === state.budgetId) || null;
  }

  function productCount() {
    return Object.values(state.products).reduce((total, quantity) => total + quantity, 0);
  }

  function selectedProducts() {
    return data.products.filter((product) => state.products[product.id] > 0);
  }

  function estimate() {
    return (currentBox()?.basePrice || 0) + selectedProducts().reduce((total, product) => total + product.price * state.products[product.id], 0);
  }

  function formatPrice(amount) {
    return ui.formatPrice(amount);
  }

  function getBoxColor() {
    const colors = currentBox()?.colors || [];
    return data.boxColors.find((color) => color.id === state.boxColorId && colors.includes(color.id)) || data.boxColors.find((color) => colors.includes(color.id)) || data.boxColors[0];
  }

  function getRibbonColor() {
    if (state.ribbonId === 'custom') return { label: 'Custom', color: state.customRibbonColor };
    return data.ribbons.find((ribbon) => ribbon.id === state.ribbonId) || data.ribbons[0];
  }

  function totalWarning() {
    const budget = currentBudget();
    return budget && budget.limit !== null && estimate() > budget.limit;
  }

  function hasUnavailableBudgetProducts() {
    return selectedProducts().some((product) => !availableForBudget(product));
  }

  function availableForBudget(product) {
    const budget = currentBudget();
    if (!budget) return true;
    const minimumBudget = Number(product.minimumBudget);
    return minimumBudget <= Number(budget.id) && (budget.productCeiling === null || product.price <= budget.productCeiling);
  }

  function hamperArt(compact) {
    const box = currentBox();
    const boxColor = getBoxColor();
    const ribbon = getRibbonColor();
    const products = selectedProducts();
    const recipient = state.recipientName.trim();
    return `<div class="hamper-art ${compact ? 'is-compact' : ''}" style="--box-shade:${boxColor.color};--ribbon-shade:${ribbon.color}"><span class="art-overline">A JUST HAMPERS ORIGINAL</span><div class="illustrated-box" aria-hidden="true"><div class="illustrated-lid"></div><div class="illustrated-body"></div><div class="illustrated-ribbon-v"></div><div class="illustrated-ribbon-h"></div><div class="illustrated-bow bow-left"></div><div class="illustrated-bow bow-right"></div>${state.logo?.dataUrl ? `<img class="preview-logo" src="${state.logo.dataUrl}" alt="Corporate logo preview">` : '<span class="box-monogram" aria-hidden="true">JH</span>'}</div><p class="preview-recipient">${recipient ? `Made just for <strong>${escapeHtml(recipient)}</strong>` : 'A little joy, all wrapped up.'}</p><div class="preview-items" aria-label="Selected products">${products.length ? products.map((product) => `<span class="preview-item" title="${escapeHtml(product.name)} × ${state.products[product.id]}"><img src="${escapeHtml(product.image)}" alt=""><small>${escapeHtml(product.name)} × ${state.products[product.id]}</small></span>`).join('') : '<span class="preview-empty">Your lovely finds will appear here.</span>'}</div><p class="preview-message">${state.giftMessage.trim() ? `“${escapeHtml(state.giftMessage.trim())}”` : 'Add a message to make it even more personal.'}</p><span class="preview-box-label">${escapeHtml(box?.name || 'Your box')} · ${escapeHtml(ribbon.label)} ribbon</span></div>`;
  }

  function renderStepNavigation() {
    stepList.innerHTML = steps.map((step, index) => {
      const number = index + 1;
      const completed = number < state.step;
      const current = number === state.step;
      return `<li class="progress-step ${current ? 'is-current' : ''} ${completed ? 'is-complete' : ''}"><button type="button" data-jump-step="${number}" ${number > state.step ? 'disabled' : ''} ${current ? 'aria-current="step"' : ''} aria-label="Step ${number}: ${escapeHtml(step.label)}${completed ? ', completed' : current ? ', current step' : ''}"><span class="progress-step-number">${completed ? '✓' : String(number).padStart(2, '0')}</span><span class="progress-step-label">${escapeHtml(step.label)}</span></button></li>`;
    }).join('');
    document.querySelector('#progress-fill').style.width = `${((state.step - 1) / (steps.length - 1)) * 100}%`;
    document.querySelector('.step-progress').setAttribute('aria-label', `Step ${state.step} of ${steps.length}: ${steps[state.step - 1].label}`);
  }

  function renderSummary() {
    const box = currentBox();
    const budget = currentBudget();
    const count = productCount();
    const capacity = box?.capacity || 0;
    const products = ui.summaryProducts(data.products, state);
    const warning = totalWarning() || hasUnavailableBudgetProducts();
    summaryContent.innerHTML = `<div class="summary-heading"><div><p class="eyebrow">The lovely little details</p><h2>Your Hamper</h2></div><span class="summary-spark" aria-hidden="true">✳</span></div><div class="summary-pair"><span>Box</span><strong>${box ? escapeHtml(box.name) : 'Choose a box'}</strong></div><div class="summary-pair"><span>Budget</span><strong>${budget ? escapeHtml(budget.label) : 'Choose a budget'}</strong></div><div class="summary-products-heading"><span>Products</span><span>${count} / ${capacity || '—'}</span></div><ul class="summary-product-list">${products || '<li class="summary-empty">Your picks will appear here.</li>'}</ul><div class="summary-total"><span>Estimated total</span><strong>${box ? formatPrice(estimate()) : '—'}</strong></div><div class="summary-pair remaining-budget"><span>Remaining budget</span><strong>${!budget ? '—' : budget.limit === null ? 'No set limit' : formatPrice(Math.max(0, budget.limit - estimate()))}</strong></div>${warning ? '<p class="budget-warning"><span aria-hidden="true">!</span> Over your selected budget. Adjust your picks to continue.</p>' : ''}<p class="summary-pricing-note">Illustrative estimate only · delivery quoted separately</p><p class="summary-live-status" id="summary-live-status" role="status" aria-live="polite"></p>`;
    document.querySelector('#mobile-summary-subtitle').textContent = `${count} ${count === 1 ? 'item' : 'items'} · ${box ? box.name : 'choose a box'}`;
    document.querySelector('#mobile-summary-total').textContent = box ? formatPrice(estimate()) : '—';
  }

  function renderBoxStep() {
    return `<div class="step-heading"><p class="eyebrow">Step 01 · The foundation</p><h2 id="step-title" tabindex="-1">Choose your <em>box.</em></h2><p>Start with a size that feels right. You can fit approximately this many products in each box.</p></div><div class="box-choice-grid">${data.boxes.map((box) => ui.boxCard(box, state.boxId === box.id)).join('')}</div><p class="step-footnote">Box estimates and capacity are placeholders for this preview.</p>`;
  }

  function renderBudgetStep() {
    return `<div class="step-heading"><p class="eyebrow">Step 02 · Set a guide</p><h2 id="step-title" tabindex="-1">Choose your <em>budget.</em></h2><p>Your budget helps us suggest a thoughtful mix of products. It includes the box and product estimates; delivery is quoted separately.</p></div><div class="budget-choice-grid">${data.budgets.map((budget) => ui.budgetCard(budget, state.budgetId === budget.id)).join('')}</div>${totalWarning() ? '<p class="inline-warning"><span aria-hidden="true">!</span> Your current selection is above this budget. You can adjust products in the next step.</p>' : ''}<div class="budget-note"><span aria-hidden="true">✳</span><p>Choose a starting point, not a compromise. You can explore products next, and we’ll keep the estimate in view.</p></div>`;
  }

  function renderProductsStep() {
    const budget = currentBudget();
    const box = currentBox();
    const full = box && productCount() >= box.capacity;
    const filtered = data.products.filter((product) => state.category === 'all' || product.category === state.category);
    return `<div class="step-heading"><p class="eyebrow">Step 03 · The good things</p><h2 id="step-title" tabindex="-1">Choose your <em>products.</em></h2><p>Pick the things they’ll love. Add more than your box holds? We’ll let you know before you continue.</p></div><div class="product-picker-meta"><span class="picker-budget"><span aria-hidden="true">₦</span> Curated for ${escapeHtml(budget?.label || 'your budget')}</span><span>${productCount()} of ${box?.capacity || '—'} spaces filled</span></div><div class="product-filters" role="group" aria-label="Filter products by category">${data.categories.map((category) => ui.categoryFilter(category, state.category === category.id)).join('')}</div><div class="builder-product-grid">${filtered.map((product) => ui.productCard(product, state.products[product.id] || 0, !availableForBudget(product), Boolean(full))).join('')}</div><p class="step-footnote">Product and box prices are illustrative estimates only. Final prices and stock are not connected.</p>`;
  }

  function renderPersonaliseStep() {
    const box = currentBox();
    const colors = data.boxColors.filter((color) => box?.colors.includes(color.id));
    return `<div class="step-heading"><p class="eyebrow">Step 04 · Make it theirs</p><h2 id="step-title" tabindex="-1">Add your personal <em>touch.</em></h2><p>A name, a few heartfelt words and the finishing details make this gift feel like it could only be from you.</p></div><div class="personalise-layout"><div class="personalise-fields"><label class="field-label" for="recipient-name">Recipient’s name <span>Required</span><input id="recipient-name" name="recipientName" data-field="recipientName" autocomplete="off" maxlength="80" placeholder="e.g. Sarah" value="${escapeHtml(state.recipientName)}" required></label><label class="field-label" for="gift-message">Gift message <span>Optional</span><textarea id="gift-message" name="giftMessage" data-field="giftMessage" maxlength="280" rows="4" placeholder="Happy Birthday! Wishing you an amazing year ahead.">${escapeHtml(state.giftMessage)}</textarea><small class="character-count"><span id="message-count">${state.giftMessage.length}</span> / 280 characters</small></label><fieldset class="option-fieldset"><legend>Ribbon colour</legend><div class="swatch-list">${data.ribbons.map((ribbon) => ui.colorOption(ribbon, state.ribbonId === ribbon.id, 'ribbon')).join('')}</div>${state.ribbonId === 'custom' ? '<label class="custom-color-field" for="custom-ribbon-color">Choose a custom ribbon colour<input id="custom-ribbon-color" type="color" data-field="customRibbonColor" value="' + escapeHtml(state.customRibbonColor) + '"></label>' : ''}</fieldset><fieldset class="option-fieldset"><legend>Box colour <small>Available for this box</small></legend><div class="swatch-list">${colors.map((color) => ui.colorOption(color, getBoxColor().id === color.id, 'box-color')).join('')}</div></fieldset><fieldset class="option-fieldset logo-fieldset"><legend>Corporate logo <small>Optional</small></legend><label class="upload-control" for="corporate-logo"><span class="upload-icon" aria-hidden="true">↑</span><span><strong>${state.logo ? escapeHtml(state.logo.name) : 'Add a logo'}</strong><small>PNG, JPG or WebP · up to 3 MB</small></span><input id="corporate-logo" type="file" accept="image/png,image/jpeg,image/webp"></label>${state.logo ? `<div class="logo-preview"><img src="${state.logo.dataUrl}" alt="Preview of uploaded corporate logo"><span>${escapeHtml(state.logo.name)}</span><button type="button" data-remove-logo>Remove logo</button></div>` : ''}</fieldset></div><div class="personalise-live-preview"><span class="preview-caption">YOUR GIFT, TAKING SHAPE</span>${hamperArt(true)}</div></div>`;
  }

  function renderPreviewStep() {
    const products = selectedProducts();
    const box = currentBox();
    const ribbon = getRibbonColor();
    const boxColor = getBoxColor();
    return `<div class="step-heading"><p class="eyebrow">Step 05 · Just as you imagined</p><h2 id="step-title" tabindex="-1">Your hamper <em>preview.</em></h2><p>One last look at the thoughtful little world you’ve put together.</p></div><div class="full-preview-layout"><div class="preview-showcase">${hamperArt(false)}<span class="preview-disclaimer">A digital concept preview. Final packaging may vary.</span></div><div class="preview-review"><span class="preview-caption">THE DETAILS</span><h3>Made with thought.</h3><dl><div><dt>Box</dt><dd>${escapeHtml(box?.name || '—')} · ${escapeHtml(boxColor.label)}</dd></div><div><dt>Products <span>(${productCount()} / ${box?.capacity || '—'})</span></dt><dd>${products.length ? products.map((product) => `${escapeHtml(product.name)} × ${state.products[product.id]}`).join('<br>') : 'No products yet'}</dd></div><div><dt>Ribbon</dt><dd>${escapeHtml(ribbon.label)}</dd></div><div><dt>For</dt><dd>${escapeHtml(state.recipientName || '—')}</dd></div><div><dt>Message</dt><dd>${state.giftMessage.trim() ? `“${escapeHtml(state.giftMessage.trim())}”` : 'No message added'}</dd></div><div><dt>Corporate logo</dt><dd>${state.logo ? 'Added' : 'Not added'}</dd></div></dl><div class="preview-total"><span>Estimated hamper total</span><strong>${formatPrice(estimate())}</strong></div><p class="delivery-quote-note">Delivery is not included and will need to be quoted before payment.</p><button class="edit-hamper-link" type="button" data-jump-step="1"><span aria-hidden="true">←</span> Edit hamper</button></div></div>`;
  }

  function checkoutInput(name, label, type, placeholder, required, autocomplete, value) {
    return `<label class="field-label" for="checkout-${name}">${escapeHtml(label)}${required ? ' <span>Required</span>' : ''}<input id="checkout-${name}" name="${escapeHtml(name)}" data-field="checkout.${escapeHtml(name)}" type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" autocomplete="${escapeHtml(autocomplete)}" value="${escapeHtml(value || '')}" ${required ? 'required' : ''}></label>`;
  }

  function renderCheckoutStep() {
    const products = selectedProducts();
    const box = currentBox();
    const paymentErrorId = 'payment-feedback';
    return `<div class="step-heading"><p class="eyebrow">Step 06 · The practical bits</p><h2 id="step-title" tabindex="-1">Delivery <em>details.</em></h2><p>Share the details needed to prepare a draft order. No order is submitted and no payment is taken in this preview.</p></div><form class="checkout-form" id="checkout-form" novalidate><div class="checkout-fields"><fieldset class="checkout-fieldset"><legend>Your details</legend>${checkoutInput('customerName', 'Full name', 'text', 'Your full name', true, 'name', state.checkout.customerName)}${checkoutInput('email', 'Email address', 'email', 'you@example.com', true, 'email', state.checkout.email)}${checkoutInput('phone', 'Phone number', 'tel', '+234 ...', true, 'tel', state.checkout.phone)}</fieldset><fieldset class="checkout-fieldset"><legend>Recipient</legend>${checkoutInput('recipientName', 'Recipient’s name', 'text', 'Who is this for?', true, 'off', state.recipientName)}${checkoutInput('recipientPhone', 'Recipient’s phone', 'tel', '+234 ...', true, 'tel', state.checkout.recipientPhone)}</fieldset><fieldset class="checkout-fieldset delivery-fields"><legend>Delivery</legend><label class="field-label" for="checkout-address">Delivery address <span>Required</span><textarea id="checkout-address" name="address" data-field="checkout.address" rows="2" autocomplete="street-address" placeholder="Street address" required>${escapeHtml(state.checkout.address)}</textarea></label><div class="field-row">${checkoutInput('city', 'City', 'text', 'City', true, 'address-level2', state.checkout.city)}${checkoutInput('region', 'State', 'text', 'State', true, 'address-level1', state.checkout.region)}</div><label class="field-label" for="checkout-instructions">Delivery instructions <span>Optional</span><textarea id="checkout-instructions" name="instructions" data-field="checkout.instructions" rows="2" placeholder="Anything helpful for delivery?">${escapeHtml(state.checkout.instructions)}</textarea></label></fieldset></div><aside class="checkout-order-summary"><p class="eyebrow">A quick recap</p><h3>Your hamper</h3><p class="checkout-box-line">${escapeHtml(box?.name || '—')} box · ${escapeHtml(state.recipientName)}</p><ul>${products.map((product) => ui.productLine(product, state.products[product.id])).join('')}</ul><div class="checkout-total-row"><span>Estimated hamper total</span><strong>${formatPrice(estimate())}</strong></div><div class="checkout-total-row delivery-estimate"><span>Delivery fee</span><strong>To be confirmed</strong></div><p class="checkout-disclaimer">A delivery quote and final product availability are required before any payment can be taken.</p><button class="button button-primary payment-button" type="button" id="payment-button">Proceed to Payment <span aria-hidden="true">→</span></button><p id="${paymentErrorId}" class="payment-feedback" role="status" aria-live="polite"></p></aside></form>`;
  }

  function setError(message) {
    if (message) errorMessage.setAttribute('tabindex', '-1');
    errorMessage.textContent = message;
  }

  function renderStep(shouldFocus = false) {
    const renderers = [renderBoxStep, renderBudgetStep, renderProductsStep, renderPersonaliseStep, renderPreviewStep, renderCheckoutStep];
    stepContent.innerHTML = renderers[state.step - 1]();
    if (state.step === 6) {
      const paymentSummary = stepContent.querySelector('.checkout-order-summary');
      const paymentButton = stepContent.querySelector('#payment-button');
      const config = window.JustHampersPaymentConfig;
      const paymentUi = window.JustHampersPaymentUI;
      const signedIn = Boolean(auth?.isSignedIn?.());
      if (!state.preferredPaymentMethod) {
        state.preferredPaymentMethod = config.methods.find((method) => method.enabled)?.id || null;
      }
      paymentSummary.querySelector('.checkout-disclaimer').insertAdjacentHTML('beforebegin', paymentUi.renderStatus('Unpaid', 'Payment status can only be updated after server-side provider verification.'));
      paymentSummary.querySelector('.payment-button').insertAdjacentHTML('beforebegin', paymentUi.renderMethods(config.methods, state.preferredPaymentMethod));
      paymentButton.innerHTML = signedIn ? `Pay ${formatPrice(estimate())} <span aria-hidden="true">→</span>` : 'Sign in to complete purchase <span aria-hidden="true">→</span>';
      const paymentApiReady = typeof window.JustHampersPaymentAPI?.createCheckoutSession === 'function';
      if (!signedIn) {
        paymentButton.disabled = false;
        paymentButton.onclick = () => {
          setError('Please sign in with Google before continuing to checkout and paying for any hamper.');
          auth?.signInWithGoogle?.();
        };
        paymentSummary.querySelector('.checkout-disclaimer').insertAdjacentHTML('afterend', '<p class="auth-gate-note"><strong>Google sign-in required.</strong> Please sign in with Google before placing any order.</p>');
      } else {
        paymentButton.disabled = !paymentApiReady || !config.provider || !config.methods.some((method) => method.enabled);
        paymentButton.onclick = async () => {
          if (!auth?.isSignedIn?.()) {
            setError('Please sign in with Google before continuing to checkout and paying for any hamper.');
            auth?.signInWithGoogle?.();
            return;
          }
          const selectedMethod = state.preferredPaymentMethod || config.methods.find((method) => method.enabled)?.id;
          const customer = state.checkout;
          const currentUser = auth?.getCurrentUser?.() || null;
          const email = (customer.email || currentUser?.email || '').trim();
          const name = (customer.customerName || currentUser?.name || 'Just Hampers customer').trim();
          const amount = Number(estimate());
          if (!email || !name || !customer.address.trim() || !customer.city.trim() || !customer.region.trim()) {
            setError('Please complete your details and delivery information before paying.');
            return;
          }
          try {
            paymentButton.disabled = true;
            paymentButton.innerHTML = 'Starting payment...';
            const result = await window.JustHampersPaymentAPI.createCheckoutSession({
              amount,
              email,
              name,
              reference: `JH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              callbackUrl: `${window.location.origin}/builder.html?payment=success`,
              metadata: {
                order: createOrderDraft(),
                paymentMethod: selectedMethod,
                customer: { name, email }
              }
            });
            if (!result?.authorizationUrl) {
              throw new Error('The payment provider did not return a checkout URL.');
            }
            window.location.href = result.authorizationUrl;
          } catch (error) {
            paymentButton.disabled = false;
            paymentButton.innerHTML = `Pay ${formatPrice(estimate())} <span aria-hidden="true">→</span>`;
            setError(error.message || 'Payment could not be started. Please try again.');
          }
        };
      }
    }
    renderStepNavigation();
    renderSummary();
    errorMessage.textContent = '';
    backButton.disabled = state.step === 1;
    nextButton.hidden = state.step === 6;
    nextButton.innerHTML = state.step === 5 ? 'Continue to checkout <span aria-hidden="true">→</span>' : 'Continue <span aria-hidden="true">→</span>';
    document.querySelector('#step-counter').textContent = `Step ${state.step} of ${steps.length}`;
    if (shouldFocus) document.querySelector('#step-title')?.focus({ preventScroll: true });
  }

  function validateStep() {
    if (state.step === 1 && !state.boxId) return 'Choose a box to continue.';
    if (state.step === 2 && !state.budgetId) return 'Choose a budget to continue.';
    if (state.step === 3) {
      if (!productCount()) return 'Choose at least one product for your hamper.';
      if (currentBox() && productCount() > currentBox().capacity) return 'Your hamper is full. Remove an item or choose a larger box.';
      if (hasUnavailableBudgetProducts()) return 'Your hamper includes products outside this budget. Remove them or choose a higher budget to continue.';
      if (totalWarning()) return 'Your selected items are above your current budget. Remove an item, choose a different product, or increase your budget.';
    }
    if (state.step === 4 && !state.recipientName.trim()) return 'Please add the recipient’s name before continuing.';
    if (state.step === 4 && hasUnavailableBudgetProducts()) return 'Your hamper includes products outside this budget. Remove them or choose a higher budget to continue.';
    if (state.step === 4 && totalWarning()) return 'Your selected items are above your current budget. Adjust your hamper before continuing.';
    return '';
  }

  function goToStep(step, shouldFocus = true) {
    if (step < 1 || step > steps.length || step > state.step) return;
    state.step = step;
    summaryPanel.classList.remove('is-expanded');
    summaryToggle.setAttribute('aria-expanded', 'false');
    renderStep(shouldFocus);
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function continueStep() {
    const message = validateStep();
    if (message) {
      setError(message);
      errorMessage.focus();
      return;
    }
    if (state.step >= 5 && !auth?.isSignedIn?.()) {
      setError('Please sign in with Google before continuing to checkout and paying for any hamper.');
      auth?.signInWithGoogle?.();
      errorMessage.focus();
      return;
    }
    state.step += 1;
    renderStep(true);
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function announceSummary(message) {
    const liveStatus = document.querySelector('#summary-live-status');
    if (liveStatus) liveStatus.textContent = message;
  }

  function renderCurrentProducts(focusControl) {
    const heading = stepContent.querySelector('#step-title');
    if (!heading) return;
    stepContent.innerHTML = renderProductsStep();
    renderSummary();
    const newHeading = stepContent.querySelector('#step-title');
    if (newHeading) newHeading.setAttribute('tabindex', '-1');
    if (focusControl) [...stepContent.querySelectorAll('button')].find(focusControl)?.focus({ preventScroll: true });
  }

  function addProduct(productId, delta) {
    const product = data.products.find((item) => item.id === productId);
    if (!product) return;
    const nextQuantity = Math.max(0, (state.products[productId] || 0) + delta);
    if (delta > 0) {
      if (!availableForBudget(product)) {
        setError(`Choose a higher budget to include ${product.name}.`);
        return;
      }
      if (currentBox() && productCount() >= currentBox().capacity) {
        setError('Your hamper is full. Remove an item or choose a larger box.');
        return;
      }
    }
    if (nextQuantity === 0) delete state.products[productId];
    else state.products[productId] = nextQuantity;
    setError('');
    const summaryHadFocus = document.activeElement?.classList.contains('summary-remove');
    renderCurrentProducts((button) => button.dataset.productQuantity === productId && button.dataset.delta === String(delta > 0 ? 1 : -1) || button.dataset.addProduct === productId);
    if (summaryHadFocus) (document.querySelector('.summary-remove') || summaryToggle).focus({ preventScroll: true });
    const status = nextQuantity ? `${product.name} quantity is now ${nextQuantity}.` : `${product.name} removed from your hamper.`;
    announceSummary(status);
  }

  function createOrderDraft() {
    const box = currentBox();
    const budget = currentBudget();
    return {
      customer: { fullName: state.checkout.customerName.trim(), email: state.checkout.email.trim(), phone: state.checkout.phone.trim() },
      recipient: { name: state.recipientName.trim(), phone: state.checkout.recipientPhone.trim() },
      box: { id: box.id, name: box.name, capacity: box.capacity, estimatedBasePrice: box.basePrice, colour: getBoxColor().id },
      budget: { id: budget.id, selectedAmount: budget.limit, label: budget.label },
      products: selectedProducts().map((product) => ({ id: product.id, name: product.name, quantity: state.products[product.id], estimatedUnitPrice: product.price })),
      personalisation: { recipientName: state.recipientName.trim(), giftMessage: state.giftMessage.trim(), corporateLogo: state.logo ? { fileName: state.logo.name, previewData: state.logo.dataUrl } : null, ribbonColour: getRibbonColor().label, boxColour: getBoxColor().label },
      delivery: { address: state.checkout.address.trim(), city: state.checkout.city.trim(), region: state.checkout.region.trim(), instructions: state.checkout.instructions.trim(), fee: null },
      payment: { id: null, paymentType: 'full_payment', amountMinor: window.JustHampersPaymentContracts.toMinorUnits(estimate()), currency: 'NGN', method: state.preferredPaymentMethod, provider: null, providerReference: null, status: 'Unpaid', paymentLink: null, invoiceId: null, createdAt: null, paidAt: null, metadata: {} },
      total: estimate(),
      orderStatus: 'Draft',
      createdAt: new Date().toISOString()
    };
  }

  stepList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-jump-step]');
    if (button) goToStep(Number(button.dataset.jumpStep));
  });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-select-box], [data-select-budget], [data-filter-category], [data-add-product], [data-product-quantity], [data-select-ribbon], [data-select-box-color], [data-jump-step], [data-remove-product], [data-remove-logo], #summary-toggle');
    if (!target) return;

    if (target.hasAttribute('data-select-box')) {
      const box = data.boxes.find((item) => item.id === target.dataset.selectBox);
      if (box && productCount() > box.capacity) {
        setError('Your hamper is full. Remove an item or choose a larger box.');
        return;
      }
      state.boxId = target.dataset.selectBox;
      const available = box.colors;
      if (!available.includes(state.boxColorId)) state.boxColorId = available[0];
      setError('');
      renderStep();
      stepContent.querySelector(`[data-select-box="${state.boxId}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (target.hasAttribute('data-select-budget')) {
      state.budgetId = target.dataset.selectBudget;
      setError('');
      renderStep();
      stepContent.querySelector(`[data-select-budget="${state.budgetId}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (target.hasAttribute('data-filter-category')) {
      state.category = target.dataset.filterCategory;
      renderCurrentProducts((button) => button.dataset.filterCategory === state.category);
      return;
    }
    if (target.hasAttribute('data-add-product')) {
      addProduct(target.dataset.addProduct, 1);
      return;
    }
    if (target.hasAttribute('data-product-quantity')) {
      addProduct(target.dataset.productQuantity, Number(target.dataset.delta));
      return;
    }
    if (target.hasAttribute('data-remove-product')) {
      addProduct(target.dataset.removeProduct, -(state.products[target.dataset.removeProduct] || 0));
      return;
    }
    if (target.hasAttribute('data-select-ribbon')) {
      state.ribbonId = target.dataset.selectRibbon;
      setError('');
      if (state.step === 4) {
        renderStep();
        stepContent.querySelector(`[data-select-ribbon="${state.ribbonId}"]`)?.focus({ preventScroll: true });
      }
      return;
    }
    if (target.hasAttribute('data-select-box-color')) {
      state.boxColorId = target.dataset.selectBoxColor;
      setError('');
      if (state.step === 4) {
        renderStep();
        stepContent.querySelector(`[data-select-box-color="${state.boxColorId}"]`)?.focus({ preventScroll: true });
      }
      return;
    }
    if (target.hasAttribute('data-remove-logo')) {
      state.logo = null;
      renderStep();
      return;
    }
    if (target.hasAttribute('data-jump-step')) {
      const step = Number(target.dataset.jumpStep);
      if (step === 1 && state.step === 5) goToStep(1);
      else if (step < state.step) goToStep(step);
    }
    if (target.id === 'summary-toggle') {
      const expanded = summaryPanel.classList.toggle('is-expanded');
      summaryToggle.setAttribute('aria-expanded', String(expanded));
    }
    if (target.hasAttribute('data-track-order')) {
      window.alert('Order tracking will be available once Just Hampers connects its order management system.');
    }
  });

  document.addEventListener('input', (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    if (field === 'recipientName') state.recipientName = event.target.value;
    else if (field === 'giftMessage') {
      state.giftMessage = event.target.value;
      const count = document.querySelector('#message-count');
      if (count) count.textContent = String(state.giftMessage.length);
    } else if (field === 'customRibbonColor') state.customRibbonColor = event.target.value;
    else if (field.startsWith('checkout.')) state.checkout[field.slice('checkout.'.length)] = event.target.value;
    renderSummary();
    const personalPreview = document.querySelector('.personalise-live-preview');
    if (personalPreview) personalPreview.innerHTML = `<span class="preview-caption">YOUR GIFT, TAKING SHAPE</span>${hamperArt(true)}`;
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-payment-method]')) {
      state.preferredPaymentMethod = event.target.value;
      const paymentButton = document.querySelector('#payment-button');
      if (paymentButton && auth?.isSignedIn?.()) {
        paymentButton.innerHTML = `Pay ${formatPrice(estimate())} <span aria-hidden="true">→</span>`;
      }
      return;
    }
    if (event.target.id === 'corporate-logo') {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
        setError('Please choose a PNG, JPG or WebP logo under 3 MB.');
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        state.logo = { name: file.name, dataUrl: String(reader.result) };
        setError('');
        renderStep();
      });
      reader.addEventListener('error', () => setError('This logo could not be read. Please choose another image.'));
      reader.readAsDataURL(file);
    }
  });

  backButton.addEventListener('click', () => goToStep(state.step - 1));
  nextButton.addEventListener('click', continueStep);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && summaryPanel.classList.contains('is-expanded')) {
      summaryPanel.classList.remove('is-expanded');
      summaryToggle.setAttribute('aria-expanded', 'false');
      summaryToggle.focus();
    }
  });

  renderStep();
})();
