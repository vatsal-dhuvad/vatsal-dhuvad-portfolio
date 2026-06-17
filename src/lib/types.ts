export interface Profile {
  name: string;
  title: string;
  taglines: string[];
  email: string;
  phone: string;
  location: string;
  heroBio: string;
  bio: string;
  resumeBase64: string;
  resumeFileName: string;
  photoBase64: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  github: string;
  demo: string;
  image: string;
}

export interface Certificate {
  id: string;
  name: string;
  org: string;
  date: string;
  link: string;
  image: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
  grade: string;
  description: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  whatsapp: string;
  kaggle: string;
  leetcode: string;
  twitter: string;
  instagram: string;
  email: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
  read: boolean;
}

export interface PortfolioData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  education: Education[];
  experience: Experience[];
  achievements: Achievement[];
  socialLinks: SocialLinks;
  messages: Message[];
}
