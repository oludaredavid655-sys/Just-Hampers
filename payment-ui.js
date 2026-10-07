(function () {
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  const statusPresentation = {
    Unpaid: { label: 'Unpaid', tone: 'neutral' },
    'Payment Initiated': { label: 'Payment initiated', tone: 'pending' },
    'Pending Verification': { label: 'Pending verification', tone: 'pending' },
    Paid: { label: 'Paid', tone: 'success' },
    'Partially Paid': { label: 'Partially paid', tone: 'pending' },
    'Payment Failed': { label: 'Payment failed', tone: 'error' },
    'Payment Cancelled': { label: 'Payment cancelled', tone: 'neutral' },
    'Refund Pending': { label: 'Refund pending', tone: 'pending' },
    Refunded: { label: 'Refunded', tone: 'neutral' }
  };

  function renderMethods(methods, selectedMethod) {
    const available = methods.filter((method) => method.enabled);
    const rows = methods.map((method) => `<label class="payment-method ${method.enabled ? '' : 'is-unavailable'} ${selectedMethod === method.id ? 'is-selected' : ''}"><input type="radio" name="paymentMethod" data-payment-method="${escapeHtml(method.id)}" value="${escapeHtml(method.id)}" ${selectedMethod === method.id ? 'checked' : ''} ${method.enabled ? '' : 'disabled'}><span class="payment-method-mark" aria-hidden="true">${method.id === 'card' ? '▤' : method.id === 'bank_transfer' ? '▦' : '↗'}</span><span class="payment-method-copy"><strong>${escapeHtml(method.label)}</strong><small>${escapeHtml(method.detail)}</small></span><span class="payment-method-state">${method.enabled ? 'Available' : 'Not connected'}</span></label>`).join('');
    return `<fieldset class="payment-method-fieldset"><legend>Choose payment method</legend><div class="payment-method-list">${rows}</div>${available.length ? '<p class="payment-security-note">Payment details are collected only on the configured provider checkout. Card data is never entered on this page.</p>' : '<p class="payment-unavailable-note" role="status">Secure payments are not configured yet. No payment method is currently available, and no payment can be taken.</p>'}</fieldset>`;
  }

  function renderStatus(status, description = '') {
    const item = statusPresentation[status] || statusPresentation.Unpaid;
    return `<div class="payment-status payment-status-${item.tone}" role="status"><span class="payment-status-dot" aria-hidden="true"></span><span><strong>${escapeHtml(item.label)}</strong>${description ? `<small>${escapeHtml(description)}</small>` : ''}</span></div>`;
  }

  function renderCorporatePaymentSummary({ totalMinor, depositPercentage }) {
    const contracts = window.JustHampersPaymentContracts;
    if (!Number.isFinite(depositPercentage)) return '<div class="corporate-payment-terms"><strong>Payment schedule</strong><span>Deposit and balance terms will be set in the approved quotation.</span></div>';
    const schedule = contracts.calculateCorporateSchedule(totalMinor, depositPercentage);
    return `<div class="corporate-payment-terms"><strong>Payment schedule · quotation terms</strong><span>Deposit ${schedule.depositPercentage}% · ${contracts.formatMinorUnits(schedule.depositMinor)}</span><span>Balance ${schedule.balancePercentage}% · ${contracts.formatMinorUnits(schedule.balanceMinor)}</span></div>`;
  }

  window.JustHampersPaymentUI = Object.freeze({ renderMethods, renderStatus, renderCorporatePaymentSummary });
})();
