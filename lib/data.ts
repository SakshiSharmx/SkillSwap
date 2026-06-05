// Shared mock data + types for the SkillSwap prototype UI.

export type Mode = "online" | "in-person" | "both"

export type Category =
  | "Development"
  | "Design"
  | "Languages"
  | "Music"
  | "Cooking"
  | "Fitness"
  | "Tutoring"
  | "Writing"
  | "Photography"
  | "Crafts"

export const CATEGORIES: { name: Category; blurb: string; count: number }[] = [
  { name: "Development", blurb: "Web, mobile & data", count: 312 },
  { name: "Design", blurb: "Brand, UI & illustration", count: 248 },
  { name: "Languages", blurb: "Conversation & exam prep", count: 196 },
  { name: "Music", blurb: "Instruments & production", count: 134 },
  { name: "Cooking", blurb: "Home recipes & baking", count: 121 },
  { name: "Fitness", blurb: "Strength, yoga & runs", count: 98 },
  { name: "Tutoring", blurb: "Maths, science & more", count: 287 },
  { name: "Writing", blurb: "Essays, copy & editing", count: 87 },
  { name: "Photography", blurb: "Portraits & editing", count: 76 },
  { name: "Crafts", blurb: "Knit, wood & ceramics", count: 64 },
]

export type Person = {
  id: string
  name: string
  handle: string
  avatar: string
  area: string
  community: string
  rating: number
  reviews: number
  completedSwaps: number
  responseRate: number
  verified: boolean
  bio: string
  memberSince: string
  skillsOffered: string[]
  skillsWanted: string[]
}

export const PEOPLE: Record<string, Person> = {
  maya: {
    id: "maya",
    name: "Maya Okonkwo",
    handle: "mayao",
    avatar: "/avatars/maya.png",
    area: "Greenpoint, Brooklyn",
    community: "Pratt Institute",
    rating: 4.9,
    reviews: 38,
    completedSwaps: 41,
    responseRate: 98,
    verified: true,
    bio: "Product designer who loves teaching the fundamentals of brand and type. Always trying to pick up new technical skills in exchange.",
    memberSince: "Mar 2023",
    skillsOffered: ["Logo design", "Brand identity", "Figma basics"],
    skillsWanted: ["React", "Webflow", "Spanish"],
  },
  dev: {
    id: "dev",
    name: "Devon Reyes",
    handle: "devr",
    avatar: "/avatars/devon.png",
    area: "Mission District, SF",
    community: "Neighborhood",
    rating: 4.8,
    reviews: 52,
    completedSwaps: 60,
    responseRate: 95,
    verified: true,
    bio: "Front-end engineer. Happy to pair on React or TypeScript. Hoping to finally learn to cook something other than pasta.",
    memberSince: "Jan 2022",
    skillsOffered: ["React", "TypeScript", "Interview prep"],
    skillsWanted: ["Cooking", "Guitar", "Photography"],
  },
  amira: {
    id: "amira",
    name: "Amira Haddad",
    handle: "amirah",
    avatar: "/avatars/amira.png",
    area: "Camden, London",
    community: "UCL",
    rating: 5.0,
    reviews: 21,
    completedSwaps: 19,
    responseRate: 100,
    verified: true,
    bio: "Native Arabic speaker and amateur chef. Teaching home cooking and conversational Arabic while learning design.",
    memberSince: "Sep 2023",
    skillsOffered: ["Arabic", "Home cooking", "Meal prep"],
    skillsWanted: ["UI design", "Branding", "Photography"],
  },
  tomas: {
    id: "tomas",
    name: "Tomás Lindqvist",
    handle: "tomasl",
    avatar: "/avatars/tomas.png",
    area: "Södermalm, Stockholm",
    community: "Neighborhood",
    rating: 4.7,
    reviews: 30,
    completedSwaps: 33,
    responseRate: 91,
    verified: false,
    bio: "Studio guitarist and producer. I teach guitar and basic music production. Looking to get fitter this year.",
    memberSince: "Jun 2022",
    skillsOffered: ["Guitar", "Music production", "Mixing"],
    skillsWanted: ["Personal training", "Running coaching"],
  },
  priya: {
    id: "priya",
    name: "Priya Nair",
    handle: "priyan",
    avatar: "/avatars/priya.png",
    area: "Koramangala, Bangalore",
    community: "Christ University",
    rating: 4.9,
    reviews: 44,
    completedSwaps: 47,
    responseRate: 97,
    verified: true,
    bio: "Maths tutor and certified yoga instructor. I love helping people feel calmer and more confident with numbers.",
    memberSince: "Feb 2023",
    skillsOffered: ["Calculus tutoring", "Yoga", "Meditation"],
    skillsWanted: ["French", "Video editing"],
  },
  leo: {
    id: "leo",
    name: "Leo Martins",
    handle: "leom",
    avatar: "/avatars/leo.png",
    area: "Lapa, Lisbon",
    community: "Neighborhood",
    rating: 4.6,
    reviews: 18,
    completedSwaps: 15,
    responseRate: 88,
    verified: false,
    bio: "Photographer and editor. I shoot portraits and teach Lightroom. Trying to learn enough code to build my own site.",
    memberSince: "Nov 2023",
    skillsOffered: ["Portrait photography", "Lightroom", "Photo editing"],
    skillsWanted: ["HTML & CSS", "Webflow"],
  },
}

export type Offer = {
  id: string
  title: string
  category: Category
  ownerId: string
  offers: string
  wants: string
  mode: Mode
  location: string
  level: "Beginner" | "Intermediate" | "Advanced"
  tags: string[]
  description: string
  terms: string
  availability: string
  postedAt: string
  views: number
  saves: number
  requests: number
  status: "active" | "draft" | "completed" | "expired" | "paused"
}

export const OFFERS: Offer[] = [
  {
    id: "react-for-logo",
    title: "I'll teach you React, looking for a logo",
    category: "Development",
    ownerId: "dev",
    offers: "React & TypeScript",
    wants: "Logo design",
    mode: "online",
    location: "Online",
    level: "Intermediate",
    tags: ["React", "Frontend", "TypeScript"],
    description:
      "I've shipped React apps professionally for six years. Over a few sessions I'll get you comfortable with components, hooks, and state — enough to build a real project. In return I'd love a clean wordmark for a small side project.",
    terms: "Roughly 3 sessions of 1 hour each, swapped for one finished logo with two revisions.",
    availability: "Weekday evenings, EST",
    postedAt: "2 days ago",
    views: 184,
    saves: 23,
    requests: 6,
    status: "active",
  },
  {
    id: "arabic-for-design",
    title: "Conversational Arabic in exchange for UI help",
    category: "Languages",
    ownerId: "amira",
    offers: "Arabic conversation",
    wants: "UI design feedback",
    mode: "both",
    location: "Camden, London",
    level: "Beginner",
    tags: ["Arabic", "Languages", "Conversation"],
    description:
      "Native speaker offering relaxed conversational Arabic, tailored to whatever you need — travel, family, or exams. I'm building a small app and would love an experienced eye on my screens.",
    terms: "Weekly 45-min conversation sessions traded for a design review each week.",
    availability: "Weekends, GMT",
    postedAt: "5 hours ago",
    views: 92,
    saves: 14,
    requests: 3,
    status: "active",
  },
  {
    id: "guitar-for-training",
    title: "Guitar lessons, want a running coach",
    category: "Music",
    ownerId: "tomas",
    offers: "Guitar & theory",
    wants: "Running coaching",
    mode: "in-person",
    location: "Södermalm, Stockholm",
    level: "Beginner",
    tags: ["Guitar", "Music", "Beginner-friendly"],
    description:
      "From your first chords to playing full songs. I keep lessons practical and fun. I'm training for a half marathon and could really use someone to structure my runs and keep me honest.",
    terms: "One guitar lesson per week for one coached run per week.",
    availability: "Tuesday & Thursday mornings",
    postedAt: "1 day ago",
    views: 67,
    saves: 9,
    requests: 2,
    status: "active",
  },
  {
    id: "maths-for-french",
    title: "Calculus tutoring for French practice",
    category: "Tutoring",
    ownerId: "priya",
    offers: "Calculus & maths",
    wants: "French conversation",
    mode: "online",
    location: "Online",
    level: "Advanced",
    tags: ["Maths", "Calculus", "Exam prep"],
    description:
      "Stuck on limits, derivatives, or integrals? I break things down patiently until they click. I'm prepping for a trip to Lyon and want regular spoken French practice in return.",
    terms: "Two tutoring sessions traded for two French chats each week.",
    availability: "Flexible, IST",
    postedAt: "3 days ago",
    views: 143,
    saves: 31,
    requests: 8,
    status: "active",
  },
  {
    id: "photo-for-code",
    title: "Portrait shoot for help building my website",
    category: "Photography",
    ownerId: "leo",
    offers: "Portrait photography",
    wants: "HTML & CSS",
    mode: "in-person",
    location: "Lapa, Lisbon",
    level: "Intermediate",
    tags: ["Photography", "Portraits", "Editing"],
    description:
      "A relaxed portrait session — great for profiles, portfolios, or just nice photos of yourself. In exchange I'd love hands-on help turning my design into a simple personal site.",
    terms: "One edited portrait session for ~4 hours of paired coding.",
    availability: "Weekend afternoons",
    postedAt: "6 days ago",
    views: 51,
    saves: 7,
    requests: 1,
    status: "active",
  },
  {
    id: "branding-for-react",
    title: "Brand identity in exchange for React mentoring",
    category: "Design",
    ownerId: "maya",
    offers: "Brand identity",
    wants: "React mentoring",
    mode: "online",
    location: "Online",
    level: "Advanced",
    tags: ["Branding", "Design", "Figma"],
    description:
      "I'll help you shape a cohesive brand — logo, colors, type, and a simple system you can actually use. I want to level up my React so I can prototype my own ideas.",
    terms: "A small brand package for a series of React mentoring calls.",
    availability: "Weekday afternoons, EST",
    postedAt: "4 days ago",
    views: 209,
    saves: 41,
    requests: 11,
    status: "active",
  },
  {
    id: "cooking-for-photography",
    title: "Home cooking sessions for photo editing tips",
    category: "Cooking",
    ownerId: "amira",
    offers: "Home cooking",
    wants: "Photo editing",
    mode: "in-person",
    location: "Camden, London",
    level: "Beginner",
    tags: ["Cooking", "Baking", "Meal prep"],
    description:
      "Learn a handful of weeknight dishes you'll actually make again. We cook together and you take the leftovers. I'd love to learn how to edit my food photos so they look as good as they taste.",
    terms: "Two cooking sessions for an editing walkthrough.",
    availability: "Sunday afternoons",
    postedAt: "1 week ago",
    views: 88,
    saves: 19,
    requests: 4,
    status: "active",
  },
  {
    id: "yoga-for-video",
    title: "Yoga & meditation for video editing",
    category: "Fitness",
    ownerId: "priya",
    offers: "Yoga & meditation",
    wants: "Video editing",
    mode: "both",
    location: "Koramangala, Bangalore",
    level: "Beginner",
    tags: ["Yoga", "Wellness", "Beginner-friendly"],
    description:
      "Gentle, beginner-friendly yoga and breathing practices to help you reset. I'm starting a small channel and need someone to teach me the basics of editing.",
    terms: "Weekly yoga session for a weekly editing lesson.",
    availability: "Early mornings, IST",
    postedAt: "2 weeks ago",
    views: 60,
    saves: 12,
    requests: 2,
    status: "active",
  },
]

export function getOffer(id: string) {
  return OFFERS.find((o) => o.id === id)
}

export function getPerson(id: string) {
  return PEOPLE[id]
}

export type RequestStatus = "incoming" | "sent" | "accepted" | "rejected" | "negotiating"

export type SwapRequest = {
  id: string
  offerId: string
  fromId: string
  toId: string
  message: string
  proposed: string
  status: RequestStatus
  time: string
}

export const REQUESTS: SwapRequest[] = [
  {
    id: "r1",
    offerId: "react-for-logo",
    fromId: "maya",
    toId: "dev",
    message: "Hi Devon! I'd love to learn React. I can design a clean wordmark and give you two rounds of revisions.",
    proposed: "Logo design ↔ React & TypeScript",
    status: "incoming",
    time: "2h ago",
  },
  {
    id: "r2",
    offerId: "react-for-logo",
    fromId: "leo",
    toId: "dev",
    message: "Could we swap a portrait session for some React help instead of a logo?",
    proposed: "Portrait photography ↔ React & TypeScript",
    status: "negotiating",
    time: "1d ago",
  },
  {
    id: "r3",
    offerId: "branding-for-react",
    fromId: "dev",
    toId: "maya",
    message: "Happy to mentor you through React fundamentals in exchange for the brand work. When are you free?",
    proposed: "React mentoring ↔ Brand identity",
    status: "sent",
    time: "3h ago",
  },
  {
    id: "r4",
    offerId: "maths-for-french",
    fromId: "priya",
    toId: "amira",
    message: "Your French sounds great — shall we start next week?",
    proposed: "Calculus tutoring ↔ French conversation",
    status: "accepted",
    time: "2d ago",
  },
  {
    id: "r5",
    offerId: "guitar-for-training",
    fromId: "dev",
    toId: "tomas",
    message: "I can't commit to the morning slots unfortunately.",
    proposed: "Running coaching ↔ Guitar lessons",
    status: "rejected",
    time: "4d ago",
  },
]

export type Notification = {
  id: string
  type: "request" | "message" | "review" | "swap" | "system"
  title: string
  body: string
  time: string
  read: boolean
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "request",
    title: "New swap request",
    body: "Maya Okonkwo wants to swap logo design for your React lessons.",
    time: "2h ago",
    read: false,
  },
  {
    id: "n2",
    type: "message",
    title: "New message from Amira",
    body: "Sounds good — let's start Sunday afternoon?",
    time: "5h ago",
    read: false,
  },
  {
    id: "n3",
    type: "review",
    title: "Priya left you a review",
    body: "\"Patient, clear and genuinely kind. Five stars.\"",
    time: "1d ago",
    read: true,
  },
  {
    id: "n4",
    type: "swap",
    title: "Swap completed",
    body: "Your swap with Tomás Lindqvist is marked complete. Leave a review?",
    time: "2d ago",
    read: true,
  },
  {
    id: "n5",
    type: "system",
    title: "Verification approved",
    body: "Your student email has been verified. Your profile now shows a verified badge.",
    time: "5d ago",
    read: true,
  },
]

export type Conversation = {
  id: string
  personId: string
  offerId: string
  preview: string
  time: string
  unread: number
}

export const CONVERSATIONS: Conversation[] = [
  { id: "c1", personId: "maya", offerId: "react-for-logo", preview: "Perfect, talk soon!", time: "2h", unread: 2 },
  { id: "c2", personId: "amira", offerId: "arabic-for-design", preview: "Sounds good — let's start Sunday?", time: "5h", unread: 0 },
  { id: "c3", personId: "priya", offerId: "maths-for-french", preview: "I've sent over the schedule.", time: "1d", unread: 0 },
  { id: "c4", personId: "tomas", offerId: "guitar-for-training", preview: "Thanks for the session today.", time: "3d", unread: 0 },
]

export type ChatMessage = {
  id: string
  fromMe: boolean
  text: string
  time: string
}

export const THREAD: ChatMessage[] = [
  { id: "m1", fromMe: false, text: "Hi Devon! I saw your React offer — I'd love to swap a logo for some lessons.", time: "9:02" },
  { id: "m2", fromMe: true, text: "Hey Maya! That works perfectly, I've been meaning to get a proper wordmark.", time: "9:05" },
  { id: "m3", fromMe: false, text: "Great. Could you do three 1-hour sessions? I'll do the logo with two revision rounds.", time: "9:07" },
  { id: "m4", fromMe: true, text: "Deal. How about Tuesday and Thursday evenings to start?", time: "9:09" },
  { id: "m5", fromMe: false, text: "Perfect, talk soon!", time: "9:10" },
]

export type Review = {
  id: string
  fromId: string
  rating: number
  text: string
  time: string
  skill: string
}

export const REVIEWS: Review[] = [
  {
    id: "rv1",
    fromId: "priya",
    rating: 5,
    text: "Maya completely reshaped how I think about my brand. Calm, clear, and so generous with feedback.",
    time: "2 weeks ago",
    skill: "Brand identity",
  },
  {
    id: "rv2",
    fromId: "tomas",
    rating: 5,
    text: "Delivered a logo I genuinely love. Communicative the whole way through.",
    time: "1 month ago",
    skill: "Logo design",
  },
  {
    id: "rv3",
    fromId: "leo",
    rating: 4,
    text: "Really helpful Figma session. Would happily swap again.",
    time: "2 months ago",
    skill: "Figma basics",
  },
]

export const CURRENT_USER = PEOPLE.maya
