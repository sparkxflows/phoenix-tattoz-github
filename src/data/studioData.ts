export interface Artist {
  id: string;
  name: string;
  role: string;
  subtitle: string;
  rating: number;
  reviewCount: number;
  image: string;
  specialties: string[];
  bio: string;
  experienceYears: number;
  tattoosCompleted: number;
  clientsCount: number;
  timeline: {
    year: string;
    title: string;
    desc: string;
  }[];
  portfolio: {
    id: string;
    title: string;
    category: string;
    image: string;
  }[];
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  artist: string;
  description: string;
  tags: string[];
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  features: string[];
}

export interface ReviewItem {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  tattooType: string;
}

export const STUDIO_INFO = {
  name: "Phoenix Tattooz Studio & Academy",
  shortName: "Phoenix Tattooz",
  tagline: "ART / EXPRESSION / LIFESTYLE",
  slogans: [
    "Ink Your Story",
    "Same Skin Different Story",
    "Different Styles Same Passion",
    "Turning Ideas Into Art",
    "Ink It Your Way",
    "Skilled | Certified | Trusted",
  ],
  foundedYear: 2019,
  yearsOfExcellence: "8+",
  happyClients: "5000+",
  rating: "4.9",
  hygiene: "100%",
  phone: "09992969919",
  displayPhone: "+91 99929 69919",
  whatsapp: "+919992969919",
  address: "2nd Floor, Red Square Market Cue-1, SCO-159, near Bikaner sweets & Pahuja bakers, Hisar, Haryana 125001",
  address2: "Shop No. 30 (Ground Floor), Silver Square Mall, Rajguru Market, Hisar - 125001",
  branches: [
    {
      id: "branch-1",
      name: "Branch 1 (Main Branch - Red Square Market)",
      address: "2nd Floor, SCO-159, Red Square Market (Near Bikaner Sweets & Pahuja Bakers), Hisar, Haryana 125001",
      highlightColor: "amber",
      isMain: true,
    },
    {
      id: "branch-2",
      name: "Branch 2 (Silver Square Mall)",
      address: "Shop No. 30 (Ground Floor), Silver Square Mall, Rajguru Market, Hisar - 125001",
      highlightColor: "white",
      isMain: false,
    }
  ],
  hours: "Wed - Tue: 10 am - 9 pm",
  hoursFull: "10 am - 9 pm, every day",
  email: "phoenixtattoozhisar@gmail.com",
};

export const SERVICES: ServiceItem[] = [
  {
    id: "tattooing",
    title: "TATTOOING",
    subtitle: "Custom Artistry",
    description: "Custom, detailed and meaningful tattoos created with precision.",
    icon: "needle",
    features: ["Custom Concept Stencils", "Black & Grey Realism", "Fine Line Precision", "Color Illustrative"],
  },
  {
    id: "cosmetic-tattoo",
    title: "COSMETIC TATTOO",
    subtitle: "Aesthetic Precision",
    description: "Enhance your natural beauty with professional cosmetic tattoo services.",
    icon: "eye",
    features: ["Microblading & Ombre Brows", "Lip Neutralization & Blush", "Scalp Micropigmentation (SMP)", "Permanent Eyeliner"],
  },
  {
    id: "cover-up",
    title: "COVER-UP TATTOO",
    subtitle: "Transformation",
    description: "Give your old tattoos a fresh start with creative cover-ups.",
    icon: "lotus",
    features: ["Old Tattoo Camouflage", "Scar Concealment", "Color Rework & Detailing", "Blast-over Art"],
  },
  {
    id: "tattoo-removal",
    title: "TATTOO REMOVAL",
    subtitle: "Advanced Laser",
    description: "Safe, effective and advanced laser technology.",
    icon: "sparkles",
    features: ["Q-Switched Nd:YAG Laser", "Minimal Skin Discomfort", "Fading for Cover-ups", "Complete Pigment Breakdown"],
  },
  {
    id: "tattoo-training",
    title: "TATTOO TRAINING",
    subtitle: "Certified Academy",
    description: "Learn from experienced artists with hands-on practice.",
    icon: "academy",
    features: ["Sterilization & Sanitation Protocols", "Needle Mechanics & Machine Tuning", "Drawing & Realism Shading", "Live Model Client Practice"],
  },
  {
    id: "piercing",
    title: "PIERCING",
    subtitle: "Body Modification",
    description: "Safe, hygienic and professional piercing services.",
    icon: "piercing",
    features: ["Implant-Grade Titanium Jewelry", "Aseptic Needle Technique", "Ear, Nose, Navel & Industrial", "Comprehensive Aftercare"],
  },
];

export const CERTIFICATIONS = [
  {
    title: "Professional Tattoo Artist Certification",
    location: "India",
    desc: "National accredited qualification in advanced artistic and dermographic tattooing.",
  },
  {
    title: "Advanced Cosmetic Tattoo Training",
    location: "Delhi",
    desc: "Certified aesthetic micropigmentation and facial dermopigmentation mastery.",
  },
  {
    title: "Laser Tattoo Removal Certification",
    location: "Delhi",
    desc: "Certified medical-grade laser radiation safety and pigment removal protocols.",
  },
  {
    title: "Hygiene & Safety Training",
    location: "International Standards",
    desc: "Bloodborne pathogens certification, cross-contamination prevention, autoclave sterilization.",
  },
];

export const ARTISTS: Artist[] = [
  {
    id: "rohit-sharma",
    name: "Rohit Sharma",
    role: "Founder & Lead Artist",
    subtitle: "CUSTOM TATTOO ARTIST | BLACK & GREY SPECIALIST",
    rating: 4.9,
    reviewCount: 245,
    image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80",
    specialties: ["Black & Grey Realism", "Portraits", "Custom Designs", "Cover Ups & Reworks"],
    bio: "Rohit started his journey in 2019 with a simple passion — art and self-expression. Over the years, he has developed his skills, style and a loyal client base. His work is known for clean lines, detailed shading and meaningful designs. For him, tattooing is not just a profession, it's a way to connect with people and bring their ideas to life.",
    experienceYears: 6,
    tattoosCompleted: 1000,
    clientsCount: 500,
    timeline: [
      {
        year: "2019",
        title: "Started Tattooing Journey",
        desc: "Began independent apprenticeship and custom illustration development.",
      },
      {
        year: "2020",
        title: "Advanced Training in Black & Grey Realism",
        desc: "Masterclass training in Delhi under veteran realism tattooers.",
      },
      {
        year: "2021",
        title: "Worked at a Premium Studio in Chandigarh",
        desc: "Refined large scale compositional work and multi-session back pieces.",
      },
      {
        year: "2022",
        title: "Specialized in Custom & Large Scale Tattoos",
        desc: "Pioneered hyper-realistic wildlife and devotional portraiture.",
      },
      {
        year: "2023 - Present",
        title: "Lead Artist & Founder at Phoenix Tattoo Studio & Academy",
        desc: "Directing the flagship studio and mentoring emerging artists in Hisar.",
      },
    ],
    portfolio: [
      {
        id: "p1",
        title: "Lion King Realism",
        category: "Black & Grey",
        image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "p2",
        title: "Lord Shiva Mahadev",
        category: "Realism",
        image: "https://images.unsplash.com/photo-1611590027211-b954fd027b51?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "p3",
        title: "Vintage Compass & Rose",
        category: "Black & Grey",
        image: "/uploads/repairs/compass-rose.jpg",
      },
      {
        id: "p4",
        title: "Wild Wolf Portrait",
        category: "Realism",
        image: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "p5",
        title: "Greek God Bust",
        category: "Portraits",
        image: "/uploads/repairs/samurai.jpg",
      },
      {
        id: "p6",
        title: "Samurai Kabuto Guard",
        category: "Custom Designs",
        image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80",
      },
    ],
    socials: {
      instagram: "https://instagram.com/phoenixtattooz",
      facebook: "https://facebook.com/phoenixtattooz",
      youtube: "https://youtube.com/@phoenixtattooz",
    },
  },
  {
    id: "sneha-verma",
    name: "Sneha Verma",
    role: "Artist",
    subtitle: "FINE LINE & REALISM SPECIALIST",
    rating: 4.8,
    reviewCount: 178,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    specialties: ["Fine Line", "Realism", "Botanical & Floral", "Minimal"],
    bio: "Sneha specializes in ultra-fine needles, micro-realism, and botanical illustrations. Her soft shading techniques create delicate, elegant tattoos that heal like whispers on the skin.",
    experienceYears: 4,
    tattoosCompleted: 750,
    clientsCount: 420,
    timeline: [
      {
        year: "2020",
        title: "Fine Arts Degree & Apprenticeship",
        desc: "Graduated with honors in visual arts before entering dermographic tattooing.",
      },
      {
        year: "2022",
        title: "Fine Line Masterclass",
        desc: "Certified in single-needle micro-realism and cosmetic lash/lip pigmentation.",
      },
      {
        year: "2023 - Present",
        title: "Resident Artist at Phoenix Tattooz",
        desc: "Head of Fine Line and Cosmetic Enhancement department.",
      },
    ],
    portfolio: [
      {
        id: "sv1",
        title: "Buddha Vibes",
        category: "Fine Line",
        image: "https://images.unsplash.com/photo-1611590027211-b954fd027b51?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "sv2",
        title: "Botanical Butterfly",
        category: "Fine Line",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      },
    ],
    socials: {
      instagram: "https://instagram.com/phoenixtattooz",
      facebook: "https://facebook.com/phoenixtattooz",
      youtube: "https://youtube.com/@phoenixtattooz",
    },
  },
  {
    id: "arjun-mehta",
    name: "Arjun Mehta",
    role: "Artist",
    subtitle: "BLACK & GREY SPECIALIST",
    rating: 4.7,
    reviewCount: 142,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    specialties: ["Black & Grey", "Traditional", "Dark Art", "Geometric"],
    bio: "Arjun has a sharp eye for deep contrast, solid black saturation, and high-impact traditional shading. He excels in bold imagery that ages gracefully.",
    experienceYears: 5,
    tattoosCompleted: 850,
    clientsCount: 390,
    timeline: [
      {
        year: "2019",
        title: "Began Tattoo Practice",
        desc: "Started working with rotary machines in Chandigarh.",
      },
      {
        year: "2021",
        title: "Traditional Tattoo Certification",
        desc: "Specialized in solid packing, bold lines, and American traditional iconography.",
      },
      {
        year: "2023 - Present",
        title: "Senior Artist at Phoenix Tattooz",
        desc: "Specializing in blackwork sleeves and traditional concepts.",
      },
    ],
    portfolio: [
      {
        id: "am1",
        title: "Snake Flow",
        category: "Traditional",
        image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "am2",
        title: "Tiger Eyes",
        category: "Black & Grey",
        image: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80",
      },
    ],
    socials: {
      instagram: "https://instagram.com/phoenixtattooz",
      facebook: "https://facebook.com/phoenixtattooz",
      youtube: "https://youtube.com/@phoenixtattooz",
    },
  },
  {
    id: "kavya-singh",
    name: "Kavya Singh",
    role: "Artist",
    subtitle: "COLOR & ILLUSTRATIVE SPECIALIST",
    rating: 4.8,
    reviewCount: 199,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    specialties: ["Neo Traditional", "Japanese", "Color & Illustrative", "Custom"],
    bio: "Kavya creates dynamic color stories, neo-traditional mythologies, and Japanese irezumi elements with expressive linework and rich color theory.",
    experienceYears: 4,
    tattoosCompleted: 680,
    clientsCount: 340,
    timeline: [
      {
        year: "2020",
        title: "Color Theory & Digital Illustration",
        desc: "Trained in custom concept art and digital skin mapping.",
      },
      {
        year: "2022",
        title: "Neo-Traditional Specialization",
        desc: "Award-winning entry at regional tattoo expo for color blending.",
      },
      {
        year: "2024 - Present",
        title: "Artist at Phoenix Tattooz",
        desc: "Leading illustrative and Japanese custom sleeve designs.",
      },
    ],
    portfolio: [
      {
        id: "ks1",
        title: "Dragon Sleeve",
        category: "Japanese",
        image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "ks2",
        title: "Samurai Mask",
        category: "Neo Traditional",
        image: "/uploads/repairs/samurai.jpg",
      },
    ],
    socials: {
      instagram: "https://instagram.com/phoenixtattooz",
      facebook: "https://facebook.com/phoenixtattooz",
      youtube: "https://youtube.com/@phoenixtattooz",
    },
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "lion-king",
    title: "Lion King",
    category: "Black & Grey",
    artist: "Rohit Sharma",
    description: "Hyper-realistic male lion portrait with deep mane shadows and penetrating gaze.",
    tags: ["Realism", "Black & Grey", "Wildlife", "Forearm"],
    image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "compass-and-rose",
    title: "Compass & Rose",
    category: "Realism",
    artist: "Rohit Sharma",
    description: "Detailed vintage navigational compass intertwined with a blooming layered rose.",
    tags: ["Realism", "Compass", "Rose", "Sleeve"],
    image: "/uploads/repairs/compass-rose.jpg",
  },
  {
    id: "dragon-sleeve",
    title: "Dragon Sleeve",
    category: "Japanese",
    artist: "Kavya Singh",
    description: "Majestic Japanese Ryu serpentine dragon winding through stormy wind bars and waves.",
    tags: ["Japanese", "Dragon", "Full Sleeve", "Mythology"],
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "buddha-vibes",
    title: "Buddha Vibes",
    category: "Fine Line",
    artist: "Sneha Verma",
    description: "Peaceful Gautama Buddha portrait framed inside sacred geometry mandala matrices.",
    tags: ["Fine Line", "Mandala", "Spiritual", "Geometric"],
    image: "https://images.unsplash.com/photo-1611590027211-b954fd027b51?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tiger-eyes",
    title: "Tiger Eyes",
    category: "Realism",
    artist: "Rohit Sharma",
    description: "Piercing realism tiger face with textured whiskers, razor fur definition, and depth.",
    tags: ["Realism", "Tiger", "Black & Grey", "Power"],
    image: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "rose-blush",
    title: "Rose Blush",
    category: "Black & Grey",
    artist: "Sneha Verma",
    description: "Dimensional shaded charcoal rose with micro dewdrop reflections and velvet petals.",
    tags: ["Black & Grey", "Rose", "Floral", "Wrist"],
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "mountain-view",
    title: "Mountain View",
    category: "Minimal",
    artist: "Sneha Verma",
    description: "Clean geometric alpine silhouettes, evergreen pine forest, and lunar eclipse crest.",
    tags: ["Minimal", "Nature", "Geometric", "Fine Line"],
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "snake-flow",
    title: "Snake Flow",
    category: "Traditional",
    artist: "Arjun Mehta",
    description: "Coiled serpent with scaled texture, menacing fangs, and bold traditional whip-shading.",
    tags: ["Traditional", "Snake", "Bold Lines", "Forearm"],
    image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "samurai",
    title: "Samurai",
    category: "Neo Traditional",
    artist: "Kavya Singh",
    description: "Formidable Japanese warrior kabuto helmet with ornate crest and fierce oni expression.",
    tags: ["Neo Traditional", "Samurai", "Japanese", "Armor"],
    image: "/uploads/repairs/samurai.jpg",
  },
  {
    id: "butterfly",
    title: "Butterfly",
    category: "Fine Line",
    artist: "Sneha Verma",
    description: "Delicate botanical monarch butterfly entwined with wild jasmine florals and stardust.",
    tags: ["Fine Line", "Butterfly", "Floral", "Micro Realism"],
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "titanium-helix-conch",
    title: "Titanium Helix & Conch",
    category: "Piercing",
    artist: "Sneha Verma",
    description: "Triple curated ear piercing with implant-grade ASTM F-136 titanium crystal clusters and flat-back labrets.",
    tags: ["Piercing", "Ear Piercing", "Helix", "Conch", "Titanium", "Jewelry"],
    image: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "nostril-septum-ring",
    title: "Classic Nostril & Septum",
    category: "Piercing",
    artist: "Sneha Verma",
    description: "Precision aseptic needle nostril stud and seamless titanium septum clicker with gold PVD finish.",
    tags: ["Piercing", "Nose Piercing", "Septum", "Nostril", "Gold Finish"],
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tragus-lobe-stack",
    title: "Tragus & Curated Lobe Stack",
    category: "Piercing",
    artist: "Sneha Verma",
    description: "Elegant ear curation featuring bezel-set moissanite tragus labret and stacked celestial earlobe studs.",
    tags: ["Piercing", "Tragus", "Lobe", "Ear Curation", "Fine Jewelry"],
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "navel-belly-gem",
    title: "Swarovski Navel Piercing",
    category: "Piercing",
    artist: "Sneha Verma",
    description: "Surgical-grade curved barbell navel piercing with double floating prong-set brilliant gems.",
    tags: ["Piercing", "Navel", "Belly Piercing", "Crystal", "Body Modification"],
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "industrial-scaffold",
    title: "Industrial Scaffold Bar",
    category: "Piercing",
    artist: "Sneha Verma",
    description: "Anatomically mapped dual cartilage industrial bar with mirror-polished implant-grade titanium barbell.",
    tags: ["Piercing", "Industrial", "Ear Cartilage", "Titanium", "Aseptic"],
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "daith-heart-clicker",
    title: "Daith Heart Clicker",
    category: "Piercing",
    artist: "Sneha Verma",
    description: "Intricate daith piercing with ornate beaded heart ring crafted in hypoallergenic titanium.",
    tags: ["Piercing", "Daith", "Ear Piercing", "Aesthetic", "Jewelry"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
  },
];

export const CLIENT_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    name: "Aman Verma",
    city: "Hisar",
    rating: 5,
    text: "Rohit did an amazing job on my sleeve tattoo. The attention to detail is unreal. Highly recommended!",
    tattooType: "Full Arm Realism Sleeve",
  },
  {
    id: "r2",
    name: "Neha Sharma",
    city: "Hisar",
    rating: 5,
    text: "Very professional, friendly and skilled. The whole experience was smooth and comfortable.",
    tattooType: "Fine Line Collarbone",
  },
  {
    id: "r3",
    name: "Sahil Rajput",
    city: "Hisar",
    rating: 5,
    text: "Best tattoo artist in Hisar! His creativity and finishing are top-notch.",
    tattooType: "Custom Tiger Realism",
  },
  {
    id: "r4",
    name: "Pooja Bishnoi",
    city: "Hisar",
    rating: 5,
    text: "Got permanent lip blush and eyebrow microblading done. Absolutely stunning results, looks completely natural!",
    tattooType: "Cosmetic Brow & Lip Blush",
  },
  {
    id: "r5",
    name: "Deepak Mor",
    city: "Rohtak",
    rating: 5,
    text: "Enrolled in the Phoenix Tattoo Academy 3-month masterclass. Hands-on training with actual machines and clients. Rohit sir is a mentor like no other.",
    tattooType: "Academy Graduate",
  },
];

export const STUDIO_PHOTOS = {
  heroInking: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80",
  studioReception: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1000&q=80",
  studioWorkstation: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1000&q=80",
  academyStudentSketching: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80",
  rohitInking: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1000&q=80",
  rohitPortrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
};

export interface VideoGalleryItem {
  id: string;
  title: string;
  category: string; // 'Tattoo Sessions' | 'Client Reveals' | 'Piercing Work' | 'Behind The Scenes' | 'Cover-up Process' | 'Academy'
  artist: string;
  videoUrl: string;
  thumbnailUrl: string;
  posterUrl?: string;
  duration: string;
  description: string;
  tags: string[];
  views?: string;
  likes?: number;
  featured?: boolean;
}

export const DEFAULT_VIDEO_ITEMS: VideoGalleryItem[] = [
  {
    id: "vid-1",
    title: "Hyper-Realism Lion & Compass Sleeve Session",
    category: "Tattoo Sessions",
    artist: "Rohit Sharma",
    videoUrl: "/uploads/studio_bg_video.mp4#t=5.5",
    thumbnailUrl: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80",
    duration: "1:24",
    description: "Multi-hour black and grey realism session with Rohit Sharma focusing on fine fur texture, whisker highlights, and vintage compass shading.",
    tags: ["Realism", "Black & Grey", "Sleeve", "Rohit Sharma"],
    views: "18.4K",
    likes: 1420,
    featured: true,
  },
  {
    id: "vid-2",
    title: "Detailed Shading & Precision Needle Ink Dip",
    category: "Tattoo Sessions",
    artist: "Rohit Sharma",
    videoUrl: "/uploads/studio_bg_video.mp4#t=2.8",
    thumbnailUrl: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=900&q=80",
    duration: "0:56",
    description: "Close-up macro lens demonstration of needle depth control, zero skin trauma technique, and charcoal grey wash saturation.",
    tags: ["Macro", "Technique", "Rotary Machine", "Needles"],
    views: "14.2K",
    likes: 980,
    featured: false,
  },
  {
    id: "vid-3",
    title: "Client Reveal & Protective Dermalize Film Application",
    category: "Client Reveals",
    artist: "Sneha Verma",
    videoUrl: "/uploads/studio_bg_video.mp4#t=6.4",
    thumbnailUrl: "/uploads/repairs/compass-rose.jpg",
    duration: "1:10",
    description: "The emotional moment when our client sees their finished backpiece for the first time in the full-length studio mirror.",
    tags: ["Client Reveal", "Fresh Ink", "Aftercare", "Dermalize"],
    views: "22.7K",
    likes: 2150,
    featured: true,
  },
  {
    id: "vid-4",
    title: "Aseptic Needle Ear Piercing & Titanium Cluster Setup",
    category: "Piercing Work",
    artist: "Sneha Verma",
    videoUrl: "/uploads/studio_bg_video.mp4#t=0.1",
    thumbnailUrl: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=900&q=80",
    duration: "0:48",
    description: "Single-use catheter needle technique with ASTM F-136 implant-grade titanium flat back crystal cluster. Zero piercing guns used ever.",
    tags: ["Piercing", "Ear Curation", "Titanium", "Sterile"],
    views: "11.9K",
    likes: 870,
    featured: false,
  },
  {
    id: "vid-5",
    title: "Botanical Wildflower & Single-Needle Line Flow",
    category: "Behind The Scenes",
    artist: "Sneha Verma",
    videoUrl: "/uploads/studio_bg_video.mp4#t=7.0",
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
    duration: "1:05",
    description: "Sneha executing delicate single-needle curves for a collarbone botanical branch. Crisp linework that heals like pencil on paper.",
    tags: ["Fine Line", "Floral", "Single Needle", "Sneha Verma"],
    views: "16.1K",
    likes: 1340,
    featured: false,
  },
  {
    id: "vid-6",
    title: "Academy Masterclass: Needle Mechanics & Voltage Tuning",
    category: "Academy",
    artist: "Rohit Sharma",
    videoUrl: "/uploads/studio_bg_video.mp4#t=3.7",
    thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
    duration: "1:42",
    description: "Live session inside the Phoenix Tattoo Academy training bay in Hisar, covering voltage modulation, hand speed sync, and artificial skin practice.",
    tags: ["Academy", "Training", "Apprenticeship", "Mentorship"],
    views: "9.8K",
    likes: 760,
    featured: false,
  },
];
