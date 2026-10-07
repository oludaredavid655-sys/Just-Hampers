(function () {
  const statusDefinitions = [
    { key: 'Order Confirmed', label: 'Order Confirmed', description: 'Your order has been received.' },
    { key: 'Payment Confirmed', label: 'Payment Confirmed', description: 'Payment has been successfully verified.' },
    { key: 'In Production', label: 'In Production', description: 'Your hamper is being prepared.' },
    { key: 'Quality Check', label: 'Quality Check', description: 'The hamper is being checked before dispatch.' },
    { key: 'Ready for Dispatch', label: 'Ready for Dispatch', description: 'Your hamper has been packaged and is ready to leave Just Hampers.' },
    { key: 'Dispatched', label: 'Dispatched', description: 'Your hamper has left the Just Hampers facility.' },
    { key: 'In Transit', label: 'In Transit', description: 'Your order is moving towards its destination.' },
    { key: 'At Delivery Hub', label: 'At Delivery Hub', description: 'Your shipment has arrived at the delivery hub.' },
    { key: 'Out for Delivery', label: 'Out for Delivery', description: 'Your hamper is currently with the delivery driver.' },
    { key: 'Delivered', label: 'Delivered', description: 'Your hamper has been delivered.' },
    { key: 'Delivery Attempted', label: 'Delivery Attempted', description: 'Delivery was attempted but could not be completed.' },
    { key: 'Delivery Delayed', label: 'Delivery Delayed', description: 'There has been a delay to your delivery.' },
    { key: 'Delivery Rescheduled', label: 'Delivery Rescheduled', description: 'Your delivery has been rescheduled.' },
    { key: 'Delivery Failed', label: 'Delivery Failed', description: 'The delivery could not be completed.' },
    { key: 'Cancelled', label: 'Cancelled', description: 'This order has been cancelled.' }
  ];

  const providers = [
    { id: 'roadrunner', name: 'RoadRunner Logistics', type: 'Manual dispatch', tracking_prefix: 'RR', contact: 'Operations desk', supports_webhooks: true },
    { id: 'fastlane', name: 'FastLane Delivery', type: 'Regional courier', tracking_prefix: 'FL', contact: 'Customer service', supports_webhooks: true },
    { id: 'manual', name: 'Just Hampers Dispatch', type: 'Manual management', tracking_prefix: 'JH', contact: 'Internal dispatch', supports_webhooks: false }
  ];

  const shipments = [];

  window.JustHampersDeliveryData = {
    providers,
    shipments,
    statusDefinitions
  };
})();
