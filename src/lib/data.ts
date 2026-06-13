import type { PortfolioData } from "./types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const DEFAULT_DATA: PortfolioData = {
  profile: {
    name: "Vatsal Dhuvad",
    title: "Data Scientist | ML Engineer",
    taglines: [
      "Data Scientist",
      "ML Engineer",
      "AI Enthusiast",
      "Deep Learning Explorer"
    ],
    email: "vatsaldhuvad23@gmail.com",
    phone: "+91 95747 88321",
    location: "Gandhinagar, Gujarat, India",
    bio: "Computer Engineering student passionate about Data Science, Machine Learning, Artificial Intelligence, and Deep Learning. Experienced in building predictive models, recommendation systems, and data-driven applications using Python and modern ML frameworks.",
    resumeBase64: "",
    resumeFileName: "",
    photoBase64: "",
  },

  skills: [
    { id: "s1", name: "Python", level: 90, category: "Programming" },
    { id: "s2", name: "SQL", level: 85, category: "Programming" },
    { id: "s3", name: "Pandas", level: 90, category: "Data Science" },
    { id: "s4", name: "NumPy", level: 88, category: "Data Science" },
    { id: "s5", name: "Scikit-learn", level: 85, category: "Machine Learning" },
    { id: "s6", name: "Machine Learning", level: 88, category: "Machine Learning" },
    { id: "s7", name: "Deep Learning", level: 75, category: "Machine Learning" },
    { id: "s8", name: "TensorFlow", level: 72, category: "Machine Learning" },
    { id: "s9", name: "PyTorch", level: 68, category: "Machine Learning" },
    { id: "s10", name: "Matplotlib", level: 82, category: "Data Visualization" },
    { id: "s11", name: "Power BI", level: 75, category: "Analytics" },
    { id: "s12", name: "Git & GitHub", level: 85, category: "Tools" }
  ],

  projects: [
    {
      id: "p1",
      title: "House Price Prediction",
      description: "Machine learning regression model for predicting house prices using data preprocessing, feature engineering, and model evaluation.",
      technologies: ["Python", "Pandas", "NumPy", "Scikit-learn", "Matplotlib"],
      category: "Machine Learning",
      github: "https://github.com/vatsal-dhuvad",
      demo: "",
      image: "",
    },
    {
      id: "p2",
      title: "Student Placement Prediction",
      description: "Classification model to predict student placement outcomes using academic and skill-based features.",
      technologies: ["Python", "Pandas", "Scikit-learn", "Machine Learning"],
      category: "Machine Learning",
      github: "https://github.com/vatsal-dhuvad",
      demo: "",
      image: "",
    },
    {
      id: "p3",
      title: "Movie Recommendation System",
      description: "Recommendation engine built using collaborative filtering and content-based recommendation techniques.",
      technologies: ["Python", "Pandas", "Scikit-learn", "Streamlit"],
      category: "Recommendation System",
      github: "https://github.com/vatsal-dhuvad",
      demo: "",
      image: "",
    }
  ],

  certificates: [],

  education: [
    {
      id: "e1",
      degree: "B.E. in Computer Engineering",
      institution: "LDRP-ITR (KSV)",
      startYear: "2023",
      endYear: "2027",
      grade: "",
      description: "Focused on Machine Learning, Data Science, Artificial Intelligence, and Software Development."
    }
  ],

  experience: [
    {
      id: "ex1",
      role: "Data Science & Machine Learning Intern",
      company: "Infotact Solutions",
      duration: "June 2026 - Present",
      description: "Working on real-world Machine Learning and Data Science projects involving predictive analytics, model development, evaluation, and deployment.",
      technologies: [
        "Python",
        "Machine Learning",
        "Pandas",
        "Scikit-learn",
        "Git"
      ]
    }
  ],

  achievements: [
    {
      id: "a1",
      title: "Machine Learning Project Developer",
      description: "Built multiple end-to-end machine learning projects and deployed them on GitHub.",
      icon: "trophy"
    }
  ],

  socialLinks: {
    github: "https://github.com/vatsal-dhuvad",
    linkedin: "https://www.linkedin.com/in/vatsal-dhuvad-7630482b2/",
    whatsapp: "",
    kaggle: "",
    leetcode: "",
    twitter: "",
    instagram: "",
    email: "vatsaldhuvad23@gmail.com"
  }
};

const DOC_REF = doc(db, "portfolio", "data");
const ADMIN_REF = doc(db, "portfolio", "admin");

export const DEFAULT_PASSWORD = "Vatsal2253@";

export async function getAllData(): Promise<PortfolioData> {
  try {
    const fetchPromise = async () => {
      const snapshot = await getDoc(DOC_REF);
      if (snapshot.exists()) {
        return snapshot.data() as PortfolioData;
      }
      await setDoc(DOC_REF, DEFAULT_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    };

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Firebase connection timed out")), 4000)
    );

    return await Promise.race([fetchPromise(), timeoutPromise]);
  } catch (err) {
    console.error("Firebase error, returning default data:", err);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

export async function saveAllData(data: PortfolioData): Promise<void> {
  try {
    const savePromise = setDoc(DOC_REF, data);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Connection timed out. Check your internet or Firebase config.")), 4000)
    );
    await Promise.race([savePromise, timeoutPromise]);
  } catch (err: any) {
    console.error("Firebase error saving data:", err);
    const msg = err.message || "Unknown Firebase error";
    if (msg.includes("Missing or insufficient permissions")) {
      throw new Error("Permission Denied: You need to update your Firestore Rules to allow read/write.");
    }
    throw new Error(msg);
  }
}

export async function getData<K extends keyof PortfolioData>(section: K): Promise<PortfolioData[K]> {
  const all = await getAllData();
  return all[section];
}

export async function setData<K extends keyof PortfolioData>(section: K, value: PortfolioData[K]): Promise<void> {
  const all = await getAllData();
  all[section] = value;
  await saveAllData(all);
}

function generateId(): string {
  return "id_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
}

export async function addItem<T extends { id: string }>(section: keyof PortfolioData, item: Omit<T, "id">): Promise<T> {
  const all = await getAllData();
  const newItem = { ...item, id: generateId() } as T;
  (all[section] as T[]).push(newItem);
  await saveAllData(all);
  return newItem;
}

export async function updateItem<T extends { id: string }>(section: keyof PortfolioData, id: string, updatedItem: Omit<T, "id">): Promise<void> {
  const all = await getAllData();
  const arr = all[section] as T[];
  const index = arr.findIndex((i) => i.id === id);
  if (index !== -1) {
    arr[index] = { ...updatedItem, id } as T;
    await saveAllData(all);
  }
}

export async function deleteItem(section: keyof PortfolioData, id: string): Promise<void> {
  const all = await getAllData();
  (all[section] as { id: string }[]) = (all[section] as { id: string }[]).filter((i) => i.id !== id);
  await saveAllData(all);
}

export async function exportData(): Promise<void> {
  const data = await getAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.profile || !data.skills || !data.projects) throw new Error("Invalid format");
    await saveAllData(data);
    return true;
  } catch {
    return false;
  }
}

export async function resetToDefaults(): Promise<void> {
  await saveAllData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
}

export async function getAdminPassword(): Promise<string> {
  try {
    const fetchPromise = async () => {
      const snapshot = await getDoc(ADMIN_REF);
      if (snapshot.exists() && snapshot.data().password) {
        return snapshot.data().password;
      }
      await setDoc(ADMIN_REF, { password: DEFAULT_PASSWORD });
      return DEFAULT_PASSWORD;
    };
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Firebase connection timed out")), 4000)
    );
    
    return await Promise.race([fetchPromise(), timeoutPromise]);
  } catch (err) {
    console.error("Firebase error getting password:", err);
    return DEFAULT_PASSWORD;
  }
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  await setDoc(ADMIN_REF, { password: newPassword });
}

export async function verifyPassword(input: string): Promise<boolean> {
  const correct = await getAdminPassword();
  return input === correct;
}
