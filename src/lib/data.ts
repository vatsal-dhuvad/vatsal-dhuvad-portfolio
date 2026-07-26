import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";

import { db } from "./firebase";

import type {
  Certificate,
  Message,
  PortfolioData,
  Skill,
  SkillProficiency,
} from "./types";

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
    { id: "s1", name: "Python", proficiency: "Advanced", category: "Programming" },
    { id: "s2", name: "SQL", proficiency: "Advanced", category: "Programming" },
    { id: "s3", name: "Java", proficiency: "Intermediate", category: "Programming" },
    { id: "s4", name: "R", proficiency: "Learning", category: "Programming" },
    { id: "s5", name: "Machine Learning", proficiency: "Advanced", category: "ML & AI" },
    { id: "s6", name: "Deep Learning", proficiency: "Intermediate", category: "ML & AI" },
    { id: "s7", name: "Natural Language Processing", proficiency: "Intermediate", category: "ML & AI" },
    { id: "s8", name: "Computer Vision", proficiency: "Intermediate", category: "ML & AI" },
    { id: "s9", name: "Pandas", proficiency: "Advanced", category: "Data Science" },
    { id: "s10", name: "NumPy", proficiency: "Advanced", category: "Data Science" },
    { id: "s11", name: "Scikit-learn", proficiency: "Advanced", category: "Data Science" },
    { id: "s12", name: "TensorFlow", proficiency: "Intermediate", category: "Data Science" },
    { id: "s13", name: "PyTorch", proficiency: "Intermediate", category: "Data Science" },
    { id: "s14", name: "Matplotlib / Seaborn", proficiency: "Advanced", category: "Data Science" },
    { id: "s15", name: "Power BI", proficiency: "Intermediate", category: "Tools" },
    { id: "s16", name: "Tableau", proficiency: "Intermediate", category: "Tools" },
    { id: "s17", name: "Git & GitHub", proficiency: "Advanced", category: "Tools" },
    { id: "s18", name: "MySQL", proficiency: "Intermediate", category: "Tools" },
    { id: "s19", name: "MongoDB", proficiency: "Intermediate", category: "Tools" },
    { id: "s20", name: "Statistics", proficiency: "Advanced", category: "Data Science" },
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
    { id: "c1", name: "Machine Learning Specialization", org: "Coursera — Stanford / Andrew Ng", date: "2025-06", certificateUrl: "", link: "", image: "" },
    { id: "c2", name: "Deep Learning Specialization", org: "Coursera — deeplearning.ai", date: "2025-04", certificateUrl: "", link: "", image: "" },
    { id: "c3", name: "Python for Data Science", org: "IBM — Coursera", date: "2025-02", certificateUrl: "", link: "", image: "" },
    { id: "c4", name: "SQL for Data Science", org: "UC Davis — Coursera", date: "2025-01", certificateUrl: "", link: "", image: "" },
    { id: "c5", name: "Data Visualization with Tableau", org: "Coursera", date: "2024-11", certificateUrl: "", link: "", image: "" },
    { id: "c6", name: "AWS Cloud Practitioner", org: "Amazon Web Services", date: "2025-03", certificateUrl: "", link: "", image: "" },
    { id: "c7", name: "TensorFlow Developer Certificate", org: "Google", date: "2025-05", certificateUrl: "", link: "", image: "" },
    { id: "c8", name: "Power BI Data Analyst", org: "Microsoft", date: "2024-12", certificateUrl: "", link: "", image: "" },
    { id: "c9", name: "Statistics for Data Science", org: "Great Learning", date: "2024-10", certificateUrl: "", link: "", image: "" },
    { id: "c10", name: "Git & GitHub Masterclass", org: "Udemy", date: "2024-09", certificateUrl: "", link: "", image: "" },
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
  messages: [],
};

const STORAGE_KEY = "portfolio_data";
const PORTFOLIO_DOC = doc(db, "portfolio", "data");
const MESSAGES_COLLECTION = collection(db, "messages");

function cloneDefaultData(): PortfolioData {  
  return JSON.parse(JSON.stringify(DEFAULT_DATA)) as PortfolioData;
}

function heroBioFromBio(bio: string): string {
  const trimmed = bio.trim();
  if (trimmed.length <= 170) return trimmed;
  return `${trimmed.slice(0, 170).trim()}...`;
}

function levelToProficiency(level: unknown): SkillProficiency {
  if (typeof level !== "number" || !Number.isFinite(level)) return "Intermediate";
  if (level >= 80) return "Advanced";
  if (level >= 60) return "Intermediate";
  return "Learning";
}

function isSkillProficiency(value: unknown): value is SkillProficiency {
  return value === "Advanced" || value === "Intermediate" || value === "Learning";
}

type StoredSkill = Partial<Skill> & { level?: unknown };
type StoredCertificate = Partial<Certificate>;

function normalizeSkills(rawSkills: unknown): Skill[] {
  if (!Array.isArray(rawSkills)) return cloneDefaultData().skills;

  return rawSkills.map((skill, index) => {
    const stored = (skill && typeof skill === "object" ? skill : {}) as StoredSkill;
    return {
      id: typeof stored.id === "string" && stored.id ? stored.id : `s${index + 1}`,
      name: typeof stored.name === "string" ? stored.name : "",
      category: typeof stored.category === "string" && stored.category ? stored.category : "Other",
      proficiency: isSkillProficiency(stored.proficiency)
        ? stored.proficiency
        : levelToProficiency(stored.level),
    };
  });
}

function normalizeCertificates(rawCertificates: unknown): Certificate[] {
  if (!Array.isArray(rawCertificates)) return cloneDefaultData().certificates;

  return rawCertificates.map((certificate, index) => {
    const stored = (certificate && typeof certificate === "object" ? certificate : {}) as StoredCertificate;
    const link = typeof stored.link === "string" ? stored.link : "";
    const image = typeof stored.image === "string" ? stored.image : "";
    const certificateUrl = typeof stored.certificateUrl === "string" ? stored.certificateUrl : "";

    return {
      id: typeof stored.id === "string" && stored.id ? stored.id : `c${index + 1}`,
      name: typeof stored.name === "string" ? stored.name : "",
      org: typeof stored.org === "string" ? stored.org : "",
      date: typeof stored.date === "string" ? stored.date : "",
      certificateUrl: certificateUrl || link || image,
      link,
      image,
    };
  });
}

function normalizePortfolioData(raw: Partial<PortfolioData>): PortfolioData {
  const profile = { ...DEFAULT_DATA.profile, ...(raw.profile ?? {}) };
  if (!profile.heroBio?.trim()) profile.heroBio = heroBioFromBio(profile.bio || DEFAULT_DATA.profile.bio);

  const socialLinks = { ...DEFAULT_DATA.socialLinks, ...(raw.socialLinks ?? {}) };
  if (!socialLinks.whatsapp?.trim()) socialLinks.whatsapp = DEFAULT_DATA.socialLinks.whatsapp;
  const skills = normalizeSkills(raw.skills);
  const certificates = normalizeCertificates(raw.certificates);

  return {
    ...cloneDefaultData(),
    ...raw,
    profile,
    skills,
    certificates,
    socialLinks,
    messages: Array.isArray(raw.messages) ? raw.messages : [],
  };
}

function portfolioWritePayload(data: PortfolioData): Omit<PortfolioData, "messages"> {
  const { messages: _messages, ...payload } = normalizePortfolioData(data);
  void _messages;
  return payload;
}

function getCachedData(): PortfolioData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalizePortfolioData(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

function cacheData(data: PortfolioData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getAllData(): Promise<PortfolioData> {
  try {
    const snap = await getDoc(PORTFOLIO_DOC);

    if (snap.exists()) {
      const data = normalizePortfolioData(snap.data() as Partial<PortfolioData>);
      cacheData(data);
      return data;
    }

    return getCachedData() ?? cloneDefaultData();
  } catch {
    return getCachedData() ?? cloneDefaultData();
  }
}

export async function saveAllData(data: PortfolioData): Promise<void> {
  const normalized = normalizePortfolioData(data);
  await setDoc(PORTFOLIO_DOC, portfolioWritePayload(normalized));
  cacheData(normalized);
}

export async function getData<K extends keyof PortfolioData>(section: K): Promise<PortfolioData[K]> {
  return (await getAllData())[section];
}

export async function setData<K extends keyof PortfolioData>(
  section: K,
  value: PortfolioData[K]
): Promise<void> {
  const all = await getAllData();
  all[section] = value;
  await saveAllData(all);
}

function generateId(): string {
  return "id_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
}

export async function addItem<T extends { id: string }>(
  section: keyof PortfolioData,
  item: Omit<T, "id">
): Promise<T> {
  const all = await getAllData();

  const newItem = {
    ...item,
    id: generateId(),
  } as T;

  (all[section] as unknown as T[]).push(newItem);

  await saveAllData(all);

  return newItem;
}

export async function updateItem<T extends { id: string }>(
  section: keyof PortfolioData,
  id: string,
  updatedItem: Omit<T, "id">
): Promise<void> {
  const all = await getAllData();

  const arr = all[section] as unknown as T[];

  const index = arr.findIndex((i) => i.id === id);

  if (index !== -1) {
    arr[index] = { ...updatedItem, id } as T;
    await saveAllData(all);
  }
}

export async function deleteItem(
  section: keyof PortfolioData,
  id: string
): Promise<void> {
  const all = await getAllData();

  (all as Record<keyof PortfolioData, unknown>)[section] =
    (all[section] as unknown as { id: string }[]).filter(
      (i) => i.id !== id
    );

  await saveAllData(all);
}

export async function exportData(): Promise<void> {
  const data = await getAllData();

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = `portfolio_backup_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  a.click();

  URL.revokeObjectURL(url);
}

export async function importData(
  jsonString: string
): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);

    if (!data.profile || !data.skills || !data.projects) {
      throw new Error("Invalid format");
    }

    await saveAllData(normalizePortfolioData(data));

    return true;
  } catch {
    return false;
  }
}

export async function resetToDefaults(): Promise<void> {
  await saveAllData(cloneDefaultData());
}

function firestoreDateToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function normalizeMessageDoc(id: string, data: DocumentData): Message {
  return {
    id,
    name: String(data.name || ""),
    email: String(data.email || ""),
    subject: String(data.subject || ""),
    message: String(data.message || ""),
    sentAt: firestoreDateToString(data.sentAt),
    read: Boolean(data.read),
  };
}

export async function getMessages(): Promise<Message[]> {
  const snap = await getDocs(query(MESSAGES_COLLECTION, orderBy("sentAt", "desc")));
  return snap.docs.map((messageDoc) => normalizeMessageDoc(messageDoc.id, messageDoc.data()));
}

export async function addMessage(
  msg: Omit<Message, "id" | "sentAt" | "read">
): Promise<void> {
  await addDoc(MESSAGES_COLLECTION, {
    name: msg.name.trim(),
    email: msg.email.trim(),
    subject: msg.subject.trim(),
    message: msg.message.trim(),
    sentAt: serverTimestamp(),
    read: false,
  });
}

export async function markMessageRead(id: string): Promise<void> {
  await updateDoc(doc(db, "messages", id), { read: true });
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, "messages", id));
}
