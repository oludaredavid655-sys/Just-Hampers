(function () {
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  window.HamperUI = {
    categoryCard(category, index) {
      return `<article class="category-card reveal" style="--card-index:${index}"><a href="#featured" aria-label="Explore ${escapeHtml(category.name)}"><div class="category-image"><img src="${escapeHtml(category.image)}" alt="${escapeHtml(category.alt)}" loading="lazy"><span class="category-icon" aria-hidden="true">${escapeHtml(category.icon)}</span></div><div class="category-copy"><div><h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(category.description)}</p></div><span class="round-arrow" aria-hidden="true">↗</span></div></a></article>`;
    },
    productCard(product, index) {
      return `<article class="product-card reveal" style="--card-index:${index}"><div class="product-image product-tone-${escapeHtml(product.tone)}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" loading="lazy"><span class="product-edition">JUST HAMPERS · ${String(index + 1).padStart(2, '0')}</span><button class="product-view" type="button" data-action="details" data-product-id="${escapeHtml(product.id)}">View Hamper <span aria-hidden="true">↗</span></button></div><div class="product-copy"><div class="product-title-row"><h3>${escapeHtml(product.name)}</h3><span class="product-price">${escapeHtml(product.price)}</span></div><p>${escapeHtml(product.description)}</p><div class="product-meta"><span>${escapeHtml(product.size)} hamper</span><button type="button" data-action="order" data-product-id="${escapeHtml(product.id)}">Order Now <span aria-hidden="true">↗</span></button></div></div></article>`;
    },
    featureCard(feature, index) {
      return `<article class="feature-card reveal" style="--card-index:${index}"><span class="feature-icon" aria-hidden="true">${escapeHtml(feature.icon)}</span><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.description)}</p></article>`;
    },
    processStep(step) {
      return `<article class="process-step reveal"><span class="step-number">${escapeHtml(step.number)}</span><span class="step-connector" aria-hidden="true"></span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.description)}</p></article>`;
    },
    occasionCard(occasion, index) {
      return `<a class="occasion-card reveal" style="--card-index:${index}" href="#categories"><span aria-hidden="true">${escapeHtml(occasion.icon)}</span><span>${escapeHtml(occasion.name)}</span><i aria-hidden="true">↗</i></a>`;
    },
    testimonialCard(testimonial, index) {
      const stars = '★'.repeat(Math.max(0, Math.min(5, Number(testimonial.rating))));
      return `<article class="testimonial-card reveal" style="--card-index:${index}"><div class="testimonial-top"><span class="stars" aria-label="${escapeHtml(testimonial.rating)} out of 5 stars">${stars}</span><span class="sample-tag">SAMPLE</span></div><blockquote>“${escapeHtml(testimonial.review)}”</blockquote><div class="testimonial-author"><span class="author-mark" aria-hidden="true">${escapeHtml(testimonial.name.charAt(0))}</span><span><strong>${escapeHtml(testimonial.name)}</strong><small>${escapeHtml(testimonial.occasion)}</small></span></div></article>`;
    }
  };
})();
