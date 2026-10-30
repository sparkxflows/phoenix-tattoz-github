export interface TattooServiceOption {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconName: string;
  startingPrice: string;
  recommendedFor: string;
}

export interface RemovalSizeTier {
  id: string;
  name: string;
  dimension: string;
  startingPrice: string;
  priceNumber: number;
  expectedSessions: string;
  examples: string;
  popular?: boolean;
}

export interface TrainingCourse {
  id: string;
  title: string;
  duration: string;
  fee: string;
  feeNumber: number;
  highlight: string;
  whatYouLearn: string[];
  equipmentIncluded: boolean;
  certificateType: string;
  popular?: boolean;
}

export interface PiercingArea {
  id: string;
  name: string;
  category: 'Ear' | 'Nose' | 'Face' | 'Body';
  price: string;
  priceNumber: number;
  healingTime: string;
  recommendedJewelry: string;
  painLevel: 'Mild' | 'Moderate' | 'Sensitive';
}

export interface PiercingJewelryOption {
  id: string;
  name: string;
  description: string;
  priceNote: string;
}

// 1. Tattoo Sub-Services (Clean & Minimalist, No Prices Displayed)
export const TATTOO_SUB_SERVICES: TattooServiceOption[] = [
  {
    id: 'commercial-tattoo',
    name: 'Commercial Tattoo',
    subtitle: 'Minimalist, Lettering & Symbols',
    description: 'Crisp minimal lettering, names, couple initials, zodiac signs, spiritual symbols, and delicate micro-tattoos.',
    iconName: 'Sparkles',
    startingPrice: '',
    recommendedFor: 'Wrist, Collarbone, Finger, Ankle'
  },
  {
    id: 'coverup-tattoo',
    name: 'Cover-Up Tattoo',
    subtitle: 'Old Ink & Scar Camouflage',
    description: 'Specialist redesign and pigment layering to seamlessly transform outdated tattoos or surgical scars.',
    iconName: 'Layers',
    startingPrice: '',
    recommendedFor: 'Prior tattoos or scar reworks'
  },
  {
    id: 'custom-tattoo',
    name: 'Custom Tattoo',
    subtitle: 'Original Concepts & Realism',
    description: 'Bespoke designs tailored from your ideas including black & grey realism, portraiture, geometric, and fine line.',
    iconName: 'Palette',
    startingPrice: '',
    recommendedFor: 'Forearm, Chest, Full Sleeve, Back'
  },
  {
    id: 'cosmetic-tattoo',
    name: 'Cosmetic Tattoo',
    subtitle: 'Microblading & Lip Blushing',
    description: 'Precision cosmetic pigmentation for eyebrow microblading, ombré powder shading, and natural lip blushing.',
    iconName: 'Eye',
    startingPrice: '',
    recommendedFor: 'Eyebrows, Lips, Contours'
  }
];

// 2. Tattoo Removal Sizing Tiers & Laser Details
export const REMOVAL_SIZE_TIERS: RemovalSizeTier[] = [
  {
    id: 'small',
    name: 'Small Dimension',
    dimension: 'Up to 2 sq inches',
    startingPrice: '₹1,499',
    priceNumber: 1499,
    expectedSessions: '3 - 5 Sessions',
    examples: 'Finger tattoo, wrist initial, small neck symbol, ring'
  },
  {
    id: 'medium',
    name: 'Medium Dimension',
    dimension: '2 to 5 sq inches',
    startingPrice: '₹2,999',
    priceNumber: 2999,
    expectedSessions: '4 - 6 Sessions',
    examples: 'Inner forearm script, shoulder emblem, ankle band',
    popular: true
  },
  {
    id: 'large',
    name: 'Large Dimension',
    dimension: '5 to 10 sq inches',
    startingPrice: '₹4,999',
    priceNumber: 4999,
    expectedSessions: '6 - 8 Sessions',
    examples: 'Bicep piece, calf design, half chest plate'
  },
  {
    id: 'extra-large',
    name: 'Extra Large / Multi-Zone',
    dimension: '10+ sq inches (Sleeve / Back)',
    startingPrice: '₹7,499+',
    priceNumber: 7499,
    expectedSessions: 'Custom Consultation',
    examples: 'Half sleeve, full back mural, multi-tattoo cluster'
  }
];

export const REMOVAL_PROTOCOL_FACTS = [
  {
    title: 'Q-Switched Nd:YAG Laser',
    desc: 'Medical-grade dual wavelength (1064nm & 532nm) breaking deep ink particles without burning outer dermal tissue.'
  },
  {
    title: 'Zero Permanent Scarring',
    desc: 'Cryo-cooling technology soothes skin before, during, and after pulses to preserve natural skin texture.'
  },
  {
    title: 'Certified Laser Specialists',
    desc: 'Administered under clinical sterilization protocols by experienced laser technicians.'
  }
];

// 3. Tattoo Academy Training Courses & Syllabus
export const TRAINING_SYLLABUS = [
  {
    step: '01',
    topic: 'Sterilization & Dermal Safety',
    desc: 'Autoclave protocols, bloodborne pathogen awareness, cross-contamination prevention, and medical disposable setup.'
  },
  {
    step: '02',
    topic: 'Machine Anatomy & Voltage Tuning',
    desc: 'Coil vs rotary machines, stroke length mechanics, needle depth calibration, and vibration damping.'
  },
  {
    step: '03',
    topic: 'Needle Grouping & Skin Layers',
    desc: 'Round liners, round shaders, magnums, curved bugpins, and targeting the dermis layer without blowout.'
  },
  {
    step: '04',
    topic: 'Digital Design & Stenciling',
    desc: 'Procreate iPad workflow, stencil thermal printers, body anatomy mapping, and symmetry alignment.'
  },
  {
    step: '05',
    topic: 'Linework, Shading & Color Packing',
    desc: 'Crisp single-pass lines, smooth grey-wash dilution charts, whip shading, and solid color saturation.'
  },
  {
    step: '06',
    topic: 'Live Human Model & Studio Business',
    desc: 'Supervised client tattooing, client consultation psychology, pricing calculation, and licensing.'
  }
];

export const TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 'foundation',
    title: '1-Month Foundation Certificate',
    duration: '1 Month (6 Days / Week)',
    fee: '₹25,000',
    feeNumber: 25000,
    highlight: 'Ideal for Beginners & Art Enthusiasts',
    whatYouLearn: [
      'Hygiene, sterilization & workstation prep',
      'Needle cartridge mechanics & skin depth',
      'Synthetic faux skin practice (Linework & Shading)',
      'Basic thermal stenciling & machine handling',
      'Foundation Tattoo Artist Certificate'
    ],
    equipmentIncluded: false,
    certificateType: 'Government Recognized Foundation Certificate'
  },
  {
    id: 'master',
    title: '3-Month Professional Master Tattooist Diploma',
    duration: '3 Months (Intensive Hands-on)',
    fee: '₹65,000',
    feeNumber: 65000,
    highlight: 'Most Comprehensive • Career-Ready',
    whatYouLearn: [
      'All Foundation fundamentals included',
      'Advanced Black & Grey Realism & Portraits',
      'Full Color Packing & Custom Script Mastery',
      'FREE Professional Rotary Tattoo Machine Kit Included',
      '3 Supervised Live Human Model Tattoos',
      'Studio Business, Licensing & Portfolio Building',
      'Master Tattooist Diploma + Placement Assistance'
    ],
    equipmentIncluded: true,
    certificateType: 'Professional Master Tattooist Diploma',
    popular: true
  },
  {
    id: 'workshop',
    title: '2-Week Advanced Specialization Masterclass',
    duration: '2 Weeks / Weekend Batches',
    fee: '₹15,000',
    feeNumber: 15000,
    highlight: 'For Practicing Artists Looking to Level Up',
    whatYouLearn: [
      'Hyper-realism & micro-portraits',
      'Advanced Cover-Up camouflage strategies',
      'Color blending & contrast tuning',
      'Procreate digital composition speed mastery',
      'Advanced Specialization Certificate'
    ],
    equipmentIncluded: false,
    certificateType: 'Advanced Specialization Certificate'
  }
];

// 4. Body Piercing Areas & Pricing
export const PIERCING_AREAS: PiercingArea[] = [
  {
    id: 'ear-lobe',
    name: 'Ear Lobe (Single / Pair)',
    category: 'Ear',
    price: '₹499 (Single) / ₹899 (Pair)',
    priceNumber: 499,
    healingTime: '4 - 6 Weeks',
    recommendedJewelry: 'Titanium Stud / Huggie Hoop',
    painLevel: 'Mild'
  },
  {
    id: 'helix',
    name: 'Helix / Upper Rim Cartilage',
    category: 'Ear',
    price: '₹799',
    priceNumber: 799,
    healingTime: '3 - 6 Months',
    recommendedJewelry: 'Flat-Back Titanium Labret / Hoop',
    painLevel: 'Moderate'
  },
  {
    id: 'tragus',
    name: 'Tragus / Anti-Tragus',
    category: 'Ear',
    price: '₹899',
    priceNumber: 899,
    healingTime: '3 - 6 Months',
    recommendedJewelry: 'Mini Crystal Titanium Labret',
    painLevel: 'Moderate'
  },
  {
    id: 'nostril',
    name: 'Nostril / Nose Pin',
    category: 'Nose',
    price: '₹699',
    priceNumber: 699,
    healingTime: '2 - 4 Months',
    recommendedJewelry: 'L-Bend or Bone Stud / Seamless Ring',
    painLevel: 'Mild'
  },
  {
    id: 'septum',
    name: 'Septum (Center Nose)',
    category: 'Nose',
    price: '₹999',
    priceNumber: 999,
    healingTime: '6 - 8 Weeks',
    recommendedJewelry: 'Circular Horseshoe Barbell / Clicker',
    painLevel: 'Moderate'
  },
  {
    id: 'eyebrow',
    name: 'Eyebrow',
    category: 'Face',
    price: '₹899',
    priceNumber: 899,
    healingTime: '6 - 8 Weeks',
    recommendedJewelry: 'Curved Titanium Barbell',
    painLevel: 'Mild'
  },
  {
    id: 'lip-labret',
    name: 'Lip / Labret / Monroe',
    category: 'Face',
    price: '₹999',
    priceNumber: 999,
    healingTime: '2 - 3 Months',
    recommendedJewelry: 'Flat-Back Dermal Labret',
    painLevel: 'Moderate'
  },
  {
    id: 'navel',
    name: 'Navel / Belly Button',
    category: 'Body',
    price: '₹1,199',
    priceNumber: 1199,
    healingTime: '4 - 9 Months',
    recommendedJewelry: 'Dual-Gem Curved Titanium Barbell',
    painLevel: 'Moderate'
  }
];

export const PIERCING_JEWELRY_OPTIONS: PiercingJewelryOption[] = [
  {
    id: 'titanium-grade23',
    name: 'ASTM F136 Implant-Grade Titanium',
    description: '100% Nickel-free, hypoallergenic, recommended for fastest healing without allergic reactions.',
    priceNote: 'Included with Piercing'
  },
  {
    id: 'surgical-steel-316l',
    name: '316L Surgical Stainless Steel',
    description: 'High-polish mirror shine, durable, corrosion-resistant medical metal.',
    priceNote: 'Standard Option'
  },
  {
    id: 'gold-pvd',
    name: '14K Gold PVD Coated Finish',
    description: 'Warm gold luxury aesthetic with biocompatible titanium vacuum coating.',
    priceNote: '+ ₹300 Premium'
  }
];
