(function () {
  const image = (id, width = 560) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

  window.HamperBuilderData = {
    pricingNote: 'Illustrative estimates only. Final catalogue prices, product images and availability will be confirmed before launch.',
    boxes: [
      { id: 'small', name: 'Small', description: 'A lovely little something, thoughtfully packed.', capacity: 3, basePrice: 4000, image: 'ylbk.jpeg', alt: 'A selection of premium drink flasks and notebooks in gift boxes', colors: ['ivory', 'sage', 'burgundy'] },
      { id: 'medium', name: 'Medium', description: 'A balanced choice for everyday gifting.', capacity: 5, basePrice: 6500, image: 'ylbk.jpeg', alt: 'A set of premium drink flasks and notebooks arranged for gifting', colors: ['ivory', 'sage', 'burgundy', 'blush'] },
      { id: 'large', name: 'Large', description: 'More room for a generous selection of good things.', capacity: 7, basePrice: 9500, image: 'iyn%20.jpeg', alt: 'A blue presentation box with several corporate gift items', colors: ['ivory', 'sage', 'burgundy', 'blush'] },
      { id: 'luxury', name: 'Luxury', description: 'A keepsake presentation for truly special moments.', capacity: 10, basePrice: 16000, image: image('photo-1607082348824-0a96f2a4b9da'), alt: 'A premium arrangement of gift boxes', colors: ['ivory', 'burgundy'] }
    ],
    budgets: [
      { id: '20000', label: '₦20,000', limit: 20000, productCeiling: 6000, note: 'A thoughtful little hamper' },
      { id: '30000', label: '₦30,000', limit: 30000, productCeiling: 9000, note: 'Room for a few favourites' },
      { id: '50000', label: '₦50,000', limit: 50000, productCeiling: 14000, note: 'Explore a more generous mix' },
      { id: '100000', label: '₦100,000+', limit: null, productCeiling: null, note: 'Open the door to luxury picks' }
    ],
    categories: [
      { id: 'all', label: 'All', icon: '✳' },
      { id: 'food', label: 'Food & Treats', icon: '🍫' },
      { id: 'drinks', label: 'Drinks', icon: '☕' },
      { id: 'office', label: 'Office & Tech', icon: '▧' },
      { id: 'wellness', label: 'Wellness', icon: '✿' },
      { id: 'executive', label: 'Executive', icon: '✦' },
      { id: 'nigerian', label: 'Nigerian Inspired', icon: '✳' },
      { id: 'accessories', label: 'Finishing Touches', icon: '🎁' }
    ],
    products: [
      { id: 'chocolate', name: 'Chocolate Bar', category: 'food', description: 'A rich little moment of sweetness.', price: 3500, minimumBudget: '20000', image: image('photo-1606313564200-e75d5e30476c'), alt: 'A bar of dark chocolate' },
      { id: 'biscuits', name: 'Butter Biscuits', category: 'food', description: 'Crisp, buttery and lovely with a cuppa.', price: 2500, minimumBudget: '20000', image: image('photo-1558961363-fa8fdf82db35'), alt: 'Freshly baked biscuits' },
      { id: 'coffee', name: 'Ground Coffee', category: 'drinks', description: 'A cosy cup for a slower morning.', price: 6500, minimumBudget: '30000', image: image('photo-1447933601403-0c6688de566e'), alt: 'A cup of freshly brewed coffee' },
      { id: 'perfume', name: 'Signature Perfume', category: 'wellness', description: 'A considered fragrance for their everyday.', price: 18000, minimumBudget: '100000', image: image('photo-1594035910387-fea47794261f'), alt: 'A refined perfume bottle' },
      { id: 'skincare', name: 'Care Ritual Set', category: 'wellness', description: 'A gentle set for a little at-home care.', price: 12000, minimumBudget: '50000', image: image('photo-1608248543803-ba4f8c70ae0b'), alt: 'A skincare jar with natural ingredients' },
      { id: 'mug', name: 'Ceramic Mug', category: 'office', description: 'A useful favourite for their daily ritual.', price: 6000, minimumBudget: '30000', image: image('photo-1514228742587-6b1558fcca3d'), alt: 'A handmade ceramic coffee mug' },
      { id: 'notebook', name: 'Notebook or Journal', category: 'office', description: 'A classic journal; branded or Ankara-covered finishes can be requested.', price: 4500, minimumBudget: '30000', image: image('photo-1531346878377-a5be20888e57'), alt: 'A notebook and pen on a desk' },
      { id: 'candle', name: 'Scented Candle', category: 'wellness', description: 'A soft glow and a little room to unwind.', price: 7000, minimumBudget: '50000', image: image('photo-1603006905003-be475563bc59'), alt: 'A candle glowing in a glass jar' },
      { id: 'snacks', name: 'Snack Selection', category: 'food', description: 'A moreish mix for their next little break.', price: 3000, minimumBudget: '20000', image: image('photo-1566478989037-eec170784d0b'), alt: 'A selection of crunchy snacks' },
      { id: 'sweets', name: 'Sweet Treats', category: 'food', description: 'A colourful handful of something sweet.', price: 2200, minimumBudget: '20000', image: image('photo-1582058091505-f87a2e55a40f'), alt: 'Colourful sweets ready for gifting' },
      { id: 'tea', name: 'Tea Collection', category: 'drinks', description: 'A few comforting blends to steep and savour.', price: 4500, minimumBudget: '30000', image: image('photo-1544787219-7f47ccb76574'), alt: 'A cup of tea with loose tea leaves' },
      { id: 'accessories', name: 'Desk Organiser', category: 'office', description: 'A useful finishing touch for their workspace.', price: 8500, minimumBudget: '50000', image: image('photo-1494438639946-1ebd1d20bf85'), alt: 'A tidy desk with a thoughtful accessory' },
      { id: 'sparkling-drink', name: 'Sparkling Drink', category: 'drinks', description: 'A celebratory wine or non-alcoholic sparkling drink.', price: 8500, minimumBudget: '30000', image: image('photo-1544145945-f90425340c7e'), alt: 'A refreshing celebratory drink' },
      { id: 'fruit-juice', name: 'Premium Fruit Juice', category: 'drinks', description: 'A bright, alcohol-free choice for a thoughtful gift.', price: 4500, minimumBudget: '20000', image: image('photo-1544145945-f90425340c7e'), alt: 'A refreshing fruit drink' },
      { id: 'cashews', name: 'Cashews & Mixed Nuts', category: 'food', description: 'Roasted cashews or a premium mixed-nut selection.', price: 4000, minimumBudget: '20000', image: image('photo-1566478989037-eec170784d0b'), alt: 'A selection of packaged gourmet snacks' },
      { id: 'popcorn', name: 'Gourmet Popcorn', category: 'food', description: 'A crunchy treat for a cosy break or celebration.', price: 3500, minimumBudget: '20000', image: image('photo-1566478989037-eec170784d0b'), alt: 'A selection of crunchy snacks' },
      { id: 'chin-chin', name: 'Premium Chin-Chin', category: 'nigerian', description: 'A Nigerian favourite, packed for gifting.', price: 3500, minimumBudget: '20000', image: image('photo-1566478989037-eec170784d0b'), alt: 'A selection of crunchy snacks' },
      { id: 'plantain-chips', name: 'Plantain Chips', category: 'nigerian', description: 'Crisp locally made plantain chips.', price: 3000, minimumBudget: '20000', image: image('photo-1566478989037-eec170784d0b'), alt: 'A selection of crunchy snacks' },
      { id: 'honey-preserve', name: 'Honey or Fruit Preserve', category: 'food', description: 'A locally produced honey or gourmet fruit preserve.', price: 5500, minimumBudget: '30000', image: image('photo-1544787219-7f47ccb76574'), alt: 'A breakfast spread with tea and a small preserve' },
      { id: 'cake-brownies', name: 'Cake or Brownies', category: 'food', description: 'A freshly baked treat for birthdays and celebrations.', price: 6500, minimumBudget: '30000', image: image('photo-1558961363-fa8fdf82db35'), alt: 'Freshly baked treats ready to share' },
      { id: 'granola-fruit', name: 'Granola & Dried Fruit', category: 'food', description: 'A feel-good mix of granola and dried fruit.', price: 4500, minimumBudget: '20000', image: image('photo-1566478989037-eec170784d0b'), alt: 'A selection of snack ingredients' },
      { id: 'kilishi', name: 'Gourmet Kilishi', category: 'nigerian', description: 'A premium Nigerian-inspired savoury treat.', price: 6000, minimumBudget: '30000', image: image('photo-1566478989037-eec170784d0b'), alt: 'A selection of gourmet snacks' },
      { id: 'nigerian-coffee', name: 'Nigerian Coffee or Herbal Tea', category: 'nigerian', description: 'Locally produced coffee or Nigerian-grown herbal tea.', price: 6000, minimumBudget: '30000', image: image('photo-1447933601403-0c6688de566e'), alt: 'A cup of freshly brewed coffee' },
      { id: 'pen-set', name: 'Executive Pen Set', category: 'office', description: 'A polished pen or pen set for work and everyday notes.', price: 6500, minimumBudget: '30000', image: 'iyn%20.jpeg', alt: 'A corporate gift set featuring a pen, notebook and flask' },
      { id: 'drinkware', name: 'Flask, Tumbler or Water Bottle', category: 'office', description: 'Choose an insulated travel mug, vacuum flask, tumbler or water bottle; branding can be requested.', price: 12000, minimumBudget: '50000', image: 'ylbk.jpeg', alt: 'Corporate gift sets featuring drink flasks and stationery' },
      { id: 'business-card-holder', name: 'Business Card Holder', category: 'executive', description: 'A compact, polished desk or travel essential.', price: 9000, minimumBudget: '50000', image: 'iyn%20.jpeg', alt: 'A premium office gift set with notebook and pen' },
      { id: 'laptop-bag', name: 'Laptop Sleeve or Executive Bag', category: 'executive', description: 'A practical carry option for work, travel or a new-starter gift.', price: 25000, minimumBudget: '100000', image: 'ylbk.jpeg', alt: 'A premium corporate gift set arranged in a presentation box' },
      { id: 'tech-gifts', name: 'Power Bank, USB or Wireless Charger', category: 'office', description: 'Useful tech essentials for a desk, commute or event gift.', price: 16000, minimumBudget: '50000', image: 'iyn%20.jpeg', alt: 'A technology-focused corporate gift set' },
      { id: 'wireless-mouse', name: 'Wireless Mouse or Phone Stand', category: 'office', description: 'Small, practical upgrades for a home or office desk.', price: 8500, minimumBudget: '50000', image: image('photo-1494438639946-1ebd1d20bf85'), alt: 'A tidy desk with useful office accessories' },
      { id: 'calendar-nameplate', name: 'Desk Calendar or Nameplate', category: 'office', description: 'A personalised finishing touch for a work desk.', price: 7500, minimumBudget: '50000', image: image('photo-1531346878377-a5be20888e57'), alt: 'A notebook and desk items arranged for work' },
      { id: 'audio-gifts', name: 'Bluetooth Speaker or Wireless Earbuds', category: 'executive', description: 'A considered tech gift for workdays and travel.', price: 22000, minimumBudget: '100000', image: 'ylbk.jpeg', alt: 'Premium corporate gift sets with personal technology accessories' },
      { id: 'executive-accessories', name: 'Leather Goods & Executive Accessories', category: 'executive', description: 'A leather wallet or card holder, tech organiser, umbrella, cufflinks or premium scarf.', price: 22000, minimumBudget: '100000', image: 'iyn%20.jpeg', alt: 'A premium office gift set arranged in a presentation box' },
      { id: 'home-fragrance', name: 'Reed Diffuser or Room Spray', category: 'wellness', description: 'A considered home fragrance for a calm desk or living space.', price: 11000, minimumBudget: '50000', image: image('photo-1787074632550-2245283bc5dd'), alt: 'A collection of home fragrance products including a diffuser' },
      { id: 'hand-care', name: 'Hand Cream or Body-Care Set', category: 'wellness', description: 'Hand cream, hand wash, lotion or a mini spa-care set.', price: 9500, minimumBudget: '50000', image: image('photo-1787074640224-69e40f17c8f7'), alt: 'A personal-care bottle with gift packaging' },
      { id: 'essential-oils', name: 'Essential-Oil Set', category: 'wellness', description: 'A small aromatherapy set for a restorative moment.', price: 10000, minimumBudget: '50000', image: image('photo-1787074624802-e9cc158d4357'), alt: 'A reed diffuser for a relaxing home atmosphere' },
      { id: 'spa-linens', name: 'Towel, Sleep Mask or Spa Gift', category: 'wellness', description: 'A soft towel, sleep mask or self-care essential.', price: 9500, minimumBudget: '50000', image: image('photo-1608248543803-ba4f8c70ae0b'), alt: 'A set of personal-care products for a spa-inspired gift' },
      { id: 'personalised-card', name: 'Personalised Greeting Card', category: 'accessories', description: 'Add a printed thank-you, birthday or just-for-you card to the hamper.', price: 2000, minimumBudget: '20000', image: image('photo-1531346878377-a5be20888e57'), alt: 'A handwritten note beside a notebook and pen' },
      { id: 'floral-accent', name: 'Floral Accent', category: 'accessories', description: 'A fresh or artificial floral detail to finish a celebration box.', price: 5000, minimumBudget: '30000', image: image('photo-1523438885200-e635ba2c371e'), alt: 'A floral detail arranged for a celebration' },
      { id: 'nigerian-artisan', name: 'Nigerian Artisan Keepsake', category: 'nigerian', description: 'Request handmade ceramics, a woven basket, Adire accessory, locally made leather or a small artwork by a Nigerian creative.', price: 18000, minimumBudget: '50000', image: 'ylbk.jpeg', alt: 'A curated gift-set reference for a Nigerian-inspired hamper' }
    ],
    ribbons: [
      { id: 'gold', label: 'Soft gold', color: '#c69b4c' }, { id: 'white', label: 'Warm white', color: '#fffaf0' },
      { id: 'black', label: 'Ink', color: '#302a27' }, { id: 'red', label: 'Berry red', color: '#781b31' },
      { id: 'pink', label: 'Blush', color: '#d99a9d' }, { id: 'blue', label: 'Soft blue', color: '#809db1' },
      { id: 'custom', label: 'Custom', color: null }
    ],
    boxColors: [
      { id: 'ivory', label: 'Warm ivory', color: '#f5e7c7' }, { id: 'sage', label: 'Soft sage', color: '#aebba0' },
      { id: 'burgundy', label: 'Burgundy', color: '#781b31' }, { id: 'blush', label: 'Blush', color: '#ddb2a7' }
    ],
    orderStatuses: ['Pending', 'Payment Confirmed', 'Order Received', 'In Production', 'Quality Check', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled']
  };
})();
