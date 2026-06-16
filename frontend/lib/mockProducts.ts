export interface MockProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  video_url?: string;
  colours_available: { name: string; hex: string }[];
  sizes_available: string[];
  matchesSkinTone: boolean;
  recommendedSize: string;
  rating: number;
  reviewCount: number;
  reviews: { id: number; user: string; stars: number; date: string; text: string }[];
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'p1',
    name: 'Midnight Silk Slip Dress',
    price: 180,
    category: 'Women',
    description: 'An elegant slip dress crafted from 100% mulberry silk. Features a bias cut for a flattering drape, delicate adjustable spaghetti straps, and a subtle cowl neckline. Perfect for evening events or elevated daytime styling.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&q=80',
      'https://images.unsplash.com/photo-1566160983935-31e34ab5863c?w=1000&q=80',
      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=1000&q=80'
    ],
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    colours_available: [
      { name: 'Midnight Black', hex: '#000000' },
      { name: 'Navy Blue', hex: '#0a0a2a' },
      { name: 'Burgundy', hex: '#3b0b17' }
    ],
    sizes_available: ['XS', 'S', 'M', 'L'],
    matchesSkinTone: true,
    recommendedSize: 'S',
    rating: 4.8,
    reviewCount: 124,
    reviews: [
      { id: 1, user: 'Sarah L.', stars: 5, date: '2025-10-12', text: 'Absolutely gorgeous fit. The silk is top quality and drapes beautifully.' },
      { id: 2, user: 'Emily R.', stars: 4, date: '2025-09-28', text: 'Beautiful dress, but runs slightly small. I sized up.' }
    ]
  },
  {
    id: 'p2',
    name: 'Tailored Linen Blazer',
    price: 240,
    category: 'Men',
    description: 'A lightweight blazer crafted from premium breathable linen. Features structured shoulders, notch lapels, a two-button closure, and patch pockets. Offers a sophisticated yet relaxed look for warm-weather styling.',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Oatmeal Beige', hex: '#f5f5dc' },
      { name: 'Sand', hex: '#eaddcf' },
      { name: 'Midnight Black', hex: '#000000' }
    ],
    sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
    matchesSkinTone: false,
    recommendedSize: 'M',
    rating: 4.6,
    reviewCount: 88,
    reviews: [
      { id: 1, user: 'Marcus K.', stars: 5, date: '2025-11-02', text: 'Extremely lightweight and perfect for summer weddings. Fits like a glove.' }
    ]
  },
  {
    id: 'p3',
    name: 'Merino Wool Turtleneck',
    price: 145,
    category: 'Men',
    description: 'Crafted from exceptionally soft, extra-fine merino wool. This turtleneck sweater offers superior warmth and a slim, tailored fit, making it an ideal layering piece for transition seasons.',
    images: [
      'https://images.unsplash.com/photo-1624623278313-a930126a11c3?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Burgundy', hex: '#800000' },
      { name: 'Black', hex: '#000000' },
      { name: 'Off-White', hex: '#ffffff' }
    ],
    sizes_available: ['M', 'L', 'XL'],
    matchesSkinTone: true,
    recommendedSize: 'L',
    rating: 4.7,
    reviewCount: 95,
    reviews: [
      { id: 1, user: 'David W.', stars: 5, date: '2025-12-01', text: 'Very warm and fits perfectly. Not itchy at all.' }
    ]
  },
  {
    id: 'p4',
    name: 'Pleated Chiffon Midi Skirt',
    price: 120,
    category: 'Women',
    description: 'An elegant midi skirt featuring sharp accordion pleats that create beautiful movement. Designed with a comfortable elasticated high-waist band and lightweight chiffon fabric.',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Pastel Pink', hex: '#ffb6c1' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Black', hex: '#000000' }
    ],
    sizes_available: ['S', 'M', 'L'],
    matchesSkinTone: false,
    recommendedSize: 'M',
    rating: 4.5,
    reviewCount: 72,
    reviews: [
      { id: 1, user: 'Sophia G.', stars: 4, date: '2025-10-15', text: 'Beautiful skirt, love the pleats. A bit transparent, so wear skin-colored undergarments.' }
    ]
  },
  {
    id: 'p5',
    name: 'Classic White Oxford Shirt',
    price: 95,
    category: 'Men',
    description: 'A timeless wardrobe essential made from durable oxford cotton weave. Features a button-down collar, chest pocket, and a clean, regular fit suitable for smart-casual and formal settings.',
    images: [
      'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Classic White', hex: '#ffffff' },
      { name: 'Light Blue', hex: '#add8e6' }
    ],
    sizes_available: ['S', 'M', 'L', 'XL'],
    matchesSkinTone: true,
    recommendedSize: 'L',
    rating: 4.9,
    reviewCount: 210,
    reviews: [
      { id: 1, user: 'James T.', stars: 5, date: '2025-08-20', text: 'Best Oxford shirt I own. Thick fabric and fits great around the collar.' }
    ]
  },
  {
    id: 'p6',
    name: 'Velvet Evening Gown',
    price: 350,
    category: 'Women',
    description: 'Make a statement in this stunning floor-length velvet gown. Designed with a wrap-style silhouette, elegant V-neckline, and a dramatic thigh-high slit. Perfectly captures modern glamour.',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Royal Navy', hex: '#000080' },
      { name: 'Deep Burgundy', hex: '#800020' },
      { name: 'Jet Black', hex: '#000000' }
    ],
    sizes_available: ['XS', 'S', 'M'],
    matchesSkinTone: true,
    recommendedSize: 'S',
    rating: 4.9,
    reviewCount: 64,
    reviews: [
      { id: 1, user: 'Katherine H.', stars: 5, date: '2025-11-25', text: 'Breathtaking dress. Got so many compliments at the gala.' }
    ]
  },
  {
    id: 'p7',
    name: 'Kids Denim Jacket',
    price: 65,
    category: 'Kids',
    description: 'A classic denim jacket for kids, built from sturdy yet comfortable stretch-denim cotton. Features metal button closures, chest pockets, and adjustable waist tabs.',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Denim Blue', hex: '#4682b4' },
      { name: 'Dark Grey', hex: '#000000' }
    ],
    sizes_available: ['S', 'M', 'L'],
    matchesSkinTone: false,
    recommendedSize: 'M',
    rating: 4.4,
    reviewCount: 42,
    reviews: [
      { id: 1, user: 'Amanda P.', stars: 4, date: '2025-09-10', text: 'Cute and durable. Fits my 7-year-old perfectly.' }
    ]
  },
  {
    id: 'p8',
    name: 'Cashmere Wrap Cardigan',
    price: 210,
    category: 'Women',
    description: 'Knitted from ultra-soft 100% pure cashmere. This wrap cardigan features a self-tie belt, rib-knit trims, and a relaxed silhouette that wraps you in pure comfort and elegance.',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Heather Grey', hex: '#d3d3d3' },
      { name: 'Onyx Black', hex: '#000000' },
      { name: 'Soft Cream', hex: '#f5f5dc' }
    ],
    sizes_available: ['XS', 'S', 'M', 'L', 'XL'],
    matchesSkinTone: false,
    recommendedSize: 'M',
    rating: 4.8,
    reviewCount: 104,
    reviews: [
      { id: 1, user: 'Linda M.', stars: 5, date: '2025-12-10', text: 'Unbelievably soft. Feels like a warm hug. Highly recommend!' }
    ]
  },
  {
    id: 'p9',
    name: 'Slim Fit Chinos',
    price: 85,
    category: 'Men',
    description: 'Tailored slim-fit chinos crafted from stretch cotton twill for all-day comfort. Features a zip fly, button closure, and clean side pockets. Perfect for transitioning from office to evening.',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Khaki', hex: '#f5f5dc' },
      { name: 'Black', hex: '#000000' },
      { name: 'Navy', hex: '#000080' }
    ],
    sizes_available: ['S', 'M', 'L', 'XL'],
    matchesSkinTone: true,
    recommendedSize: 'L',
    rating: 4.5,
    reviewCount: 156,
    reviews: [
      { id: 1, user: 'Robert H.', stars: 4, date: '2025-07-14', text: 'Comfortable stretch. Slightly tight around the thighs but overall a great fit.' }
    ]
  },
  {
    id: 'p10',
    name: 'Floral Print Sundress',
    price: 110,
    category: 'Women',
    description: 'A breezy summer sundress featuring a beautiful hand-painted floral print. Designed with an A-line silhouette, sweetheart neckline, and adjustable tie-straps.',
    images: [
      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Summer Blossom', hex: '#ffffff' },
      { name: 'Dusty Pink', hex: '#ffb6c1' }
    ],
    sizes_available: ['XS', 'S', 'M', 'L'],
    matchesSkinTone: true,
    recommendedSize: 'S',
    rating: 4.7,
    reviewCount: 112,
    reviews: [
      { id: 1, user: 'Anna S.', stars: 5, date: '2025-06-18', text: 'Light, flowy, and very feminine. Ideal for hot summer days.' }
    ]
  },
  {
    id: 'p11',
    name: 'Kids Graphic Tee',
    price: 25,
    category: 'Kids',
    description: 'A fun graphic tee for kids made from 100% breathable organic cotton. Featuring a colorful graphic print and durable double-stitched hems.',
    images: [
      'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=1000&q=80'
    ],
    colours_available: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Red', hex: '#ff0000' },
      { name: 'Blue', hex: '#0000ff' }
    ],
    sizes_available: ['S', 'M', 'L'],
    matchesSkinTone: false,
    recommendedSize: 'M',
    rating: 4.3,
    reviewCount: 38,
    reviews: [
      { id: 1, user: 'Lisa R.', stars: 5, date: '2025-05-12', text: 'My son loves the graphic. Washes well without shrinking.' }
    ]
  },
  {
    id: 'p12',
    name: 'Leather Biker Jacket',
    price: 420,
    category: 'Men',
    description: 'Crafted from supple, premium full-grain leather. This iconic biker jacket features asymmetric zip closure, silver-tone hardware, and zippered cuffs for an edgy, timeless look.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Midnight Black', hex: '#000000' },
      { name: 'Vintage Brown', hex: '#8b4513' }
    ],
    sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
    matchesSkinTone: true,
    recommendedSize: 'L',
    rating: 4.9,
    reviewCount: 82,
    reviews: [
      { id: 1, user: 'Christian P.', stars: 5, date: '2025-10-30', text: 'Heavy, premium leather. The hardware is solid. Definitely worth the price.' }
    ]
  },
  {
    id: 'p13',
    name: 'High-Waisted Wide Leg Trousers',
    price: 135,
    category: 'Women',
    description: 'Sophisticated wide-leg trousers featuring a high-rise waist and sharp front pleats. Designed with side slip pockets and a concealed zip fly for a tailored finish.',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Onyx Black', hex: '#000000' },
      { name: 'Beige Cream', hex: '#f5f5dc' },
      { name: 'Slate Navy', hex: '#000080' }
    ],
    sizes_available: ['XS', 'S', 'M', 'L'],
    matchesSkinTone: false,
    recommendedSize: 'S',
    rating: 4.6,
    reviewCount: 90,
    reviews: [
      { id: 1, user: 'Elena V.', stars: 5, date: '2025-09-05', text: 'Stunning trousers. They make your legs look incredibly long.' }
    ]
  },
  {
    id: 'p14',
    name: 'Classic Trench Coat',
    price: 280,
    category: 'Women',
    description: 'A double-breasted trench coat tailored from water-repellent cotton gabardine. Detailed with a buckled waist belt, shoulder epaulettes, and a wind flap.',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Honey Beige', hex: '#f5deb3' },
      { name: 'Midnight Black', hex: '#000000' }
    ],
    sizes_available: ['S', 'M', 'L', 'XL'],
    matchesSkinTone: true,
    recommendedSize: 'M',
    rating: 4.8,
    reviewCount: 115,
    reviews: [
      { id: 1, user: 'Rachel T.', stars: 5, date: '2025-10-02', text: 'Classic tailoring. Keeps you dry and looks super chic.' }
    ]
  },
  {
    id: 'p15',
    name: 'Kids Overalls',
    price: 45,
    category: 'Kids',
    description: 'Durable cotton-denim overalls featuring adjustable buckle straps, multiple utility pockets, and side button closures. Perfect for playtime adventures.',
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1000&q=80'
    ],
    colours_available: [
      { name: 'Classic Denim', hex: '#4682b4' }
    ],
    sizes_available: ['S', 'M', 'L'],
    matchesSkinTone: false,
    recommendedSize: 'S',
    rating: 4.5,
    reviewCount: 28,
    reviews: [
      { id: 1, user: 'Tina G.', stars: 5, date: '2025-04-18', text: 'Very durable. My daughter crawls around in the dirt and these have held up beautifully.' }
    ]
  }
];
