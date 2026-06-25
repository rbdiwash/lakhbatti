export const site = {
  name: "Lakhbatti",
  tagline: "Cleaning & Gardening Services",
  description:
    "Affordable, reliable cleaning and gardening services across Sydney. Book trusted professionals for your home or office today.",
  phone: "+61 410 479 969",
  email: "info@lakhbatti.com",
  address: "Marion Street, Bankstown, New South Wales, Australia",
  hours: "Mon – Fri: 9am – 5pm",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export type Project = {
  title: string;
  description: string;
  image: string;
};

export const projects: Project[] = [
  {
    title: "Home Cleaning",
    description:
      "Detailed top-to-bottom cleaning that leaves homes fresh and spotless.",
    image: "/images/portfolio/home-cleaning.png",
  },
  {
    title: "Carpet Cleaning",
    description:
      "Deep steam cleaning that lifts stains and revives tired carpets.",
    image: "/images/portfolio/carpet-cleaning.png",
  },
  {
    title: "Office Cleaning",
    description:
      "Reliable commercial cleaning for healthy, professional workspaces.",
    image: "/images/portfolio/office-cleaning.png",
  },
];

export type Service = {
  title: string;
  description: string;
  category: "Cleaning" | "Gardening";
  image: string;
};

export const services: Service[] = [
  {
    title: "General House Cleaning",
    description:
      "Routine top-to-bottom cleaning that keeps your home fresh, tidy, and welcoming every week.",
    category: "Cleaning",
    image: "/images/portfolio/home-cleaning.png",
  },
  {
    title: "End of Lease Cleaning",
    description:
      "Thorough bond cleaning designed to meet inspection standards and get your deposit back.",
    category: "Cleaning",
    image: "/images/services/more-services.png",
  },
  {
    title: "Carpet Cleaning",
    description:
      "Deep steam and stain treatment that lifts dirt and revives the look of your carpets.",
    category: "Cleaning",
    image: "/images/portfolio/carpet-cleaning.png",
  },
  {
    title: "Kitchen & Bathroom",
    description:
      "Detailed sanitising of kitchens, bathrooms, and toilets for spotless, hygienic spaces.",
    category: "Cleaning",
    image: "/images/portfolio/office-cleaning.png",
  },
  {
    title: "Window Cleaning",
    description:
      "Streak-free interior and exterior window cleaning that brightens every room.",
    category: "Cleaning",
    image: "/images/services/more-services.png",
  },
  {
    title: "Office Cleaning",
    description:
      "Flexible commercial cleaning that keeps your workplace clean, healthy, and professional.",
    category: "Cleaning",
    image: "/images/portfolio/office-cleaning.png",
  },
  {
    title: "Lawn Mowing",
    description:
      "Regular mowing and edging to keep your lawn neat, even, and healthy all season.",
    category: "Gardening",
    image: "/images/services/more-services.png",
  },
  {
    title: "Light Gardening",
    description:
      "Weeding, pruning, and tidy-ups that keep your garden looking cared for year-round.",
    category: "Gardening",
    image: "/images/portfolio/home-cleaning.png",
  },
  {
    title: "Landscaping",
    description:
      "Thoughtful landscaping and garden care that enhances the beauty of your outdoor space.",
    category: "Gardening",
    image: "/images/services/more-services.png",
  },
];
