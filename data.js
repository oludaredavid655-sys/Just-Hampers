(function () {
  const image = (id, width) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;
  window.HamperData = {
    categories: [
      { name: 'Christmas Hampers', icon: '✳', description: 'A little extra magic for the season.', image: image('photo-1512909006721-3d6018887383', 700), alt: 'A thoughtfully wrapped seasonal gift' },
      { name: 'Corporate Hampers', icon: '▧', description: 'Good things, thoughtfully shared.', image: 'iyn%20.jpeg', alt: 'Blue corporate gift set with a flask, notebook and pen' },
      { name: 'Wedding & Introduction', icon: '♡', description: 'A lovely beginning, beautifully marked.', image: image('photo-1513201099705-a9746e1e201f', 700), alt: 'A thoughtfully wrapped gift ready for a special occasion' },
      { name: 'Birthday Hampers', icon: '✷', description: 'For their once-a-year kind of day.', image: image('photo-1549465220-1a8b9238cd48', 700), alt: 'A beautifully wrapped birthday gift' },
      { name: 'Valentine’s Gifts', icon: '♥', description: 'A little way to say, it’s you.', image: image('photo-1513201099705-a9746e1e201f', 700), alt: 'A gift wrapped with care' },
      { name: 'Women’s Gifts', icon: '✿', description: 'For the wonderful women in your world.', image: image('photo-1666867540898-aaa1993ffabc', 700), alt: 'African corporate professional in a blue blouse and hijab' },
      { name: 'Men’s Gifts', icon: '✦', description: 'Considered little luxuries, just for him.', image: image('photo-1616805384781-fdcdf0328348', 700), alt: 'African business professional in a blue suit' },
      { name: 'Baby Gifts', icon: '☼', description: 'A warm welcome for someone brand new.', image: image('photo-1513201099705-a9746e1e201f', 700), alt: 'A carefully wrapped gift for a new arrival' },
      { name: 'Appreciation Gifts', icon: '♡', description: 'For the people who make a difference.', image: image('photo-1523438885200-e635ba2c371e', 700), alt: 'A thoughtful detail for a special occasion' },
      { name: 'Hampers by Budget', icon: '₦', description: 'A lovely gesture, at just the right price.', image: image('photo-1549465220-1a8b9238cd48', 700), alt: 'A wrapped gift ready to give' }
    ],
    products: [
      { id: 'classic', name: 'The Classic', description: 'A timeless mix of little luxuries and everyday favourites.', price: 'Price coming soon', size: 'Medium', image: image('photo-1549465220-1a8b9238cd48', 850), alt: 'A classic gift box wrapped in paper', tone: 'sage' },
      { id: 'celebration', name: 'The Celebration Box', description: 'A bright, joyful collection for their big little day.', price: 'Price coming soon', size: 'Large', image: 'ylbk.jpeg', alt: 'A selection of premium gift sets with drink flasks and notebooks', tone: 'peach' },
      { id: 'executive', name: 'The Executive', description: 'A polished thank-you for clients, teams and partners.', price: 'Price coming soon', size: 'Large', image: 'iyn%20.jpeg', alt: 'Blue corporate gift set with a flask, notebook and pen', tone: 'olive' },
      { id: 'love', name: 'The Love Box', description: 'A sweet, thoughtful reminder that they’re your person.', price: 'Price coming soon', size: 'Medium', image: image('photo-1513201099705-a9746e1e201f', 850), alt: 'A romantic gift wrapped with a ribbon', tone: 'rose' },
      { id: 'luxury', name: 'The Luxury Collection', description: 'An extra-special gathering of beautiful things.', price: 'Price coming soon', size: 'Large', image: image('photo-1512909006721-3d6018887383', 850), alt: 'An elegant arrangement of wrapped presents', tone: 'sand' },
      { id: 'mini', name: 'The Mini Treats', description: 'A small, lovely something that says a whole lot.', price: 'Price coming soon', size: 'Small', image: image('photo-1523438885200-e635ba2c371e', 850), alt: 'A small thoughtful gift on a table', tone: 'blue' }
    ],
    features: [
      { icon: '✿', title: 'Carefully curated', description: 'Every hamper is thoughtfully put together, down to the last lovely detail.' },
      { icon: '✳', title: 'Premium presentation', description: 'Beautiful packaging designed to make the moment memorable.' },
      { icon: '♡', title: 'Made with thought', description: 'Gifts selected with the person you’re celebrating in mind.' },
      { icon: '↗', title: 'Reliable delivery', description: 'A smooth, dependable delivery experience is part of the gift.' },
      { icon: '✎', title: 'A personal touch', description: 'Add a heartfelt message and those little custom details.' },
      { icon: '▧', title: 'Corporate gifting', description: 'Considered gifting solutions for businesses and organisations.' }
    ],
    steps: [
      { number: '01', title: 'Choose', description: 'Browse our hampers and find the perfect gift.' },
      { number: '02', title: 'Personalise', description: 'Add your preferred options and a personal message.' },
      { number: '03', title: 'Order', description: 'Confirm your order and payment.' },
      { number: '04', title: 'Deliver', description: 'We prepare and deliver your hamper.' }
    ],
    occasions: [
      { name: 'Birthday', icon: '✷' }, { name: 'Wedding', icon: '♡' }, { name: 'Anniversary', icon: '✿' },
      { name: 'Christmas', icon: '✳' }, { name: 'Valentine’s Day', icon: '♥' }, { name: 'Baby celebration', icon: '☼' },
      { name: 'Corporate appreciation', icon: '▧' }, { name: 'Graduation', icon: '✦' }, { name: 'Thank you', icon: '✎' }, { name: 'Just because', icon: '☺' }
    ],
    testimonials: [
      { name: 'Amara O.', occasion: 'Birthday', rating: 5, review: 'The little details made it feel so personal. It was exactly the kind of gift I wanted to send.' },
      { name: 'Tunde A.', occasion: 'A thoughtful thank-you', rating: 5, review: 'Beautifully put together, and so easy to give. It made saying thank you feel extra special.' },
      { name: 'Nneka C.', occasion: 'Celebration', rating: 5, review: 'You can tell a lot of care went into every part of it. Such a lovely moment to share.' }
    ]
  };
})();
