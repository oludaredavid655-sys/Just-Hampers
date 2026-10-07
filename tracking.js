(function () {
  const data = window.JustHampersDeliveryData;
  const shipments = data.shipments;
  const statusDefinitions = data.statusDefinitions;
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.tracking-navigation');

  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open tracking navigation');
      navigation.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open tracking navigation' : 'Close tracking navigation');
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

  function slugify(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function formatDate(value) {
    if (!value) return 'Delivery estimate unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Delivery estimate unavailable';
    return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  function formatDateTime(value) {
    if (!value) return 'Pending update';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Pending update';
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  function getStatusMeta(status) {
    return statusDefinitions.find((entry) => entry.key === status) || { key: status, label: status, description: 'Delivery status updated.' };
  }

  function sortEvents(events) {
    return [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  const TrackingUI = {
    EmptyState: (title, description) => `
      <div class="empty-state" role="status" aria-live="polite">
        <p class="eyebrow"><span class="eyebrow-line"></span> No deliveries yet</p>
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
    `,

    TrackingSearch: (value = '') => `
      <label class="sr-only" for="tracking-input">Tracking number</label>
      <input id="tracking-input" type="text" value="${value}" placeholder="JH002" aria-label="Search by order or tracking number">
      <button type="submit" class="button button-primary">Track Order <span aria-hidden="true">↗</span></button>
    `,

    DeliveryStatus: (status) => {
      const meta = getStatusMeta(status);
      const tone = slugify(status);
      return `<span class="delivery-status status-${tone}">${meta.label}</span>`;
    },

    EstimatedDelivery: (shipment) => `
      <div class="info-card">
        <p class="card-label">Estimated Delivery</p>
        <p class="value">${shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : 'Delivery estimate unavailable'}</p>
        ${shipment.delivery_window ? `<p class="helper-text">Expected between ${shipment.delivery_window}</p>` : '<p class="helper-text">No delivery window is currently available.</p>'}
      </div>
    `,

    DeliveryProvider: (shipment) => {
      const provider = data.providers.find((item) => item.id === shipment.provider_id);
      return `
        <div class="info-card">
          <p class="card-label">Delivery Provider</p>
          <p class="value">${provider ? provider.name : shipment.delivery_partner || 'Awaiting provider'}</p>
          <p class="helper-text">Tracking: ${shipment.provider_shipment_id || shipment.tracking_number}</p>
        </div>
      `;
    },

    DeliveryMap: (shipment) => `
      <div class="info-card info-card-map">
        <p class="card-label">Current Location</p>
        <p class="value">${shipment.current_location || 'No live location currently shared.'}</p>
        <p class="helper-text">Destination: ${shipment.destination || 'Destination awaiting confirmation'}</p>
      </div>
    `,

    DeliveryEvent: (event, isCurrent = false) => {
      const safeStatus = event.status || 'Status update';
      const icon = isCurrent ? '●' : '✓';
      return `
        <li class="timeline-item ${isCurrent ? 'is-current' : ''}">
          <span class="timeline-marker" aria-hidden="true">${icon}</span>
          <div>
            <p class="event-time">${formatDateTime(event.timestamp)}</p>
            <h3>${safeStatus}</h3>
            <p>${event.description}</p>
            ${event.location ? `<small>Location: ${event.location}</small>` : ''}
            ${event.notes ? `<small>Notes: ${event.notes}</small>` : ''}
          </div>
        </li>
      `;
    },

    DeliveryTimeline: (shipment) => {
      const events = sortEvents(shipment.events || []);
      const currentStatus = shipment.status;
      return `
        <div class="timeline-block">
          <div class="panel-header-inline">
            <h3>Delivery Timeline</h3>
            ${TrackingUI.DeliveryStatus(currentStatus)}
          </div>
          <ol class="delivery-timeline">
            ${events.map((event) => TrackingUI.DeliveryEvent(event, event.status === currentStatus)).join('')}
          </ol>
        </div>
      `;
    },

    DeliveryException: (shipment) => {
      const status = shipment.status;
      const statusMap = {
        'Delivery Delayed': {
          title: 'Delivery Delayed',
          description: 'There has been an update to your delivery. Please check your tracking information for details.',
          action: 'We are monitoring the latest route and delivery information. Contact Just Hampers if you need to confirm the delivery address.'
        },
        'Delivery Attempted': {
          title: 'Delivery Attempted',
          description: 'Delivery was attempted but could not be completed.',
          action: 'The next available action will be shared through this tracking page or a direct update from the delivery team.'
        },
        'Delivery Failed': {
          title: 'Delivery Failed',
          description: 'This delivery could not be completed on the current attempt.',
          action: 'No delivery is marked complete until a confirmed successful attempt or new dispatch is recorded.'
        },
        'Delivery Rescheduled': {
          title: 'Delivery Rescheduled',
          description: 'This delivery has been rescheduled for a later time.',
          action: 'Please check the new delivery window in the tracking update when it becomes available.'
        }
      };

      const exception = statusMap[status];
      if (!exception) return '';

      return `
        <div class="info-card warning-card">
          <p class="card-label">Delivery Exception</p>
          <h3>${exception.title}</h3>
          <p>${exception.description}</p>
          <p class="helper-text">${exception.action}</p>
        </div>
      `;
    },

    ProofOfDelivery: (shipment) => {
      if (shipment.status !== 'Delivered') {
        return `
          <div class="info-card">
            <p class="card-label">Proof of Delivery</p>
            <p class="value">Not available yet</p>
            <p class="helper-text">A delivery timestamp, recipient confirmation and proof record will appear when the delivery is completed.</p>
          </div>
        `;
      }

      return `
        <div class="info-card succeeded-card">
          <p class="card-label">Proof of Delivery</p>
          <p class="value">Delivery confirmed</p>
          <p class="helper-text">Recipient confirmation recorded at ${formatDateTime(shipment.delivered_at || shipment.last_updated)}.</p>
        </div>
      `;
    },

    CorporateShipmentList: (shipment) => {
      if (!shipment.corporate_order || !Array.isArray(shipment.corporate_recipients)) return '';

      const statusCounts = shipment.corporate_recipients.reduce((acc, recipient) => {
        acc[recipient.status] = (acc[recipient.status] || 0) + 1;
        return acc;
      }, {});

      return `
        <div class="info-card corporate-card">
          <p class="card-label">Corporate Recipient Status</p>
          <div class="corporate-summary-line">
            <strong>${shipment.recipient_count} Total</strong>
            <span>${statusCounts.Delivered || 0} Delivered</span>
            <span>${statusCounts['In Transit'] || 0} In Transit</span>
            <span>${statusCounts['Out for Delivery'] || 0} Out for Delivery</span>
          </div>
          <ul class="corporate-recipient-list">
            ${shipment.corporate_recipients.map((person) => `
              <li>
                <span>${person.name}</span>
                <span>${person.location}</span>
                <strong>${person.status}</strong>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    },

    ShipmentCard: (shipment) => `
      <article class="shipment-card">
        <div class="shipment-card-header">
          <div>
            <p class="card-label">Order</p>
            <h3>${shipment.order_id}</h3>
          </div>
          ${TrackingUI.DeliveryStatus(shipment.status)}
        </div>
        <dl class="shipment-meta">
          <div><dt>Recipient</dt><dd>${shipment.recipient_name}</dd></div>
          <div><dt>Destination</dt><dd>${shipment.destination}</dd></div>
          <div><dt>Tracking</dt><dd>${shipment.tracking_number}</dd></div>
          <div><dt>Updated</dt><dd>${formatDateTime(shipment.last_updated)}</dd></div>
        </dl>
      </article>
    `,

    TrackingPage: (shipment) => {
      const provider = data.providers.find((item) => item.id === shipment.provider_id);
      const nextEvent = sortEvents(shipment.events || [])[0];

      return `
        <article class="shipment-tracking-panel">
          <div class="tracking-card-header">
            <div>
              <p class="eyebrow"><span class="eyebrow-line"></span> Current status</p>
              <h2>YOUR JUST HAMPERS ORDER IS ON ITS WAY 🎁</h2>
            </div>
            ${TrackingUI.DeliveryStatus(shipment.status)}
          </div>

          <div class="shipment-summary-grid">
            <div class="summary-item"><span>Order</span><strong>${shipment.order_id}</strong></div>
            <div class="summary-item"><span>Recipient</span><strong>${shipment.recipient_name}</strong></div>
            <div class="summary-item"><span>Delivery</span><strong>${shipment.destination}</strong></div>
            <div class="summary-item"><span>Status</span><strong>${shipment.status}</strong></div>
          </div>

          <div class="tracking-highlight-row">
            <div>
              <p class="micro-label">Tracking Number</p>
              <strong>${shipment.tracking_number}</strong>
            </div>
            <div>
              <p class="micro-label">Last Updated</p>
              <strong>${formatDateTime(shipment.last_updated)}</strong>
            </div>
            <div>
              <p class="micro-label">Delivery Partner</p>
              <strong>${provider ? provider.name : shipment.delivery_partner}</strong>
            </div>
          </div>
        </article>

        <div class="tracking-columns">
          <section class="tracking-main-panel">
            ${TrackingUI.DeliveryTimeline(shipment)}
          </section>

          <aside class="tracking-side-panel">
            ${TrackingUI.EstimatedDelivery(shipment)}
            ${TrackingUI.DeliveryProvider(shipment)}
            ${TrackingUI.DeliveryMap(shipment)}
            ${TrackingUI.DeliveryException(shipment)}
          </aside>
        </div>

        <div class="tracking-bottom-grid">
          <section class="tracking-main-panel">
            ${TrackingUI.CorporateShipmentList(shipment)}
          </section>
          <section class="tracking-main-panel">
            ${TrackingUI.ProofOfDelivery(shipment)}
          </section>
        </div>

        ${nextEvent ? `
          <div class="latest-update-bar" aria-live="polite">
            <span>${formatDateTime(nextEvent.timestamp)}</span>
            <p>${nextEvent.description}</p>
          </div>
        ` : ''}
      `;
    },

    AdminOverview: () => {
      const totals = {
        total: shipments.length,
        inTransit: shipments.filter((item) => item.status === 'In Transit').length,
        outForDelivery: shipments.filter((item) => item.status === 'Out for Delivery').length,
        delivered: shipments.filter((item) => item.status === 'Delivered').length,
        delayed: shipments.filter((item) => ['Delivery Delayed', 'Delivery Rescheduled'].includes(item.status)).length,
        failed: shipments.filter((item) => ['Delivery Failed', 'Delivery Attempted'].includes(item.status)).length,
        awaitingDispatch: shipments.filter((item) => ['Order Confirmed', 'Payment Confirmed', 'In Production', 'Quality Check', 'Ready for Dispatch'].includes(item.status)).length
      };

      const cards = [
        ['Total Shipments', totals.total],
        ['In Transit', totals.inTransit],
        ['Out for Delivery', totals.outForDelivery],
        ['Delivered', totals.delivered],
        ['Delayed', totals.delayed],
        ['Failed', totals.failed],
        ['Awaiting Dispatch', totals.awaitingDispatch]
      ];

      return cards.map(([label, value]) => `
        <div class="summary-stat">
          <p>${label}</p>
          <strong>${value}</strong>
        </div>
      `).join('');
    },

    ShipmentTable: () => shipments.map((shipment) => `
      <tr>
        <td>${shipment.order_id}</td>
        <td>${shipment.recipient_name}</td>
        <td>${shipment.destination}</td>
        <td>${TrackingUI.DeliveryStatus(shipment.status)}</td>
        <td>${shipment.delivery_partner}</td>
      </tr>
    `).join('')
  };

  window.JustHampersDeliveryUI = TrackingUI;
})();

(function () {
  const ui = window.JustHampersDeliveryUI;
  const form = document.getElementById('tracking-form');
  const input = document.getElementById('tracking-input');
  const result = document.getElementById('tracking-result');
  const adminStats = document.getElementById('admin-stats');
  const tableBody = document.getElementById('shipment-table-body');
  const auth = window.JustHampersAuth;

  function normalize(value) {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  }

  function userCanViewOrders() {
    return Boolean(auth?.isSignedIn?.()) && Array.isArray(window.JustHampersDeliveryData.shipments) && window.JustHampersDeliveryData.shipments.length > 0;
  }

  function findShipment(term) {
    const query = normalize(term);
    if (!query) return null;
    return window.JustHampersDeliveryData.shipments.find((shipment) => {
      const orderMatch = normalize(shipment.order_id) === query;
      const trackingMatch = normalize(shipment.tracking_number) === query;
      return orderMatch || trackingMatch;
    }) || null;
  }

  function renderDefaultShipment() {
    if (!userCanViewOrders()) {
      const description = auth?.isSignedIn?.()
        ? 'No delivery records are connected to your account yet. Tracking details will appear here once an order has been placed and its shipment is recorded.'
        : 'Sign in to view delivery updates for any order placed with Just Hampers.';
      result.innerHTML = ui.EmptyState('No active orders yet.', description);
      return;
    }

    const currentShipment = findShipment('JH002') || window.JustHampersDeliveryData.shipments[0];
    result.innerHTML = ui.TrackingPage(currentShipment);
  }

  function renderAdminOverview() {
    if (!userCanViewOrders()) {
      adminStats.innerHTML = '';
      tableBody.innerHTML = '';
      return;
    }

    adminStats.innerHTML = ui.AdminOverview();
    tableBody.innerHTML = ui.ShipmentTable();
  }

  function renderSearchResult(query) {
    if (!userCanViewOrders()) {
      const description = auth?.isSignedIn?.()
        ? 'No shipment records are available for your account yet. Check again after an order has been placed and its delivery details are recorded.'
        : 'Sign in to view delivery updates for your orders.';
      result.innerHTML = ui.EmptyState('Your tracker is empty.', description);
      return;
    }

    const foundShipment = findShipment(query);
    if (!foundShipment) {
      result.innerHTML = `
        <div class="empty-state" role="status" aria-live="polite">
          <p class="eyebrow"><span class="eyebrow-line"></span> No shipment found</p>
          <h2>No delivery match was found.</h2>
          <p>Check your order or tracking number and try again. If the details are unfamiliar, contact Just Hampers for help.</p>
        </div>
      `;
      return;
    }

    result.innerHTML = ui.TrackingPage(foundShipment);
  }

  if (input) {
    input.value = '';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderSearchResult(input.value);
  });

  renderAdminOverview();
  renderDefaultShipment();
})();
