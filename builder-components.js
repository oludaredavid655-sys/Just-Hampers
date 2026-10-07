(function () {
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  window.BuilderUI = {
    formatPrice(amount) {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
    },
    boxCard(box, selected) {
      return `<article class="builder-choice-card box-choice ${selected ? 'is-selected' : ''}"><img src="${escapeHtml(box.image)}" alt="${escapeHtml(box.alt)}" loading="lazy"><div class="choice-card-content"><span class="builder-card-kicker">${box.capacity} approximate product spaces</span><h3>${escapeHtml(box.name)}</h3><p>${escapeHtml(box.description)}</p><div class="choice-card-bottom"><strong>${this.formatPrice(box.basePrice)} <small>box estimate</small></strong><button type="button" class="choice-button" data-select-box="${escapeHtml(box.id)}" aria-pressed="${selected}">${selected ? 'Selected' : 'Choose box'}</button></div></div></article>`;
    },
    budgetCard(budget, selected) {
      return `<button class="budget-choice ${selected ? 'is-selected' : ''}" type="button" data-select-budget="${escapeHtml(budget.id)}" aria-pressed="${selected}"><span class="budget-check" aria-hidden="true">${selected ? '✓' : ''}</span><strong>${escapeHtml(budget.label)}</strong><small>${escapeHtml(budget.note)}</small></button>`;
    },
    categoryFilter(category, selected) {
      return `<button type="button" class="filter-chip ${selected ? 'is-selected' : ''}" data-filter-category="${escapeHtml(category.id)}" aria-pressed="${selected}"><span aria-hidden="true">${escapeHtml(category.icon)}</span>${escapeHtml(category.label)}</button>`;
    },
    productCard(product, quantity, locked, full) {
      const unavailable = locked || full;
      const actionLabel = locked ? `Available from ${this.formatPrice(Number(product.minimumBudget))} budget` : full && quantity === 0 ? 'Box is full' : quantity ? 'Add another' : 'Add to hamper';
      const categoryLabel = window.HamperBuilderData.categories.find((category) => category.id === product.category)?.label || product.category;
      return `<article class="builder-product-card ${quantity ? 'has-quantity' : ''} ${locked ? 'is-locked' : ''}"><div class="builder-product-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" loading="lazy"><span class="product-category-label">${escapeHtml(categoryLabel)}</span>${locked ? '<span class="product-lock" aria-label="Not available for this budget">✦</span>' : ''}</div><div class="builder-product-info"><div class="builder-product-heading"><h3>${escapeHtml(product.name)}</h3><strong>${this.formatPrice(product.price)}<small> est.</small></strong></div><p>${escapeHtml(product.description)}</p><div class="builder-product-action">${quantity ? `<div class="quantity-control" aria-label="Quantity for ${escapeHtml(product.name)}"><button type="button" data-product-quantity="${escapeHtml(product.id)}" data-delta="-1" aria-label="Remove one ${escapeHtml(product.name)}">−</button><span aria-live="polite">${quantity}</span><button type="button" data-product-quantity="${escapeHtml(product.id)}" data-delta="1" aria-label="Add one ${escapeHtml(product.name)}" ${unavailable ? 'disabled' : ''}>+</button></div>` : `<button class="add-product-button" type="button" data-add-product="${escapeHtml(product.id)}" ${unavailable ? 'disabled' : ''}>${escapeHtml(actionLabel)} <span aria-hidden="true">+</span></button>`}</div></div></article>`;
    },
    productLine(product, quantity) {
      return `<li class="summary-product"><span>${escapeHtml(product.name)} <small>× ${quantity}</small></span><strong>${this.formatPrice(product.price * quantity)}</strong></li>`;
    },
    colorOption(color, selected, type) {
      const value = type === 'ribbon' ? color.color || '#c69b4c' : color.color;
      const selector = type === 'box-color' ? 'data-select-box-color' : `data-select-${type}`;
      return `<button class="color-option ${selected ? 'is-selected' : ''} ${color.id === 'custom' ? 'custom-color-option' : ''}" type="button" style="--swatch:${escapeHtml(value)}" ${selector}="${escapeHtml(color.id)}" aria-pressed="${selected}" aria-label="${escapeHtml(color.label)}"><span class="swatch"></span><span>${escapeHtml(color.label)}</span></button>`;
    },
    summaryProducts(products, state) {
      return products.filter((product) => state.products[product.id]).map((product) => `<li class="summary-product"><span class="summary-product-name">${escapeHtml(product.name)} <small>× ${state.products[product.id]}</small></span><strong>${this.formatPrice(product.price * state.products[product.id])}</strong><button class="summary-remove" type="button" data-remove-product="${escapeHtml(product.id)}" aria-label="Remove ${escapeHtml(product.name)} from your hamper">×</button></li>`).join('');
    }
  };
})();
