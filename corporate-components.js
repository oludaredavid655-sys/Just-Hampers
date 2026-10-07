(function () {
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  window.CorporateUI = {
    money(amount) {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
    },
    benefitCard(benefit) {
      return `<article class="corporate-benefit"><span class="benefit-number">${escapeHtml(benefit.number)}</span><h3>${escapeHtml(benefit.title)}</h3><p>${escapeHtml(benefit.description)}</p></article>`;
    },
    packageCard(item) {
      return `<article class="corporate-package"><div class="package-image"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" loading="lazy"><span>${escapeHtml(item.number)}</span></div><div class="package-copy"><small>${escapeHtml(item.audience)}</small><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><a href="#quote-builder" data-select-package="${escapeHtml(item.id)}">Request a custom package <span aria-hidden="true">↗</span></a></div></article>`;
    },
    recipientOption(option, selected) {
      return `<button type="button" class="recipient-option ${selected ? 'is-selected' : ''}" data-recipient-option="${escapeHtml(option.id)}" aria-pressed="${selected}"><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.note)}</small></button>`;
    },
    budgetOption(option, selected) {
      return `<button type="button" class="budget-option ${selected ? 'is-selected' : ''}" data-corporate-budget="${escapeHtml(option.id)}" aria-pressed="${selected}"><span class="budget-mark" aria-hidden="true">${selected ? '✓' : ''}</span><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.note)}</small></button>`;
    },
    occasionOption(option, selected) {
      return `<button type="button" class="occasion-option ${selected ? 'is-selected' : ''}" data-corporate-occasion="${escapeHtml(option.id)}" aria-pressed="${selected}"><span aria-hidden="true">${escapeHtml(option.icon)}</span><strong>${escapeHtml(option.label)}</strong></button>`;
    },
    customisationOption(option, selected) {
      return `<label class="customisation-option ${selected ? 'is-selected' : ''}"><input type="checkbox" data-customisation="${escapeHtml(option.id)}" ${selected ? 'checked' : ''}><span class="customisation-icon" aria-hidden="true">${escapeHtml(option.icon)}</span><span><strong>${escapeHtml(option.title)}</strong><small>${escapeHtml(option.description)}</small></span><span class="option-check" aria-hidden="true">✓</span></label>`;
    },
    deliveryOption(option, selected) {
      return `<label class="delivery-option ${selected ? 'is-selected' : ''}"><input type="radio" name="deliveryMode" value="${escapeHtml(option.id)}" data-delivery-mode="${escapeHtml(option.id)}" ${selected ? 'checked' : ''}><span class="delivery-option-icon" aria-hidden="true">${escapeHtml(option.icon)}</span><span><strong>${escapeHtml(option.title)}</strong><small>${escapeHtml(option.description)}</small></span><span class="delivery-radio" aria-hidden="true"></span></label>`;
    },
    companyField({ id, label, placeholder, value, type = 'text', required = false, autocomplete = 'off', full = false }) {
      return `<label class="corporate-field ${full ? 'field-full' : ''}" for="company-${escapeHtml(id)}">${escapeHtml(label)}${required ? '<span class="field-required">Required</span>' : '<span class="field-optional">Optional</span>'}<input id="company-${escapeHtml(id)}" name="${escapeHtml(id)}" data-company-field="${escapeHtml(id)}" type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value || '')}" autocomplete="${escapeHtml(autocomplete)}" ${required ? 'required' : ''}></label>`;
    }
  };
})();
