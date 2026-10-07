(function () {
  const statuses = ['Unpaid', 'Payment Initiated', 'Pending Verification', 'Paid', 'Partially Paid', 'Payment Failed', 'Payment Cancelled', 'Refund Pending', 'Refunded'];
  const paymentTypes = ['full_payment', 'deposit', 'balance', 'refund'];
  const orderStatuses = ['Pending Payment', 'Payment Confirmed', 'Order Received', 'In Production', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'];
  const corporateStatuses = ['New Request', 'Under Review', 'Preparing Quote', 'Quote Sent', 'Awaiting Client Response', 'Approved', 'Payment Pending', 'Payment Confirmed', 'In Production', 'Ready for Delivery', 'Delivered', 'Completed', 'Declined', 'Cancelled'];

  function toMinorUnits(amountMajor) {
    const amount = Number(amountMajor);
    if (!Number.isFinite(amount) || amount < 0) throw new TypeError('Amount must be a non-negative finite number.');
    return Math.round(amount * 100);
  }

  function formatMinorUnits(amountMinor, currency = 'NGN') {
    const amount = Number(amountMinor);
    if (!Number.isSafeInteger(amount) || amount < 0) return '—';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount / 100);
  }

  function createPaymentRecord({ orderId, customerId = null, paymentType = 'full_payment', amountMinor, method, provider = null, invoiceId = null, metadata = {} }) {
    if (!orderId || !paymentTypes.includes(paymentType)) throw new TypeError('A valid order and payment type are required.');
    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new TypeError('Payment amount must be a positive integer in minor units.');
    if (method && !['card', 'bank_transfer', 'payment_link'].includes(method)) throw new TypeError('Unsupported payment method.');
    return {
      id: null,
      orderId,
      customerId,
      paymentType,
      amountMinor,
      currency: 'NGN',
      method,
      provider,
      providerReference: null,
      status: 'Unpaid',
      paymentLink: null,
      invoiceId,
      createdAt: null,
      paidAt: null,
      metadata
    };
  }

  function calculateCorporateSchedule(totalMinor, depositPercentage) {
    if (!Number.isSafeInteger(totalMinor) || totalMinor <= 0) throw new TypeError('An approved quote total in minor units is required.');
    if (!Number.isFinite(depositPercentage) || depositPercentage <= 0 || depositPercentage >= 100) throw new TypeError('An administrator-configured deposit percentage between 0 and 100 is required.');
    const depositMinor = Math.round(totalMinor * depositPercentage / 100);
    return {
      totalMinor,
      depositPercentage,
      balancePercentage: 100 - depositPercentage,
      depositMinor,
      balanceMinor: totalMinor - depositMinor,
      source: 'approved_quote_terms'
    };
  }

  function remainingBalance(totalMinor, confirmedPayments = []) {
    if (!Number.isSafeInteger(totalMinor) || totalMinor < 0) throw new TypeError('Total must be a non-negative integer in minor units.');
    const paidMinor = confirmedPayments.filter((payment) => payment?.status === 'Paid' || payment?.status === 'Payment Confirmed').reduce((sum, payment) => sum + (Number.isSafeInteger(payment.amountMinor) ? payment.amountMinor : 0), 0);
    return Math.max(0, totalMinor - paidMinor);
  }

  window.JustHampersPaymentContracts = Object.freeze({
    statuses: Object.freeze(statuses),
    paymentTypes: Object.freeze(paymentTypes),
    orderStatuses: Object.freeze(orderStatuses),
    corporateStatuses: Object.freeze(corporateStatuses),
    toMinorUnits,
    formatMinorUnits,
    createPaymentRecord,
    calculateCorporateSchedule,
    remainingBalance
  });
})();
