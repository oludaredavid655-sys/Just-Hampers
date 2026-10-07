const test = require('node:test');
const assert = require('node:assert/strict');

const { buildSiteConfig } = require('../server.js');

test('buildSiteConfig enables Paystack and Google auth when keys are present', () => {
  const config = buildSiteConfig({
    paystackPublicKey: 'pk_test_123',
    paystackSecretKey: 'sk_test_123',
    supabaseUrl: 'https://example.supabase.co',
    supabasePublishableKey: 'sb_publishable_example'
  });

  assert.equal(config.payment.provider, 'paystack');
  assert.equal(config.auth.enabled, true);
  assert.equal(config.payment.enabled, true);
  assert.equal(config.payment.methods.find((method) => method.id === 'card').enabled, true);
});
