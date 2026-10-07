(function () {
  const data = window.CorporateData;
  const ui = window.CorporateUI;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const steps = [
    { label: 'Recipients', title: 'Set the size of your campaign' }, { label: 'Budget', title: 'Set a budget guide' },
    { label: 'Occasion', title: 'Choose the occasion' }, { label: 'Customise', title: 'Shape the finishing details' },
    { label: 'Delivery', title: 'Plan how gifts should arrive' }, { label: 'Company', title: 'Tell us about your organisation' },
    { label: 'Review', title: 'Review your corporate brief' }
  ];
  const state = {
    step: 1, recipientOption: '', recipientCount: '', budgetId: '', customBudget: '', occasionId: '', customOccasion: '',
    customisations: {}, corporateMessage: '', ribbonColours: '', productRequirements: '', logo: null, selectedPackage: '',
    recipientUpload: null, delivery: { mode: '', address: '', city: '', region: '', instructions: '', preferredDate: '', locationCount: '1' },
    company: { name: '', contact: '', jobTitle: '', email: '', phone: '', website: '', address: '', industry: '', requirements: '' }
  };
  const stepList = document.querySelector('#corporate-step-list');
  const stepContent = document.querySelector('#corporate-step-content');
  const errorElement = document.querySelector('#corporate-form-error');
  const summary = document.querySelector('#corporate-summary-content');
  const summaryAside = document.querySelector('.corporate-summary');
  const summaryToggle = document.querySelector('#corporate-summary-toggle');
  const backButton = document.querySelector('#corporate-back');
  const nextButton = document.querySelector('#corporate-next');
  const menuButton = document.querySelector('.corporate-header .menu-toggle');
  const navigation = document.querySelector('#corporate-navigation');

  document.querySelector('#corporate-benefit-grid').innerHTML = data.benefits.map((benefit) => ui.benefitCard(benefit)).join('');
  document.querySelector('#corporate-package-grid').innerHTML = data.packages.map((item) => ui.packageCard(item)).join('');

  function closeNavigation() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open corporate navigation');
    navigation.classList.remove('is-open');
  }

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open corporate navigation' : 'Close corporate navigation');
    navigation.classList.toggle('is-open', !open);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation();
  });
  window.addEventListener('scroll', () => document.querySelector('.corporate-header').classList.toggle('is-scrolled', window.scrollY > 24), { passive: true });

  function setError(message) {
    if (message) errorElement.setAttribute('tabindex', '-1');
    errorElement.textContent = message;
  }

  function currentRecipientCount() {
    if (state.recipientOption === 'custom') return Number(state.recipientCount) || 0;
    return Number(state.recipientOption) || 0;
  }

  function recipientLabel() {
    if (state.recipientOption === '500') return '500+';
    if (state.recipientOption === 'custom') return currentRecipientCount() ? `${currentRecipientCount()} (custom)` : 'Custom count';
    return state.recipientOption ? state.recipientOption : 'Choose count';
  }

  function currentBudgetAmount() {
    if (state.budgetId === 'custom') return Number(state.customBudget) || 0;
    return Number(data.budgets.find((budget) => budget.id === state.budgetId)?.amount) || 0;
  }

  function budgetLabel() {
    return state.budgetId === 'custom'
      ? currentBudgetAmount() ? `${ui.money(currentBudgetAmount())} (custom)` : 'Set a custom budget'
      : data.budgets.find((budget) => budget.id === state.budgetId)?.label || 'Choose a guide';
  }

  function totalEstimate() {
    return currentRecipientCount() * currentBudgetAmount();
  }

  function selectedOccasion() {
    if (state.occasionId === 'other') return state.customOccasion.trim() || 'Other / Custom';
    return data.occasions.find((occasion) => occasion.id === state.occasionId)?.label || 'Choose occasion';
  }

  function enabledCustomisations() {
    return data.customisations.filter((option) => state.customisations[option.id]).map((option) => option.title);
  }

  function renderSteps() {
    stepList.innerHTML = steps.map((step, index) => {
      const number = index + 1;
      const complete = number < state.step;
      const current = number === state.step;
      return `<li class="corporate-progress-step ${current ? 'is-current' : ''} ${complete ? 'is-complete' : ''}"><button type="button" data-corporate-jump="${number}" ${number > state.step ? 'disabled' : ''} ${current ? 'aria-current="step"' : ''} aria-label="Step ${number}: ${escapeHtml(step.label)}${current ? ', current step' : complete ? ', completed' : ''}"><span>${complete ? '✓' : String(number).padStart(2, '0')}</span><small>${escapeHtml(step.label)}</small></button></li>`;
    }).join('');
    document.querySelector('#corporate-progress-fill').style.width = `${((state.step - 1) / (steps.length - 1)) * 100}%`;
    document.querySelector('.corporate-progress').setAttribute('aria-label', `Step ${state.step} of ${steps.length}: ${steps[state.step - 1].label}`);
  }

  function renderSummary() {
    const count = currentRecipientCount();
    const budget = currentBudgetAmount();
    const customisations = enabledCustomisations();
    const packageInfo = data.packages.find((item) => item.id === state.selectedPackage);
    const estimateReady = count && budget;
    const deliveryLabel = data.deliveryOptions.find((option) => option.id === state.delivery.mode)?.title || 'Choose delivery';
    summary.innerHTML = `<div class="corporate-summary-heading"><div><p class="eyebrow">The outline</p><h2>Request overview</h2></div><span aria-hidden="true">✳</span></div><div class="corporate-summary-row"><span>Company</span><strong>${escapeHtml(state.company.name || 'Add company details')}</strong></div><div class="corporate-summary-row"><span>Recipients</span><strong>${escapeHtml(recipientLabel())}</strong></div><div class="corporate-summary-row"><span>Per recipient</span><strong>${state.budgetId ? escapeHtml(budgetLabel()) : 'Choose a guide'}</strong></div><div class="corporate-estimate-row"><span>Estimated gifting budget</span><strong>${estimateReady ? `${ui.money(totalEstimate())}${state.budgetId === '150000' ? '+' : ''}` : '—'}</strong><small>Planning estimate only · not a quotation</small></div><div class="corporate-summary-row"><span>Occasion</span><strong>${escapeHtml(selectedOccasion())}</strong></div><div class="corporate-summary-row"><span>Delivery</span><strong>${escapeHtml(deliveryLabel)}</strong></div><div class="corporate-summary-custom"><span>Customisation</span>${customisations.length ? `<ul>${customisations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<small>Not selected yet</small>'}</div><p class="corporate-summary-footer">Custom product, branding and delivery costs are not included.</p>`;
    if (packageInfo) {
      const packageRow = document.createElement('div');
      packageRow.className = 'corporate-summary-row';
      packageRow.innerHTML = `<span>Package direction</span><strong>${escapeHtml(packageInfo.name)}</strong>`;
      summary.querySelector('.corporate-summary-heading').after(packageRow);
    }
    document.querySelector('#corporate-mobile-summary').textContent = `${count ? `${recipientLabel()} recipients` : 'Your brief, as it takes shape'}${state.budgetId ? ` · ${budgetLabel()}` : ''}`;
    document.querySelector('#corporate-mobile-estimate').textContent = estimateReady ? `${ui.money(totalEstimate())}${state.budgetId === '150000' ? '+' : ''}` : '—';
  }

  function renderRecipientsStep() {
    return `<div class="corporate-step-heading"><p class="eyebrow">Step 01 · The people</p><h2 id="corporate-step-title" tabindex="-1">How many people are you <em>gifting?</em></h2><p>Choose a starting count. If your recipient list is ready, you can preview a CSV instead of entering each person by hand.</p></div><div class="recipient-option-grid">${data.recipientOptions.map((option) => ui.recipientOption(option, state.recipientOption === option.id)).join('')}</div>${state.recipientOption === 'custom' ? `<label class="corporate-field custom-recipient-field" for="custom-recipient-count">Number of recipients <span class="field-required">Required</span><input id="custom-recipient-count" type="number" data-corporate-field="recipientCount" min="1" max="50000" step="1" inputmode="numeric" placeholder="Enter a whole number" value="${escapeHtml(state.recipientCount)}"></label>` : ''}<div class="recipient-upload-block"><div class="recipient-upload-heading"><div><p class="eyebrow">Optional · recipient details</p><h3>Have a list ready?</h3><p>Upload a CSV with recipient name (required), plus any helpful fields such as email, phone, address, department, location, gift preference or note.</p></div><span class="csv-badge">CSV</span></div><label class="recipient-dropzone" id="recipient-dropzone" for="recipient-csv"><span class="upload-symbol" aria-hidden="true">↑</span><span><strong>${state.recipientUpload ? escapeHtml(state.recipientUpload.name) : 'Upload recipient list'}</strong><small>CSV file · up to 5 MB · names are previewed in this browser only</small></span><input id="recipient-csv" type="file" accept=".csv,text/csv"></label>${state.recipientUpload ? renderRecipientFilePreview() : ''}<p class="recipient-privacy-note">This prototype does not send or retain uploaded data. Only use recipient details you are authorised to share.</p></div>`;
  }

  function renderRecipientFilePreview() {
    const upload = state.recipientUpload;
    if (!upload) return '';
    const issueList = upload.errors.length ? `<ul class="csv-errors">${upload.errors.slice(0, 5).map((issue) => `<li>${escapeHtml(issue)}</li>`).join('')}</ul>` : `<p class="csv-success"><strong>${upload.rows.length}</strong> recipient ${upload.rows.length === 1 ? 'row' : 'rows'} previewed. ${upload.rows.length <= 5 ? 'Names:' : 'First five:'} ${upload.rows.slice(0, 5).map((row) => escapeHtml(row.name)).join(', ')}</p>`;
    return `<div class="csv-preview"><div class="csv-preview-header"><strong>${escapeHtml(upload.name)}</strong><button type="button" data-remove-recipient-file>Remove</button></div>${issueList}</div>`;
  }

  function renderBudgetStep() {
    const estimate = currentRecipientCount() && currentBudgetAmount() ? ui.money(totalEstimate()) : '—';
    return `<div class="corporate-step-heading"><p class="eyebrow">Step 02 · A useful guide</p><h2 id="corporate-step-title" tabindex="-1">What’s your budget per <em>recipient?</em></h2><p>A per-person guide helps shape a practical gifting direction. Final pricing varies by products, customisation, packaging and delivery.</p></div><div class="corporate-budget-grid">${data.budgets.map((budget) => ui.budgetOption(budget, state.budgetId === budget.id)).join('')}</div>${state.budgetId === 'custom' ? `<label class="corporate-field custom-budget-field" for="custom-budget-amount">Custom budget per recipient <span class="field-required">Required</span><div class="currency-input"><span aria-hidden="true">₦</span><input id="custom-budget-amount" type="number" min="1000" max="100000000" step="1000" inputmode="numeric" data-corporate-field="customBudget" placeholder="e.g. 75000" value="${escapeHtml(state.customBudget)}"></div></label>` : ''}<div class="estimate-callout"><span class="estimate-icon" aria-hidden="true">↗</span><div><small>Estimated gifting budget · not a final quotation</small><strong>${currentRecipientCount() ? `${recipientLabel()} recipients × ${state.budgetId ? ui.money(currentBudgetAmount()) : 'your budget'} = ${estimate}` : 'Choose your recipient count and budget'}</strong><p>Final pricing may vary depending on product selection, customisation, packaging and delivery requirements.</p></div></div>`;
  }

  function renderOccasionStep() {
    return `<div class="corporate-step-heading"><p class="eyebrow">Step 03 · The reason</p><h2 id="corporate-step-title" tabindex="-1">What are you <em>celebrating?</em></h2><p>Knowing the occasion helps us understand the feeling and timing you have in mind.</p></div><div class="corporate-occasion-grid">${data.occasions.map((occasion) => ui.occasionOption(occasion, state.occasionId === occasion.id)).join('')}</div>${state.occasionId === 'other' ? `<label class="corporate-field custom-occasion-field" for="custom-occasion">Tell us about the occasion <span class="field-required">Required</span><input id="custom-occasion" type="text" data-corporate-field="customOccasion" maxlength="100" placeholder="A launch, a thank-you, or something else" value="${escapeHtml(state.customOccasion)}"></label>` : ''}`;
  }

  function renderCustomisationStep() {
    const customOptions = data.customisations.map((option) => ui.customisationOption(option, Boolean(state.customisations[option.id]))).join('');
    return `<div class="corporate-step-heading"><p class="eyebrow">Step 04 · The details that feel like you</p><h2 id="corporate-step-title" tabindex="-1">Make it <em>recognisably yours.</em></h2><p>Choose the touches you’re interested in. We’ll treat them as part of your brief, not as guaranteed inclusions.</p></div><fieldset class="customisation-fieldset"><legend>What would you like to explore?</legend><div class="customisation-grid">${customOptions}</div></fieldset>${state.customisations.companyLogo ? `<div class="corporate-upload-area"><p class="upload-label">Company logo <span class="field-optional">Optional</span></p><label class="corporate-logo-drop" for="corporate-logo"><span class="upload-symbol" aria-hidden="true">↑</span><span><strong>${state.logo ? escapeHtml(state.logo.name) : 'Upload company logo'}</strong><small>PNG, JPG or WebP · up to 3 MB</small></span><input type="file" id="corporate-logo" accept="image/png,image/jpeg,image/webp"></label>${state.logo ? `<div class="corporate-logo-preview"><img src="${state.logo.dataUrl}" alt="Preview of uploaded company logo"><span>${escapeHtml(state.logo.name)}</span><button type="button" data-remove-company-logo>Remove</button></div>` : ''}</div>` : ''}${state.customisations.customRibbon ? `<label class="corporate-field" for="custom-ribbon-colours">Company ribbon colours <span class="field-optional">Optional</span><input id="custom-ribbon-colours" data-corporate-field="ribbonColours" maxlength="120" placeholder="e.g. navy and soft gold" value="${escapeHtml(state.ribbonColours)}"></label>` : ''}${state.customisations.personalisedCards ? `<label class="corporate-field" for="corporate-message">Custom gift message <span class="field-optional">Optional</span><textarea id="corporate-message" data-corporate-field="corporateMessage" maxlength="320" rows="3" placeholder="A message to include with your gifts">${escapeHtml(state.corporateMessage)}</textarea><small class="corporate-character-count"><span id="corporate-message-count">${state.corporateMessage.length}</span> / 320 characters</small></label>` : ''}${state.customisations.customProducts ? `<label class="corporate-field" for="product-requirements">Product ideas or requirements <span class="field-optional">Optional</span><textarea id="product-requirements" data-corporate-field="productRequirements" maxlength="600" rows="3" placeholder="Tell us what you have in mind">${escapeHtml(state.productRequirements)}</textarea></label>` : ''}<p class="customisation-note">Branding, product options and availability will be reviewed when preparing a real quotation.</p>`;
  }

  function deliveryField(id, label, placeholder, required, type = 'text', value = '') {
    return `<label class="corporate-field" for="delivery-${escapeHtml(id)}">${escapeHtml(label)}${required ? '<span class="field-required">Required</span>' : '<span class="field-optional">Optional</span>'}<input id="delivery-${escapeHtml(id)}" data-delivery-field="${escapeHtml(id)}" type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" ${required ? 'required' : ''}></label>`;
  }

  function renderDeliveryStep() {
    const delivery = state.delivery;
    const multi = delivery.mode === 'multiple-locations' || delivery.mode === 'individual';
    return `<div class="corporate-step-heading"><p class="eyebrow">Step 05 · Getting it there</p><h2 id="corporate-step-title" tabindex="-1">How should the gifts be <em>delivered?</em></h2><p>Choose the fulfilment shape that suits your team. Final delivery pricing will be included in the quotation.</p></div><fieldset class="delivery-fieldset"><legend>Delivery arrangement</legend><div class="delivery-option-grid">${data.deliveryOptions.map((option) => ui.deliveryOption(option, delivery.mode === option.id)).join('')}</div></fieldset><div class="delivery-address-grid">${deliveryField('address', multi ? 'Company / dispatch address' : 'Delivery address', 'Street address', !multi, 'text', delivery.address)}${deliveryField('city', 'City', 'City', !multi, 'text', delivery.city)}${deliveryField('region', 'State', 'State', !multi, 'text', delivery.region)}${multi ? deliveryField('locationCount', 'Number of delivery locations', 'e.g. 5', true, 'number', delivery.locationCount) : ''}${deliveryField('preferredDate', 'Preferred delivery date', '', true, 'date', delivery.preferredDate)}<label class="corporate-field field-full" for="delivery-instructions">Delivery instructions <span class="field-optional">Optional</span><textarea id="delivery-instructions" data-delivery-field="instructions" rows="3" maxlength="500" placeholder="Anything helpful for coordinating delivery">${escapeHtml(delivery.instructions)}</textarea></label></div>${multi ? `<div class="delivery-csv-note"><strong>Multiple addresses?</strong><span>Include recipient addresses in your CSV list. Final delivery pricing will depend on locations and fulfilment requirements.</span>${state.recipientUpload ? `<small>${state.recipientUpload.rows.length} recipient rows attached to this draft</small>` : ''}</div>` : ''}`;
  }

  function renderCompanyStep() {
    const company = state.company;
    const fields = [
      { id: 'name', label: 'Company name', placeholder: 'Your organisation', required: true, autocomplete: 'organization' },
      { id: 'contact', label: 'Contact person', placeholder: 'Full name', required: true, autocomplete: 'name' },
      { id: 'jobTitle', label: 'Job title', placeholder: 'e.g. People & Culture Lead', required: true, autocomplete: 'organization-title' },
      { id: 'email', label: 'Business email', placeholder: 'name@company.com', type: 'email', required: true, autocomplete: 'email' },
      { id: 'phone', label: 'Phone number', placeholder: '+234 ...', type: 'tel', required: true, autocomplete: 'tel' },
      { id: 'website', label: 'Company website', placeholder: 'https://company.com', type: 'url', autocomplete: 'url' },
      { id: 'address', label: 'Company address', placeholder: 'Street address', required: true, autocomplete: 'street-address', full: true }
    ];
    return `<div class="corporate-step-heading"><p class="eyebrow">Step 06 · The people behind the brief</p><h2 id="corporate-step-title" tabindex="-1">A little about your <em>company.</em></h2><p>These details help the team understand who to follow up with when a real enquiry service is connected.</p></div><div class="company-information-grid">${fields.map((field) => ui.companyField({ ...field, value: company[field.id] })).join('')}<label class="corporate-field" for="company-industry">Industry <span class="field-optional">Optional</span><input id="company-industry" data-company-field="industry" placeholder="e.g. Education, technology" value="${escapeHtml(company.industry)}" autocomplete="organization-title"></label><label class="corporate-field field-full" for="company-requirements">Additional requirements <span class="field-optional">Optional</span><textarea id="company-requirements" data-company-field="requirements" maxlength="1200" rows="4" placeholder="Anything else we should keep in mind?">${escapeHtml(company.requirements)}</textarea></label></div>`;
  }

  function reviewRow(label, value) {
    return `<div class="review-row"><dt>${escapeHtml(label)}</dt><dd>${value || '<span class="review-empty">Not specified</span>'}</dd></div>`;
  }

  function renderReviewStep() {
    const customisations = enabledCustomisations();
    const deliveryMode = data.deliveryOptions.find((option) => option.id === state.delivery.mode)?.title || '—';
    const displayTotal = totalEstimate() ? `${ui.money(totalEstimate())}${state.budgetId === '150000' ? '+' : ''}` : '—';
    return `<div class="corporate-step-heading"><p class="eyebrow">Step 07 · A final look</p><h2 id="corporate-step-title" tabindex="-1">Review your corporate <em>brief.</em></h2><p>Make sure the outline feels right before preparing your request draft.</p></div><div class="corporate-review-card"><div class="review-card-heading"><div><small>CORPORATE GIFTING REQUEST</small><h3>${escapeHtml(state.company.name || 'Company name')}</h3></div><button type="button" data-edit-corporate-step="6">Edit company <span aria-hidden="true">↗</span></button></div><dl class="corporate-review-grid">${reviewRow('Contact person', escapeHtml(state.company.contact))}${reviewRow('Business email', escapeHtml(state.company.email))}${reviewRow('Recipients', escapeHtml(recipientLabel()))}${reviewRow('Budget per recipient', escapeHtml(budgetLabel()))}${reviewRow('Estimated gifting budget', `<strong>${escapeHtml(displayTotal)}</strong> · estimate only`)}${reviewRow('Occasion', escapeHtml(selectedOccasion()))}${reviewRow('Delivery', escapeHtml(deliveryMode))}${reviewRow('Preferred date', escapeHtml(state.delivery.preferredDate))}${reviewRow('Customisation', customisations.length ? customisations.map(escapeHtml).join(', ') : '')}${reviewRow('Recipient list', state.recipientUpload ? `${escapeHtml(state.recipientUpload.rows.length)} rows · ${escapeHtml(state.recipientUpload.name)}` : '')}${reviewRow('Company logo', state.logo ? escapeHtml(state.logo.name) : '')}${reviewRow('Delivery locations', state.delivery.mode === 'multiple-locations' || state.delivery.mode === 'individual' ? escapeHtml(state.delivery.locationCount) : 'One location')}${reviewRow('Additional requirements', escapeHtml([state.company.requirements, state.productRequirements].filter(Boolean).join(' · ')))}</dl><div class="review-honesty-note"><span aria-hidden="true">i</span><p>This is a planning estimate, not a quotation. Submitting is not connected yet; no enquiry will be sent or stored and no quote has been generated.</p></div><button type="button" class="button button-primary corporate-submit-button" data-submit-corporate>Submit Corporate Quote Request <span aria-hidden="true">→</span></button><button type="button" class="corporate-edit-all" data-edit-corporate-step="1"><span aria-hidden="true">←</span> Edit request</button></div>`;
  }

  function renderAdditionalReviewDetails() {
    const multiLocation = state.delivery.mode === 'multiple-locations' || state.delivery.mode === 'individual';
    const details = [
      ['Job title', state.company.jobTitle], ['Phone number', state.company.phone], ['Company website', state.company.website],
      ['Company address', state.company.address], ['Industry', state.company.industry],
      ['Delivery address', multiLocation && state.recipientUpload ? 'See recipient list' : state.delivery.address],
      ['Delivery city and state', [state.delivery.city, state.delivery.region].filter(Boolean).join(', ')],
      ['Delivery instructions', state.delivery.instructions], ['Company message', state.corporateMessage],
      ['Company ribbon colours', state.ribbonColours], ['Product preferences', state.productRequirements],
      ['Package direction', data.packages.find((item) => item.id === state.selectedPackage)?.name]
    ];
    const section = document.createElement('section');
    section.className = 'corporate-review-extra';
    section.innerHTML = `<h3>Additional details</h3><dl class="corporate-review-grid">${details.map(([label, value]) => reviewRow(label, escapeHtml(value || ''))).join('')}</dl>`;
    stepContent.querySelector('.corporate-review-grid')?.after(section);
  }

  function csvRecords(text) {
    const records = [];
    let record = [];
    let field = '';
    let quoted = false;
    const source = text.replace(/^\uFEFF/, '');
    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (character === '"') {
        if (quoted && source[index + 1] === '"') { field += '"'; index += 1; }
        else quoted = !quoted;
      } else if (character === ',' && !quoted) {
        record.push(field.trim()); field = '';
      } else if ((character === '\n' || character === '\r') && !quoted) {
        if (character === '\r' && source[index + 1] === '\n') index += 1;
        record.push(field.trim());
        if (record.some((value) => value !== '')) records.push(record);
        record = []; field = '';
      } else field += character;
    }
    if (quoted) throw new Error('One of the quoted fields is missing a closing quote.');
    record.push(field.trim());
    if (record.some((value) => value !== '')) records.push(record);
    return records;
  }

  function parseRecipientCsv(file, text) {
    const records = csvRecords(text);
    if (records.length < 2) throw new Error('Add a header row and at least one recipient row.');
    if (records.length > 50001) throw new Error('This preview supports up to 50,000 recipient rows.');
    const normalise = (value) => value.toLowerCase().trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
    const headers = records[0].map(normalise);
    const aliases = { name: ['name', 'recipient name', 'recipient'], email: ['email', 'email address'], phone: ['phone', 'phone number', 'mobile'], address: ['address', 'delivery address'], department: ['department'], location: ['location', 'city', 'branch'], preference: ['gift preference', 'preference'], note: ['note', 'notes', 'gift note'] };
    const columns = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, headers.findIndex((header) => names.includes(header))]));
    if (columns.name < 0) throw new Error('A recipient name column is required. Use “name” or “recipient name” as the header.');
    const errors = [];
    const rows = records.slice(1).map((record, index) => {
      const value = (key) => columns[key] >= 0 ? String(record[columns[key]] || '').trim() : '';
      const row = { name: value('name'), email: value('email'), phone: value('phone'), address: value('address'), department: value('department'), location: value('location'), preference: value('preference'), note: value('note') };
      if (!row.name) errors.push(`Row ${index + 2}: recipient name is missing.`);
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push(`Row ${index + 2}: “${row.name || 'recipient'}” has an invalid email address.`);
      return row;
    });
    return { name: file.name, size: file.size, rows, errors, columns };
  }

  function handleRecipientFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv') || file.size > 5 * 1024 * 1024) {
      state.recipientUpload = { name: file.name, rows: [], errors: ['Choose a CSV file smaller than 5 MB.'] };
      setError(state.recipientUpload.errors[0]);
      renderStep();
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      try {
        state.recipientUpload = parseRecipientCsv(file, String(reader.result || ''));
        setError('');
      } catch (error) {
        state.recipientUpload = { name: file.name, rows: [], errors: [error.message] };
        setError(error.message);
      }
      renderStep();
    });
    reader.addEventListener('error', () => {
      state.recipientUpload = { name: file.name, rows: [], errors: ['This file could not be read. Please choose another CSV.'] };
      setError(state.recipientUpload.errors[0]);
      renderStep();
    });
    reader.readAsText(file);
  }

  function validateRecipientUpload() {
    if (!state.recipientUpload) return '';
    if (state.recipientUpload.errors.length) return state.recipientUpload.errors[0];
    const expected = currentRecipientCount();
    const actual = state.recipientUpload.rows.length;
    if (state.recipientOption === '500' && actual < 500) return `Your 500+ selection needs at least 500 recipient rows; this file has ${actual}.`;
    if (state.recipientOption !== '500' && actual !== expected) return `Your recipient choice is ${expected}, but the CSV contains ${actual} rows. Update the count or upload a matching list.`;
    return '';
  }

  function renderStep(shouldFocus = false) {
    const renderers = [renderRecipientsStep, renderBudgetStep, renderOccasionStep, renderCustomisationStep, renderDeliveryStep, renderCompanyStep, renderReviewStep];
    stepContent.innerHTML = renderers[state.step - 1]();
    if (state.step === 7) {
      renderAdditionalReviewDetails();
      const paymentTerms = document.createElement('div');
      paymentTerms.innerHTML = window.JustHampersPaymentUI.renderCorporatePaymentSummary({ totalMinor: null, depositPercentage: null });
      stepContent.querySelector('.corporate-review-card').append(paymentTerms.firstElementChild);
    }
    renderSteps();
    renderSummary();
    setError('');
    backButton.disabled = state.step === 1;
    nextButton.hidden = state.step === 7;
    document.querySelector('#corporate-step-counter').textContent = `Step ${state.step} of ${steps.length}`;
    nextButton.innerHTML = state.step === 6 ? 'Review request <span aria-hidden="true">→</span>' : 'Continue <span aria-hidden="true">→</span>';
    if (shouldFocus) document.querySelector('#corporate-step-title')?.focus({ preventScroll: true });
  }

  function validateStep() {
    if (state.step === 1) {
      if (!state.recipientOption) return 'Choose the number of people you’re gifting.';
      if (!currentRecipientCount() || currentRecipientCount() < 1 || currentRecipientCount() > 50000 || !Number.isInteger(currentRecipientCount())) return 'Enter a valid whole number of recipients.';
      return validateRecipientUpload();
    }
    if (state.step === 2 && (!state.budgetId || !currentBudgetAmount() || currentBudgetAmount() < 1000 || !Number.isFinite(currentBudgetAmount()))) return 'Choose a budget per recipient or enter a valid custom amount.';
    if (state.step === 3 && (!state.occasionId || state.occasionId === 'other' && !state.customOccasion.trim())) return 'Choose an occasion and add a short description for a custom occasion.';
    if (state.step === 4 && state.logo?.errors?.length) return state.logo.errors[0];
    if (state.step === 5) {
      const delivery = state.delivery;
      if (!delivery.mode) return 'Choose how the gifts should be delivered.';
      const multiple = delivery.mode !== 'one-location';
      if (!multiple && (!delivery.address.trim() || !delivery.city.trim() || !delivery.region.trim())) return 'Add the delivery address, city and state for the selected location.';
      if (multiple && (!Number(delivery.locationCount) || Number(delivery.locationCount) < 1 || !Number.isInteger(Number(delivery.locationCount)))) return 'Enter a valid number of delivery locations.';
      if (!delivery.preferredDate) return 'Choose a preferred delivery date.';
      if (multiple) {
        const uploadError = validateRecipientUpload();
        if (uploadError) return uploadError;
        if (!state.recipientUpload) return 'Upload a recipient CSV with delivery addresses for multiple or individual delivery.';
        if (state.recipientUpload.rows.some((row) => !row.address)) return 'Add an address for each recipient in the CSV before choosing multiple or individual delivery.';
      }
    }
    if (state.step === 6) {
      const company = state.company;
      if (!company.name.trim() || !company.contact.trim() || !company.jobTitle.trim() || !company.email.trim() || !company.phone.trim() || !company.address.trim()) return 'Complete the required company, contact and address fields before continuing.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email.trim())) return 'Enter a valid business email address.';
      if (company.website && !/^https?:\/\//i.test(company.website)) return 'Enter a website starting with https:// or http://.';
    }
    return '';
  }

  function goToStep(step, focus = true) {
    if (step < 1 || step > steps.length || step > state.step) return;
    state.step = step;
    summaryAside.classList.remove('is-expanded');
    summaryToggle.setAttribute('aria-expanded', 'false');
    renderStep(focus);
    window.scrollTo({ top: document.querySelector('#quote-builder').offsetTop - 90, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function continueStep() {
    const message = validateStep();
    if (message) {
      setError(message);
      errorElement.focus();
      return;
    }
    state.step += 1;
    renderStep(true);
    window.scrollTo({ top: document.querySelector('#quote-builder').offsetTop - 90, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function buildRequestDraft() {
    const delivery = state.delivery;
    return {
      company: { ...state.company },
      contactPerson: { name: state.company.contact.trim(), jobTitle: state.company.jobTitle.trim(), email: state.company.email.trim(), phone: state.company.phone.trim() },
      recipientCount: currentRecipientCount(),
      recipientCountLabel: recipientLabel(),
      budgetPerRecipient: currentBudgetAmount(),
      estimatedTotalBudget: totalEstimate(),
      occasion: selectedOccasion(),
      customisation: { selections: enabledCustomisations(), companyLogo: state.customisations.companyLogo && state.logo ? { filename: state.logo.name, previewData: state.logo.dataUrl } : null, companyRibbonColours: state.customisations.customRibbon ? state.ribbonColours : '', companyMessage: state.customisations.personalisedCards ? state.corporateMessage : '', productRequirements: state.customisations.customProducts ? state.productRequirements : '' },
      recipientList: state.recipientUpload ? { filename: state.recipientUpload.name, rows: state.recipientUpload.rows.map((row) => ({ ...row })) } : null,
      delivery: { ...delivery, estimatedFee: null, quoteRequired: true },
      additionalRequirements: state.company.requirements,
      selectedPackage: state.selectedPackage || null,
      attachments: [state.customisations.companyLogo && state.logo?.name, state.recipientUpload?.name].filter(Boolean),
      status: 'Draft',
      createdAt: new Date().toISOString()
    };
  }

  function showDraftReady() {
    const draft = buildRequestDraft();
    const result = document.querySelector('#corporate-draft-result');
    result.innerHTML = `<div class="draft-result-mark" aria-hidden="true">✓</div><p class="eyebrow">Draft prepared in this browser</p><h2>Your corporate brief is <em>ready to review.</em></h2><p>This preview has no enquiry service connected. Nothing has been sent or stored, no reference number has been created, and no quotation has been generated.</p><div class="draft-result-facts"><span><strong>${escapeHtml(recipientLabel())}</strong><small>recipients</small></span><span><strong>${escapeHtml(ui.money(totalEstimate()))}${state.budgetId === '150000' ? '+' : ''}</strong><small>planning estimate</small></span><span><strong>${escapeHtml(selectedOccasion())}</strong><small>occasion</small></span></div><a class="button button-light" href="index.html">Return to Just Hampers <span aria-hidden="true">↗</span></a><button type="button" class="draft-edit-button" data-edit-corporate-step="7">Back to review</button>`;
    result.hidden = false;
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    window.dispatchEvent(new CustomEvent('justhampers:corporate-request-draft-ready', { detail: draft }));
  }

  stepList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-corporate-jump]');
    if (button) goToStep(Number(button.dataset.corporateJump));
  });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-recipient-option], [data-corporate-budget], [data-corporate-occasion], [data-remove-recipient-file], [data-remove-company-logo], [data-edit-corporate-step], [data-submit-corporate], #corporate-summary-toggle');
    if (!target) return;
    if (target.hasAttribute('data-recipient-option')) {
      state.recipientOption = target.dataset.recipientOption;
      if (state.recipientOption !== 'custom') state.recipientCount = state.recipientOption === '500' ? '500' : state.recipientOption;
      setError(''); renderStep();
      stepContent.querySelector(`[data-recipient-option="${state.recipientOption}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (target.hasAttribute('data-corporate-budget')) {
      state.budgetId = target.dataset.corporateBudget;
      setError(''); renderStep();
      stepContent.querySelector(`[data-corporate-budget="${state.budgetId}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (target.hasAttribute('data-corporate-occasion')) {
      state.occasionId = target.dataset.corporateOccasion;
      setError(''); renderStep();
      stepContent.querySelector(`[data-corporate-occasion="${state.occasionId}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (target.hasAttribute('data-remove-recipient-file')) {
      state.recipientUpload = null; setError(''); renderStep();
      document.querySelector('#recipient-csv')?.focus({ preventScroll: true });
      return;
    }
    if (target.hasAttribute('data-remove-company-logo')) {
      state.logo = null; setError(''); renderStep();
      document.querySelector('#corporate-logo')?.focus({ preventScroll: true });
      return;
    }
    if (target.hasAttribute('data-edit-corporate-step')) {
      goToStep(Number(target.dataset.editCorporateStep));
      return;
    }
    if (target.hasAttribute('data-submit-corporate')) {
      showDraftReady();
      return;
    }
    if (target.id === 'corporate-summary-toggle') {
      const expanded = summaryAside.classList.toggle('is-expanded');
      summaryToggle.setAttribute('aria-expanded', String(expanded));
    }
  });

  document.querySelector('#corporate-packages').addEventListener('click', (event) => {
    const link = event.target.closest('[data-select-package]');
    if (!link) return;
    state.selectedPackage = link.dataset.selectPackage;
    document.querySelectorAll('[data-select-package]').forEach((packageLink) => {
      packageLink.classList.toggle('is-selected', packageLink === link);
      packageLink.setAttribute('aria-current', packageLink === link ? 'true' : 'false');
    });
    renderSummary();
  });

  document.addEventListener('input', (event) => {
    const field = event.target.dataset.corporateField;
    if (field) {
      if (field === 'recipientCount') state.recipientCount = event.target.value;
      if (field === 'customBudget') state.customBudget = event.target.value;
      if (field === 'customOccasion') state.customOccasion = event.target.value;
      if (field === 'corporateMessage') {
        state.corporateMessage = event.target.value;
        const count = document.querySelector('#corporate-message-count');
        if (count) count.textContent = String(state.corporateMessage.length);
      }
      if (field === 'ribbonColours') state.ribbonColours = event.target.value;
      if (field === 'productRequirements') state.productRequirements = event.target.value;
    }
    const companyField = event.target.dataset.companyField;
    if (companyField) state.company[companyField] = event.target.value;
    const deliveryField = event.target.dataset.deliveryField;
    if (deliveryField) state.delivery[deliveryField] = event.target.value;
    if (field || companyField || deliveryField) renderSummary();
  });

  document.addEventListener('change', (event) => {
    if (event.target.dataset.customisation) {
      state.customisations[event.target.dataset.customisation] = event.target.checked;
      if (event.target.dataset.customisation === 'companyLogo' && !event.target.checked) state.logo = null;
      const focusedId = event.target.dataset.customisation;
      renderStep();
      stepContent.querySelector(`[data-customisation="${focusedId}"]`)?.focus({ preventScroll: true });
      renderSummary();
      return;
    }
    if (event.target.dataset.deliveryMode) {
      state.delivery.mode = event.target.dataset.deliveryMode;
      renderStep();
      stepContent.querySelector(`[data-delivery-mode="${state.delivery.mode}"]`)?.focus({ preventScroll: true });
      renderSummary();
      return;
    }
    if (event.target.id === 'recipient-csv') handleRecipientFile(event.target.files?.[0]);
    if (event.target.id === 'corporate-logo') {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
        state.logo = { name: file.name, errors: ['Choose a PNG, JPG or WebP logo smaller than 3 MB.'] };
        setError(state.logo.errors[0]); renderStep(); return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => { state.logo = { name: file.name, dataUrl: String(reader.result) }; setError(''); renderStep(); });
      reader.addEventListener('error', () => { state.logo = { name: file.name, errors: ['This logo could not be read. Choose another image.'] }; setError(state.logo.errors[0]); renderStep(); });
      reader.readAsDataURL(file);
    }
  });

  document.addEventListener('dragover', (event) => {
    if (event.target.closest('#recipient-dropzone')) event.preventDefault();
  });
  document.addEventListener('drop', (event) => {
    if (!event.target.closest('#recipient-dropzone')) return;
    event.preventDefault(); handleRecipientFile(event.dataTransfer?.files?.[0]);
  });

  backButton.addEventListener('click', () => goToStep(state.step - 1));
  nextButton.addEventListener('click', continueStep);
  summaryToggle.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && summaryAside.classList.contains('is-expanded')) {
      summaryAside.classList.remove('is-expanded'); summaryToggle.setAttribute('aria-expanded', 'false');
    }
  });
  renderStep();
})();
