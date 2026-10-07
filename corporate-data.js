(function () {
  window.CorporateData = {
    benefits: [
      { number: '01', title: 'Bulk gifting', description: 'Plan thoughtful gifts for 10, 50, 100, 500 or more people at a time.' },
      { number: '02', title: 'Custom branding', description: 'Bring your logo, company colours and brand details into the presentation.' },
      { number: '03', title: 'Personalised gifts', description: 'Add recipient names and a message that feels personal at any scale.' },
      { number: '04', title: 'Flexible budgets', description: 'Start with a per-person guide and build a package around your brief.' },
      { number: '05', title: 'Managed fulfilment', description: 'Coordinate preparation and delivery requirements through one enquiry.' },
      { number: '06', title: 'Scalable gifting', description: 'From a close-knit team to multi-location campaigns and events.' }
    ],
    packages: [
      { id: 'executive', number: '01', name: 'Executive', audience: 'For executives & VIP clients', description: 'Premium presentation and considered keepsakes for the people who move your business forward.', image: 'iyn%20.jpeg', alt: 'Executive corporate gift set with a blue notebook, flask and pen' },
      { id: 'team', number: '02', name: 'Team Appreciation', audience: 'For employees & teams', description: 'A thoughtful thank-you to recognise good work, milestones and the people behind them.', image: 'ylbk.jpeg', alt: 'Three premium employee appreciation gift sets' },
      { id: 'client', number: '03', name: 'Client Appreciation', audience: 'For clients & partners', description: 'Professional gifts that help you show gratitude with a little more intention.', image: 'ylbk.jpeg', alt: 'Premium corporate gift sets with drink flasks, notebooks and pens' },
      { id: 'event', number: '04', name: 'Event & Conference', audience: 'For events & conferences', description: 'Gift ideas that bring a warm, well-considered touch to your next gathering.', image: 'ylbk.jpeg', alt: 'Premium desk gift sets for event and conference guests' },
      { id: 'welcome', number: '05', name: 'New Employee', audience: 'For new team members', description: 'A warm welcome for a new colleague, from the first hello onward.', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=700&q=82', alt: 'A thoughtful desk setup ready for a new colleague' }
    ],
    recipientOptions: [
      { id: '10', label: '10', note: 'A close-knit team' }, { id: '25', label: '25', note: 'A growing group' },
      { id: '50', label: '50', note: 'A team-wide gesture' }, { id: '100', label: '100', note: 'A company moment' },
      { id: '250', label: '250', note: 'A larger campaign' }, { id: '500', label: '500+', note: 'At scale' },
      { id: 'custom', label: 'Custom number', note: 'Tell us your count' }
    ],
    budgets: [
      { id: '25000', amount: 25000, label: '₦25,000', note: 'A considered gesture' },
      { id: '50000', amount: 50000, label: '₦50,000', note: 'A generous gift' },
      { id: '100000', amount: 100000, label: '₦100,000', note: 'A premium experience' },
      { id: '150000', amount: 150000, label: '₦150,000+', note: 'A luxury starting point' },
      { id: 'custom', amount: null, label: 'Custom budget', note: 'Set your own guide' }
    ],
    occasions: [
      { id: 'christmas', icon: '✳', label: 'Christmas' }, { id: 'staff-appreciation', icon: '✦', label: 'Staff Appreciation' },
      { id: 'client-appreciation', icon: '♡', label: 'Client Appreciation' }, { id: 'anniversary', icon: '✷', label: 'Company Anniversary' },
      { id: 'conference', icon: '▧', label: 'Conference' }, { id: 'awards', icon: '★', label: 'Awards' },
      { id: 'new-employee', icon: '↗', label: 'New Employee' }, { id: 'birthday', icon: '✿', label: 'Birthday / Milestone' },
      { id: 'corporate-event', icon: '◈', label: 'Corporate Event' }, { id: 'other', icon: '＋', label: 'Other / Custom' }
    ],
    customisations: [
      { id: 'companyLogo', title: 'Company logo', description: 'Add your logo to the gifting brief.', icon: '▧' },
      { id: 'brandedBox', title: 'Branded box', description: 'Request packaging with your company identity.', icon: '□' },
      { id: 'personalisedCards', title: 'Personalised cards', description: 'Add a company-branded or personal note.', icon: '✎' },
      { id: 'recipientNames', title: 'Recipient names', description: 'Include each recipient’s name with their gift.', icon: 'Aa' },
      { id: 'customRibbon', title: 'Custom ribbon', description: 'Request a ribbon in your company colours.', icon: '⌁' },
      { id: 'customProducts', title: 'Custom product selection', description: 'Tell us which products you have in mind.', icon: '✳' }
    ],
    deliveryOptions: [
      { id: 'one-location', title: 'One location', description: 'Deliver all gifts to a single company address.', icon: '⌖' },
      { id: 'multiple-locations', title: 'Multiple locations', description: 'Coordinate gifts across branches or several addresses.', icon: '⌖' },
      { id: 'individual', title: 'Individual delivery', description: 'Send each gift directly to its recipient.', icon: '↗' }
    ],
    recipientCsvColumns: ['name', 'email', 'phone', 'address', 'department', 'location', 'gift preference', 'note'],
    requestStatuses: ['New Request', 'Under Review', 'Preparing Quote', 'Quote Sent', 'Awaiting Client Response', 'Approved', 'Payment Pending', 'Payment Confirmed', 'In Production', 'Ready for Delivery', 'Delivered', 'Completed', 'Declined', 'Cancelled']
  };
})();
