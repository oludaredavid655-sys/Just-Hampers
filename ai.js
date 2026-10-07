(function () {
  const catalogue = window.HamperBuilderData?.products || [];
  const builderData = window.HamperBuilderData || {};
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const conversation = [];
  let activeRecommendations = [];
  let activeProfile = null;

  function formatMoney(value) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value || 0);
  }

  function buildInsights(parsed) {
    const fields = [
      ['Recipient', parsed.recipient],
      ['Budget', parsed.budget ? `₦${parsed.budget.toLocaleString()}` : 'Not specified'],
      ['Occasion', parsed.occasion],
      ['Preferences', parsed.preferenceSummary],
      ['Likely gifting style', parsed.style],
      ['Known dislikes', parsed.dislikes.length ? parsed.dislikes.join(', ') : 'None noted']
    ];

    return fields.map(([label, value]) => `
      <div>
        <dt>${escapeHtml(label)}</dt>
        <dd>${escapeHtml(value)}</dd>
      </div>
    `).join('');
  }

  function renderRecommendations(parsed) {
    const output = document.getElementById('recommendations');
    activeRecommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    if (!parsed.giftRelated || !activeRecommendations.length) {
      output.innerHTML = '';
      return;
    }
    output.innerHTML = activeRecommendations.map((recommendation, index) => {
      const products = recommendation.productIds.map((id) => catalogue.find((product) => product.id === id)).filter(Boolean);
      if (!products.length) return '';
      const productBadges = products.map((product) => `
        <li>
          <span>${escapeHtml(product.name)}</span>
          <strong>${formatMoney(product.price)}</strong>
        </li>
      `).join('');

      return `
        <article class="recommendation-card ${index === 0 ? 'is-featured' : ''}">
          <div class="recommendation-header">
            <div>
              <p class="card-label">${escapeHtml(recommendation.title)}</p>
              <h2>${index === 0 ? 'Your recommended hamper' : escapeHtml(recommendation.title)}</h2>
            </div>
            <strong class="recommendation-total">${products.length} ${products.length === 1 ? 'item' : 'items'}</strong>
          </div>
          <p class="recommendation-copy">${escapeHtml(recommendation.reason)}</p>
          <ul class="product-list">${productBadges}</ul>
          <div class="recommendation-actions"><button type="button" class="button button-primary" data-build-recommendation="${index}">Build This Hamper <span aria-hidden="true">↗</span></button><button type="button" class="button button-text compact" data-preview-recommendation="${index}">View Details</button></div>
        </article>
      `;
    }).join('');
  }

  function renderInsightPanel(answer) {
    const budget = Number(answer.budget);
    activeProfile = {
      recipient: answer.recipient || 'Not specified',
      occasion: answer.occasion || 'Not specified',
      budget: Number.isFinite(budget) && budget > 0 ? budget : null,
      preferenceSummary: Array.isArray(answer.preferences) && answer.preferences.length ? answer.preferences.join(', ') : 'Not specified',
      dislikes: Array.isArray(answer.dislikes) ? answer.dislikes : [],
      style: 'Personalised to your request'
    };
    document.getElementById('ai-insights').innerHTML = buildInsights(activeProfile);
  }

  function addAssistantMessage(message) {
    const thread = document.getElementById('chat-thread');
    const bubble = document.createElement('div');
    bubble.className = 'message assistant-message';
    const role = document.createElement('span');
    role.className = 'message-role';
    role.textContent = 'Justy';
    const text = document.createElement('p');
    text.textContent = message;
    bubble.append(role, text);
    thread.appendChild(bubble);
    thread.scrollTop = thread.scrollHeight;
    return bubble;
  }

  function addUserMessage(message) {
    const thread = document.getElementById('chat-thread');
    const bubble = document.createElement('div');
    bubble.className = 'message user-message';
    const role = document.createElement('span');
    role.className = 'message-role';
    role.textContent = 'You';
    const text = document.createElement('p');
    text.textContent = message;
    bubble.append(role, text);
    thread.appendChild(bubble);
    thread.scrollTop = thread.scrollHeight;
  }

  function buildRecommendationQuery(index) {
    const recommendation = activeRecommendations[index];
    if (!recommendation) return 'builder.html';
    const productIds = recommendation.productIds.join(',');
    const capacity = recommendation.productIds.length;
    const box = (builderData.boxes || []).slice().sort((first, second) => first.capacity - second.capacity).find((option) => option.capacity >= capacity);
    const budget = activeProfile?.budget || 100000;
    const recipient = activeProfile?.recipient && activeProfile.recipient !== 'Not specified' ? activeProfile.recipient : '';
    return `builder.html?ai-box=${encodeURIComponent(box?.id || 'small')}&ai-budget=${encodeURIComponent(budget)}&ai-recipient=${encodeURIComponent(recipient)}&ai-products=${encodeURIComponent(productIds)}`;
  }

  function setPrompt(value) {
    const input = document.getElementById('gift-query');
    input.value = value;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  async function runAi() {
    const query = document.getElementById('gift-query').value.trim();
    if (!query) return;
    addUserMessage(query);
    conversation.push({ role: 'user', content: query });
    const submitButton = document.querySelector('#ai-form button[type="submit"]');
    const pendingMessage = addAssistantMessage('I’m thinking this through…');
    const pendingText = pendingMessage.querySelector('p');
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Thinking…';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Justy is unavailable right now. Please try again shortly.');
      pendingText.textContent = result.reply || 'I’m sorry, I couldn’t form a complete answer. Please try asking another way.';
      conversation.push({ role: 'assistant', content: pendingText.textContent });
      renderInsightPanel(result);
      renderRecommendations(result);
    } catch (error) {
      conversation.pop();
      pendingText.textContent = error.message;
      renderRecommendations({ giftRelated: false, recommendations: [] });
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.innerHTML = 'Ask Justy <span aria-hidden="true">↗</span>';
      document.getElementById('gift-query').value = '';
    }
  }

  document.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-prompt]');
    if (chip) {
      setPrompt(chip.dataset.prompt);
      return;
    }

    const buildButton = event.target.closest('[data-build-recommendation]');
    if (buildButton) {
      const url = buildRecommendationQuery(Number(buildButton.dataset.buildRecommendation));
      window.location.href = url;
      return;
    }

    const previewButton = event.target.closest('[data-preview-recommendation]');
    if (previewButton) {
      const recommendation = activeRecommendations[Number(previewButton.dataset.previewRecommendation)];
      if (recommendation) addAssistantMessage(`${recommendation.title}: ${recommendation.reason}`);
    }
  });

  document.getElementById('ai-form').addEventListener('submit', (event) => {
    event.preventDefault();
    runAi();
  });

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.ai-navigation');
  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open AI navigation');
      navigation.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open AI navigation' : 'Close AI navigation');
      navigation.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  document.getElementById('ai-insights').innerHTML = buildInsights({
    recipient: 'Not specified',
    budget: null,
    occasion: 'Not specified',
    preferenceSummary: 'Not specified',
    style: 'Waiting for your question',
    dislikes: []
  });
})();
