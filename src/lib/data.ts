import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { Message, PortfolioData } from "./types";

export const DEFAULT_DATA: PortfolioData = {
  profile: {
    name: "Vatsal Dhuvad",
    title: "Data Scientist | ML Engineer",
    taglines: ["Data Scientist", "ML Engineer", "AI Enthusiast", "Deep Learning Explorer"],
    email: "vatsaldhuvad23@gmail.com",
    phone: "919574788321",
    location: "Gujarat, India",
    heroBio: "I am a Computer Engineering student passionate about Data Science, Machine Learning, and Artificial Intelligence.",
    bio: "I am a Computer Engineering student passionate about Data Science, Machine Learning, and Artificial Intelligence. Currently pursuing my degree while gaining hands-on experience through internships. I enjoy building predictive models, exploring deep learning architectures, and turning raw data into actionable insights. My goal is to leverage AI to solve real-world problems and make data-driven decisions accessible to everyone.",
    resumeBase64: "",
    resumeFileName: "",
    photoBase64: "",
  },
  skills: [
    { id: "s1", name: "Python", level: 90, category: "Programming" },
    { id: "s2", name: "SQL", level: 85, category: "Programming" },
    { id: "s3", name: "Java", level: 65, category: "Programming" },
    { id: "s4", name: "R", level: 55, category: "Programming" },
    { id: "s5", name: "Machine Learning", level: 85, category: "ML & AI" },
    { id: "s6", name: "Deep Learning", level: 75, category: "ML & AI" },
    { id: "s7", name: "Natural Language Processing", level: 70, category: "ML & AI" },
    { id: "s8", name: "Computer Vision", level: 65, category: "ML & AI" },
    { id: "s9", name: "Pandas", level: 90, category: "Data Science" },
    { id: "s10", name: "NumPy", level: 88, category: "Data Science" },
    { id: "s11", name: "Scikit-learn", level: 85, category: "Data Science" },
    { id: "s12", name: "TensorFlow", level: 72, category: "Data Science" },
    { id: "s13", name: "PyTorch", level: 68, category: "Data Science" },
    { id: "s14", name: "Matplotlib / Seaborn", level: 82, category: "Data Science" },
    { id: "s15", name: "Power BI", level: 70, category: "Tools" },
    { id: "s16", name: "Tableau", level: 65, category: "Tools" },
    { id: "s17", name: "Git & GitHub", level: 80, category: "Tools" },
    { id: "s18", name: "MySQL", level: 78, category: "Tools" },
    { id: "s19", name: "MongoDB", level: 60, category: "Tools" },
    { id: "s20", name: "Statistics", level: 80, category: "Data Science" },
  ],
  projects: [
    {
      id: "p1",
      title: "Sentiment Analysis Engine",
      description: "Built an NLP pipeline to analyze customer reviews and classify sentiments using BERT and traditional ML models. Achieved 92% accuracy on the test set.",
      technologies: ["Python", "BERT", "Scikit-learn", "NLTK", "Flask"],
      category: "NLP",
      github: "https://github.com/vatsaldhuvad",
      demo: "",
      image: "",
    },
    {
      id: "p2",
      title: "House Price Predictor",
      description: "Developed a regression model to predict house prices using multiple features. Applied feature engineering, handled missing values, and compared Linear Regression, Random Forest, and XGBoost models.",
      technologies: ["Python", "Pandas", "Scikit-learn", "XGBoost", "Matplotlib"],
      category: "ML",
      github: "https://github.com/vatsaldhuvad",
      demo: "",
      image: "",
    },
    {
      id: "p3",
      title: "Image Classification with CNN",
      description: "Designed a Convolutional Neural Network to classify images from the CIFAR-10 dataset. Implemented data augmentation, batch normalization, and dropout for improved generalization.",
      technologies: ["Python", "TensorFlow", "Keras", "OpenCV", "NumPy"],
      category: "Computer Vision",
      github: "https://github.com/vatsaldhuvad",
      demo: "",
      image: "",
    },
    {
      id: "p4",
      title: "Sales Forecasting Dashboard",
      description: "Created a time series forecasting model using ARIMA and Prophet to predict monthly sales. Built an interactive Power BI dashboard for visualization.",
      technologies: ["Python", "Prophet", "ARIMA", "Power BI", "Pandas"],
      category: "Data Analysis",
      github: "https://github.com/vatsaldhuvad",
      demo: "",
      image: "",
    },
    {
      id: "p5",
      title: "Movie Recommendation System",
      description: "Built a collaborative filtering recommendation engine using matrix factorization. Implemented both content-based and collaborative approaches.",
      technologies: ["Python", "Surprise", "Pandas", "Scikit-learn", "Streamlit"],
      category: "ML",
      github: "https://github.com/vatsaldhuvad",
      demo: "",
      image: "",
    },
  ],
  certificates: [
    { id: "c1", name: "Machine Learning Specialization", org: "Coursera — Stanford / Andrew Ng", date: "2025-06", link: "", image: "" },
    { id: "c2", name: "Deep Learning Specialization", org: "Coursera — deeplearning.ai", date: "2025-04", link: "", image: "" },
    { id: "c3", name: "Python for Data Science", org: "IBM — Coursera", date: "2025-02", link: "", image: "" },
    { id: "c4", name: "SQL for Data Science", org: "UC Davis — Coursera", date: "2025-01", link: "", image: "" },
    { id: "c5", name: "Data Visualization with Tableau", org: "Coursera", date: "2024-11", link: "", image: "" },
    { id: "c6", name: "AWS Cloud Practitioner", org: "Amazon Web Services", date: "2025-03", link: "", image: "" },
    { id: "c7", name: "TensorFlow Developer Certificate", org: "Google", date: "2025-05", link: "", image: "" },
    { id: "c8", name: "Power BI Data Analyst", org: "Microsoft", date: "2024-12", link: "", image: "" },
    { id: "c9", name: "Statistics for Data Science", org: "Great Learning", date: "2024-10", link: "", image: "" },
    { id: "c10", name: "Git & GitHub Masterclass", org: "Udemy", date: "2024-09", link: "", image: "" },
  ],
  education: [
    {
      id: "e1",
      degree: "B.E. in Computer Engineering",
      institution: "Your University Name",
      startYear: "2022",
      endYear: "2026",
      grade: "8.5 CGPA",
      description: "Focused on Machine Learning, Data Science, and Artificial Intelligence coursework.",
    },
  ],
  experience: [
    {
      id: "ex1",
      role: "Data Science Intern",
      company: "Your Company Name",
      duration: "Jan 2026 — Present",
      description: "Working on ML model development, data analysis, and building predictive dashboards. Collaborating with the data engineering team to build ETL pipelines.",
      technologies: ["Python", "Pandas", "Scikit-learn", "SQL", "Power BI"],
    },
  ],
  achievements: [
    { id: "a1", title: "Kaggle Competitions Participant", description: "Participated in multiple Kaggle competitions focusing on NLP and tabular data challenges.", icon: "trophy" },
    { id: "a2", title: "Hackathon Finalist", description: "Reached the finals of a university-level hackathon with an AI-based project.", icon: "code" },
    { id: "a3", title: "Open Source Contributor", description: "Contributed to popular Python data science libraries on GitHub.", icon: "git-branch" },
    { id: "a4", title: "Academic Topper", description: "Secured top rank in Data Structures & Algorithms and ML coursework.", icon: "star" },
  ],
  socialLinks: {
    github: "https://github.com/vatsaldhuvad",
    linkedin: "https://linkedin.com/in/vatsaldhuvad",
    whatsapp: "919574788321",
    kaggle: "https://kaggle.com/vatsaldhuvad",
    leetcode: "",
    twitter: "",
    instagram: "",
    email: "vatsaldhuvad23@gmail.com",
  },
};

const STORAGE_KEY = "portfolio_data";
const ADMIN_KEY = "portfolio_admin";
export const DEFAULT_PASSWORD = "Vatsal2253@";

function cloneDefaultData(): PortfolioData {
  return JSON.parse(JSON.stringify(DEFAULT_DATA)) as PortfolioData;
}

function heroBioFromBio(bio: string): string {
  const trimmed = bio.trim();
  if (trimmed.length <= 170) return trimmed;
  return `${trimmed.slice(0, 170).trim()}...`;
}

function normalizePortfolioData(raw: Partial<PortfolioData>): PortfolioData {
  const profile = { ...DEFAULT_DATA.profile, ...(raw.profile ?? {}) };
  if (!profile.heroBio?.trim()) profile.heroBio = heroBioFromBio(profile.bio || DEFAULT_DATA.profile.bio);

  const socialLinks = { ...DEFAULT_DATA.socialLinks, ...(raw.socialLinks ?? {}) };
  if (!socialLinks.whatsapp?.trim()) socialLinks.whatsapp = DEFAULT_DATA.socialLinks.whatsapp;

  return {
    ...cloneDefaultData(),
    ...raw,
    profile,
    socialLinks,
  };
}

export function getAllData(): PortfolioData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const normalized = normalizePortfolioData(JSON.parse(stored));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch {
      // corrupt, reset
    }
  }
  const defaults = cloneDefaultData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveAllData(data: PortfolioData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getData<K extends keyof PortfolioData>(section: K): PortfolioData[K] {
  return getAllData()[section];
}

export function setData<K extends keyof PortfolioData>(section: K, value: PortfolioData[K]): void {
  const all = getAllData();
  all[section] = value;
  saveAllData(all);
}

function generateId(): string {
  return "id_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
}

export function addItem<T extends { id: string }>(section: keyof PortfolioData, item: Omit<T, "id">): T {
  const all = getAllData();
  const newItem = { ...item, id: generateId() } as T;
  (all[section] as unknown as T[]).push(newItem);
  saveAllData(all);
  return newItem;
}

export function updateItem<T extends { id: string }>(section: keyof PortfolioData, id: string, updatedItem: Omit<T, "id">): void {
  const all = getAllData();
  const arr = all[section] as unknown as T[];
  const index = arr.findIndex((i) => i.id === id);
  if (index !== -1) {
    arr[index] = { ...updatedItem, id } as T;
    saveAllData(all);
  }
}

export function deleteItem(section: keyof PortfolioData, id: string): void {
  const all = getAllData();
  (all as Record<keyof PortfolioData, unknown>)[section] = (all[section] as unknown as { id: string }[]).filter((i) => i.id !== id);
  saveAllData(all);
}

export function exportData(): void {
  const data = getAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data.profile || !data.skills || !data.projects) throw new Error("Invalid format");
    saveAllData(normalizePortfolioData(data));
    return true;
  } catch {
    return false;
  }
}

export function resetToDefaults(): void {
  saveAllData(cloneDefaultData());
}

export function getAdminPassword(): string {
  const stored = localStorage.getItem(ADMIN_KEY);
  if (!stored || stored === "vatsal2024") {
    localStorage.setItem(ADMIN_KEY, DEFAULT_PASSWORD);
    return DEFAULT_PASSWORD;
  }
  return stored;
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(ADMIN_KEY, newPassword);
}

export function verifyPassword(input: string): boolean {
  return input === getAdminPassword();
}

/* ─── MESSAGES ─────────────────────────────────────────── */
const MESSAGES_COLLECTION = "contactMessages";

function fieldToString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function sentAtToIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value) {
    const toDate = (value as { toDate?: () => Date }).toDate;
    if (typeof toDate === "function") return toDate().toISOString();
  }
  return new Date().toISOString();
}

function messageFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>): Message {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: fieldToString(data.name),
    email: fieldToString(data.email),
    subject: fieldToString(data.subject),
    message: fieldToString(data.message),
    sentAt: sentAtToIso(data.sentAt),
    read: data.read === true,
  };
}

export async function getMessages(): Promise<Message[]> {
  const q = query(collection(db, MESSAGES_COLLECTION), orderBy("sentAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(messageFromSnapshot);
}

export async function addMessage(msg: Omit<Message, "id" | "sentAt" | "read">): Promise<void> {
  await addDoc(collection(db, MESSAGES_COLLECTION), {
    name: msg.name.trim(),
    email: msg.email.trim(),
    subject: msg.subject.trim(),
    message: msg.message.trim(),
    sentAt: serverTimestamp(),
    read: false,
  });
}

export async function markMessageRead(id: string): Promise<void> {
  await updateDoc(doc(db, MESSAGES_COLLECTION, id), { read: true });
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, MESSAGES_COLLECTION, id));
}
