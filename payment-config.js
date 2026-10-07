(function () {
  const defaultMethods = [
    { id: 'card', label: 'Card', detail: 'Debit and credit cards through secure provider checkout.', enabled: false, providerChannel: 'card' },
    { id: 'bank_transfer', label: 'Bank transfer', detail: 'Provider-managed transfer instructions.', enabled: false, providerChannel: 'bank_transfer' },
    { id: 'payment_link', label: 'Payment link', detail: 'A secure, order-specific link issued by the payment backend.', enabled: false, providerChannel: null }
  ];

  function setConfigFromRuntime() {
    const runtime = window.JustHampersSiteConfig || {};
    const payment = runtime.payment || {};
    const methods = Array.isArray(payment.methods) && payment.methods.length
      ? payment.methods.map((method) => ({
          ...method,
          enabled: Boolean(method.enabled)
        }))
      : defaultMethods;

    window.JustHampersPaymentConfig = {
      currency: payment.currency || 'NGN',
      provider: payment.provider || null,
      paystackPublicKey: payment.paystackPublicKey || null,
      enabled: Boolean(payment.enabled),
      methods,
      endpoints: {
        createCheckout: payment.endpoints?.createCheckout || '/api/payments/checkout',
        verifyStatus: payment.endpoints?.verifyStatus || '/api/payments/status',
        corporatePaymentLink: payment.endpoints?.corporatePaymentLink || '/api/corporate/payments/link'
      },
      corporate: {
        depositPercentage: payment.corporate?.depositPercentage ?? 50,
        balancePercentage: payment.corporate?.balancePercentage ?? 50,
        scheduleSource: payment.corporate?.scheduleSource || 'approved_quote'
      }
    };
  }

  async function hydrateConfig() {
    if (window.JustHampersSiteConfig && Object.keys(window.JustHampersSiteConfig).length) {
      setConfigFromRuntime();
      return;
    }

    try {
      const response = await fetch('/api/site-config', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload && typeof payload === 'object') {
        window.JustHampersSiteConfig = payload;
        setConfigFromRuntime();
      }
    } catch (error) {
      console.warn('Just Hampers could not load runtime site config.', error);
    }
  }

  window.JustHampersPaymentAPI = {
    async createCheckoutSession(payload = {}) {
      const config = window.JustHampersPaymentConfig || {};
      const response = await fetch(config.endpoints?.createCheckout || '/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Checkout could not be started.');
      return data;
    },
    async verifyPaymentStatus(reference) {
      const config = window.JustHampersPaymentConfig || {};
      const response = await fetch(`${config.endpoints?.verifyStatus || '/api/payments/status'}?reference=${encodeURIComponent(reference || '')}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Payment status could not be verified.');
      return data;
    }
  };

  setConfigFromRuntime();
  hydrateConfig();
})();
