import { useState, useEffect, useRef } from "react";
import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import {
  DEFAULT_DATA, getAllData, setData, addItem, updateItem, deleteItem,
  exportData, importData, resetToDefaults,
  getMessages, markMessageRead, deleteMessage,
} from "../lib/data";
import { auth } from "../lib/auth";
import type {
  PortfolioData, Skill, Project, Certificate, Education, Experience, Message,
} from "../lib/types";
import { showToast } from "../components/Toast";

type Panel = "profile"|"skills"|"projects"|"certificates"|"education"|"experience"|"social"|"messages"|"data"|"password";
type ModalMode =
  | { type: "skill"; item?: Skill }
  | { type: "project"; item?: Project }
  | { type: "certificate"; item?: Certificate }
  | { type: "education"; item?: Education }
  | { type: "experience"; item?: Experience }
  | null;

const MAX_FIRESTORE_IMAGE_BYTES = 700 * 1024;

function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

async function compressProjectImage(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image could not load"));
      img.src = imageUrl;
    });

    const maxWidth = 900;
    const scale = Math.min(1, maxWidth / image.naturalWidth);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    ctx.drawImage(image, 0, 0, width, height);

    for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrlBytes(dataUrl) <= MAX_FIRESTORE_IMAGE_BYTES) return dataUrl;
    }

    throw new Error("Image is too large");
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("vatsaldhuvad23@gmail.com");
  const [pw, setPw] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [panel, setPanel] = useState<Panel>("profile");
  const [data, setLocalData] = useState<PortfolioData>(DEFAULT_DATA);
  const [dataLoading, setDataLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const refreshMsgs = async () => {
    setMsgsLoading(true);
    try {
      setMsgs(await getMessages());
    } catch {
      showToast("Could not load Firebase messages", "error");
    } finally {
      setMsgsLoading(false);
    }
  };

  const refresh = async () => {
    setDataLoading(true);
    try {
      const fetched = await getAllData();
      setLocalData(fetched);
    } catch {
      showToast("Could not load Firebase portfolio data", "error");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthed(Boolean(nextUser));
      setAuthChecking(false);
    });
  }, []);

  useEffect(() => {
    if (authed) void refresh();
  }, [authed]);

  useEffect(() => {
    if (authed) void refreshMsgs();
  }, [authed]);

  const login = async () => {
    setLoginLoading(true);
    setLoginErr("");
    try {
      await signInWithEmailAndPassword(auth, adminEmail.trim(), pw);
      setPw("");
    } catch (error) {
      if (error instanceof FirebaseError) {
        const messages: Record<string, string> = {
          "auth/invalid-credential": "Email or password is wrong.",
          "auth/user-not-found": "No Firebase user found with this email.",
          "auth/wrong-password": "Password is wrong.",
          "auth/invalid-email": "Email format is not valid.",
          "auth/operation-not-allowed": "Enable Email/Password provider in Firebase Authentication.",
          "auth/unauthorized-domain": "Add this website domain in Firebase Authentication authorized domains.",
          "auth/too-many-requests": "Too many failed attempts. Wait a few minutes or reset password in Firebase.",
        };
        setLoginErr(messages[error.code] || `Firebase login error: ${error.code}`);
      } else {
        setLoginErr("Could not sign in. Please try again.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Profile
  const [pf, setPf] = useState(DEFAULT_DATA.profile);
  useEffect(() => { setPf(data.profile); }, [data.profile]);

const saveProfile = async () => {
  await setData("profile", pf);
  await refresh();
  showToast("Profile saved!", "success");
};
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setPf((p) => ({ ...p, photoBase64: r.result as string })); r.readAsDataURL(f);
  };
  const handleResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setPf((p) => ({ ...p, resumeBase64: r.result as string, resumeFileName: f.name })); r.readAsDataURL(f);
  };

  // Social
  const [sl, setSl] = useState(DEFAULT_DATA.socialLinks);
  useEffect(() => { setSl(data.socialLinks); }, [data.socialLinks]);
const saveSocial = async () => {
  await setData("socialLinks", sl);
  await refresh();
  showToast("Social links saved!", "success");
};
  // Password
  const [pwCur, setPwCur] = useState(""); const [pwNew, setPwNew] = useState(""); const [pwCon, setPwCon] = useState("");
  const changePassword = async () => {
    if (!user?.email) { showToast("Please sign in again", "error"); return; }
    if (pwNew !== pwCon) { showToast("Passwords don't match", "error"); return; }
    if (pwNew.length < 8) { showToast("Use at least 8 characters", "error"); return; }
    try {
      const credential = EmailAuthProvider.credential(user.email, pwCur);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, pwNew);
      setPwCur(""); setPwNew(""); setPwCon("");
      showToast("Firebase password updated!", "success");
    } catch {
      showToast("Could not update password. Check current password.", "error");
    }
  };

  // Import
  const handleImport = () => {
    const file = importRef.current?.files?.[0]; if (!file) { showToast("Select a file first", "error"); return; }
    const r = new FileReader(); r.onload = async () => {
      if (await importData(r.result as string)) { await refresh(); showToast("Data imported to Firebase!", "success"); }
      else showToast("Import failed — invalid file", "error");
    }; r.readAsText(file);
  };

  const handleReset = async () => {
    if (confirm("Reset ALL data to defaults? This cannot be undone.")) { await resetToDefaults(); await refresh(); showToast("Reset to defaults!", "info"); }
  };

  const markRead = async (id: string) => {
    try {
      await markMessageRead(id);
      await refreshMsgs();
    } catch {
      showToast("Could not update message", "error");
    }
  };

  const removeMessage = async (id: string) => {
    try {
      await deleteMessage(id);
      await refreshMsgs();
      showToast("Deleted", "info");
    } catch {
      showToast("Could not delete message", "error");
    }
  };

  const deleteAllMessages = async () => {
    if (!confirm("Delete all messages?")) return;
    try {
      await Promise.all(msgs.map((m) => deleteMessage(m.id)));
      await refreshMsgs();
      showToast("All messages deleted", "info");
    } catch {
      showToast("Could not delete all messages", "error");
    }
  };

  const removeItem = async (section: keyof PortfolioData, id: string) => {
    try {
      await deleteItem(section, id);
      await refresh();
      showToast("Deleted", "info");
    } catch {
      showToast("Could not delete item", "error");
    }
  };

  if (authChecking) return (
    <div className="admin-bg login-wrap">
      <div className="login-box">
        <div className="login-logo">&lt;<em>VD</em>/&gt;</div>
        <div className="login-sub">Checking Admin Session</div>
      </div>
    </div>
  );

  if (!authed) return (
    <div className="admin-bg login-wrap">
      <div className="login-box">
        <div className="login-logo">&lt;<em>VD</em>/&gt;</div>
        <div className="login-sub">Portfolio Admin</div>
        <input className="login-input" type="email" placeholder="Admin email" value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)} autoComplete="username" />
        <input className="login-input" type="password" placeholder="Enter admin password" value={pw}
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void login()} autoComplete="current-password" />
        <button className="login-btn" disabled={loginLoading} onClick={() => void login()}>{loginLoading ? "Signing in..." : "Sign In"}</button>
        {loginErr && <p className="login-err">{loginErr}</p>}
        <p className="login-hint">Use the Firebase Auth admin account.</p>
      </div>
    </div>
  );

  const unread = msgs.filter(m => !m.read).length;
  const nav: { key: Panel; icon: string; label: string; badge?: number }[] = [
    { key: "profile", icon: "👤", label: "Profile" },
    { key: "skills", icon: "📊", label: "Skills" },
    { key: "projects", icon: "📁", label: "Projects" },
    { key: "certificates", icon: "🏅", label: "Certificates" },
    { key: "education", icon: "🎓", label: "Education" },
    { key: "experience", icon: "💼", label: "Experience" },
    { key: "social", icon: "🔗", label: "Social Links" },
    { key: "messages", icon: "✉️", label: "Messages", badge: unread },
  ];
  const nav2: { key: Panel; icon: string; label: string }[] = [
    { key: "data", icon: "🗄️", label: "Data Management" },
    { key: "password", icon: "🔒", label: "Change Password" },
  ];

  return (
    <div className="admin-bg admin-layout">
      <aside className="sidebar">
        <div className="sb-logo">&lt;<em>VD</em>/&gt;</div>
        <div className="sb-sub">Admin Panel</div>
        <nav className="sidebar-nav" style={{ display: "flex", flexDirection: "column" }}>
          {nav.map((n) => (
            <button key={n.key} className={`sb-link${panel === n.key ? " act" : ""}`} onClick={() => setPanel(n.key)}>
              <span>{n.icon}</span>{n.label}
              {n.badge ? <span className="sb-badge">{n.badge}</span> : null}
            </button>
          ))}
          <div className="sb-sep" />
          {nav2.map((n) => (
            <button key={n.key} className={`sb-link${panel === n.key ? " act" : ""}`} onClick={() => setPanel(n.key)}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="sb-footer"><a href="/">↗ View Portfolio</a></div>
      </aside>

      <main className="a-main">
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom: 10 }}>
          <button className="btn-sec" onClick={() => void signOut(auth)}>Sign Out</button>
        </div>
        {dataLoading && <div className="admin-loading">Loading Firebase data...</div>}

        {/* PROFILE */}
        {panel === "profile" && (
          <>
            <div className="a-head"><h1>👤 Profile</h1><button className="btn-add" onClick={saveProfile}>💾 Save Changes</button></div>
            <div className="a-card">
              <div className="f-grid">
                <div className="f-row"><label>Full Name</label><input value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} /></div>
                <div className="f-row"><label>Professional Title</label><input value={pf.title} onChange={(e) => setPf({ ...pf, title: e.target.value })} /></div>
                <div className="f-row"><label>Email</label><input type="email" value={pf.email} onChange={(e) => setPf({ ...pf, email: e.target.value })} /></div>
                <div className="f-row"><label>Phone</label><input value={pf.phone} onChange={(e) => setPf({ ...pf, phone: e.target.value })} /></div>
                <div className="f-row"><label>Location</label><input value={pf.location} onChange={(e) => setPf({ ...pf, location: e.target.value })} /></div>
                <div className="f-row"><label>Taglines (comma-separated)</label><input value={pf.taglines.join(", ")} onChange={(e) => setPf({ ...pf, taglines: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="Data Scientist, ML Engineer" /></div>
                <div className="f-row full"><label>First Page About Text</label><textarea rows={3} value={pf.heroBio} onChange={(e) => setPf({ ...pf, heroBio: e.target.value })} /></div>
                <div className="f-row full"><label>Bio / About Me Section</label><textarea rows={5} value={pf.bio} onChange={(e) => setPf({ ...pf, bio: e.target.value })} /></div>
                <div className="f-row">
                  <label>Profile Photo (upload)</label>
                  <input type="file" accept="image/*" onChange={handlePhoto} />
                  {pf.photoBase64 && <img src={pf.photoBase64} alt="preview" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginTop: 10, border: "2px solid var(--border-bright)" }} />}
                </div>
                <div className="f-row">
                  <label>Resume PDF (upload)</label>
                  <input type="file" accept=".pdf" onChange={handleResume} />
                  {pf.resumeFileName && <p style={{ fontSize: ".78rem", color: "var(--green)", marginTop: 6 }}>✅ {pf.resumeFileName}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* SKILLS */}
        {panel === "skills" && (
          <>
            <div className="a-head"><h1>📊 Skills</h1><button className="btn-add" onClick={() => setModal({ type: "skill" })}>+ Add Skill</button></div>
            <div className="a-card" style={{ overflowX: "auto" }}>
              <table className="a-table">
                <thead><tr><th>Skill</th><th>Level</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.skills.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>
                        <span className="lvl-bar"><span className="lvl-fill" style={{ width: s.level + "%" }} /></span>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: ".8rem", color: "var(--cyan)" }}>{s.level}%</span>
                      </td>
                      <td><span className="cat-badge">{s.category}</span></td>
                      <td style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button className="btn-edit" onClick={() => setModal({ type: "skill", item: s })}>Edit</button>
                        <button className="btn-del" onClick={() => void removeItem("skills", s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* PROJECTS */}
        {panel === "projects" && (
          <>
            <div className="a-head"><h1>📁 Projects</h1><button className="btn-add" onClick={() => setModal({ type: "project" })}>+ Add Project</button></div>
            <div className="a-grid">
              {data.projects.map((p) => (
                <div key={p.id} className="a-card a-item">
                  <h3>{p.title}</h3>
                  <p className="meta">{p.category}</p>
                  <p>{p.description.slice(0, 90)}...</p>
                  <div className="tags">{p.technologies.slice(0, 4).map((t) => <span key={t} className="tag">{t}</span>)}</div>
                  <div className="a-item-footer">
                    <button className="btn-edit" onClick={() => setModal({ type: "project", item: p })}>Edit</button>
                    <button className="btn-del" onClick={() => void removeItem("projects", p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CERTIFICATES */}
        {panel === "certificates" && (
          <>
            <div className="a-head"><h1>🏅 Certificates</h1><button className="btn-add" onClick={() => setModal({ type: "certificate" })}>+ Add Certificate</button></div>
            <div className="a-grid">
              {data.certificates.map((c) => (
                <div key={c.id} className="a-card a-item">
                  <h3>{c.name}</h3>
                  <p className="meta">{c.org}</p>
                  <p style={{ color: "var(--text-3)", fontSize: ".78rem", marginBottom: 16 }}>{c.date}</p>
                  <div className="a-item-footer">
                    <button className="btn-edit" onClick={() => setModal({ type: "certificate", item: c })}>Edit</button>
                    <button className="btn-del" onClick={() => void removeItem("certificates", c.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* EDUCATION */}
        {panel === "education" && (
          <>
            <div className="a-head"><h1>🎓 Education</h1><button className="btn-add" onClick={() => setModal({ type: "education" })}>+ Add Education</button></div>
            <div className="a-grid">
              {data.education.map((e) => (
                <div key={e.id} className="a-card a-item">
                  <h3>{e.degree}</h3>
                  <p className="meta">{e.institution} · {e.startYear}–{e.endYear}</p>
                  <p>{e.description}</p>
                  {e.grade && <p style={{ color: "var(--green)", fontSize: ".83rem", fontWeight: 700, marginBottom: 14 }}>Grade: {e.grade}</p>}
                  <div className="a-item-footer">
                    <button className="btn-edit" onClick={() => setModal({ type: "education", item: e })}>Edit</button>
                    <button className="btn-del" onClick={() => void removeItem("education", e.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* EXPERIENCE */}
        {panel === "experience" && (
          <>
            <div className="a-head"><h1>💼 Experience</h1><button className="btn-add" onClick={() => setModal({ type: "experience" })}>+ Add Experience</button></div>
            <div className="a-grid">
              {data.experience.map((e) => (
                <div key={e.id} className="a-card a-item">
                  <h3>{e.role}</h3>
                  <p className="meta">{e.company} · {e.duration}</p>
                  <p>{e.description.slice(0, 100)}...</p>
                  <div className="tags">{e.technologies.slice(0, 4).map((t) => <span key={t} className="tag">{t}</span>)}</div>
                  <div className="a-item-footer">
                    <button className="btn-edit" onClick={() => setModal({ type: "experience", item: e })}>Edit</button>
                    <button className="btn-del" onClick={() => void removeItem("experience", e.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SOCIAL */}
        {panel === "social" && (
          <>
            <div className="a-head"><h1>🔗 Social Links</h1><button className="btn-add" onClick={saveSocial}>💾 Save Changes</button></div>
            <div className="a-card">
              <div className="f-grid">
                {(["github","linkedin","kaggle","leetcode","twitter","instagram"] as const).map((k) => (
                  <div key={k} className="f-row">
                    <label>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                    <input type="url" value={sl[k]} onChange={(e) => setSl({ ...sl, [k]: e.target.value })} placeholder={`https://${k}.com/...`} />
                  </div>
                ))}
                <div className="f-row">
                  <label>WhatsApp Number (with country code, e.g. 919574788321)</label>
                  <input type="text" value={sl.whatsapp} onChange={(e) => setSl({ ...sl, whatsapp: e.target.value })} placeholder="919574788321" />
                </div>
                <div className="f-row full"><label>Email (for mailto links)</label><input type="email" value={sl.email} onChange={(e) => setSl({ ...sl, email: e.target.value })} /></div>
              </div>
            </div>
          </>
        )}

        {/* MESSAGES */}
        {panel === "messages" && (
          <>
            <div className="a-head">
              <h1>✉️ Messages {unread > 0 && <span style={{ fontSize:"1rem", color:"var(--cyan)", fontWeight:600 }}>({unread} unread)</span>}</h1>
              {msgs.length > 0 && (
                <button className="btn-sec" onClick={() => void deleteAllMessages()}>
                  🗑️ Delete All
                </button>
              )}
            </div>
            {msgsLoading ? (
              <div className="empty"><div className="empty-icon">✉️</div><p>Loading Firebase messages...</p></div>
            ) : msgs.length === 0 ? (
              <div className="empty"><div className="empty-icon">✉️</div><p>No messages yet. Messages from the contact form will appear here.</p></div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {msgs.map((m) => (
                  <div key={m.id} className={`msg-card${m.read ? "" : " msg-card--unread"}`}>
                    <div className="msg-card-header">
                      <div>
                        <span className="msg-name">{m.name}</span>
                        {!m.read && <span className="msg-new-badge">NEW</span>}
                        <span className="msg-email">{m.email}</span>
                      </div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span className="msg-time">{new Date(m.sentAt).toLocaleString()}</span>
                        {!m.read && <button className="btn-edit" onClick={() => void markRead(m.id)}>Mark Read</button>}
                        <button className="btn-del" onClick={() => void removeMessage(m.id)}>Delete</button>
                      </div>
                    </div>
                    {m.subject && <div className="msg-subject">Subject: {m.subject}</div>}
                    <div className="msg-body">{m.message}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* DATA */}
        {panel === "data" && (
          <>
            <div className="a-head"><h1>🗄️ Data Management</h1></div>
            <div className="data-cards">
              <div className="dc">
                <h3>📥 Export Backup</h3>
                <p>Download all portfolio data as a JSON file. Good for backups before major changes.</p>
                <button className="btn-add" onClick={async () => { await exportData(); showToast("Exported!", "success"); }}>Export JSON</button>
              </div>
              <div className="dc">
                <h3>📤 Import Data</h3>
                <p>Restore data from a previously exported JSON backup file.</p>
                <input ref={importRef} type="file" accept=".json" style={{ marginBottom: 12, color: "var(--text-2)", fontSize: ".83rem" }} />
                <button className="btn-sec" onClick={handleImport}>Import JSON</button>
              </div>
              <div className="dc">
                <h3>🔄 Reset to Defaults</h3>
                <p>Wipe all data and restore the original template. This cannot be undone.</p>
                <button className="btn-del" style={{ padding: "10px 20px", fontSize: ".85rem", display: "inline-block" }} onClick={handleReset}>Reset All Data</button>
              </div>
            </div>
          </>
        )}

        {/* PASSWORD */}
        {panel === "password" && (
          <>
            <div className="a-head"><h1>🔒 Change Password</h1></div>
            <div className="a-card" style={{ maxWidth: 420 }}>
              <div className="f-row"><label>Current Password</label><input type="password" value={pwCur} onChange={(e) => setPwCur(e.target.value)} /></div>
              <div className="f-row"><label>New Password</label><input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} /></div>
              <div className="f-row"><label>Confirm New Password</label><input type="password" value={pwCon} onChange={(e) => setPwCon(e.target.value)} /></div>
              <button className="btn-add" style={{ marginTop: 6 }} onClick={() => void changePassword()}>Update Password</button>
            </div>
          </>
        )}

      </main>

      {modal && (
        <ModalWrap modal={modal} onClose={() => setModal(null)} onSave={() => { refresh(); setModal(null); }} />
      )}
    </div>
  );
}

// ── Modals ──────────────────────────────────────────────────────────────────
function ModalWrap({ modal, onClose, onSave }: { modal: NonNullable<ModalMode>; onClose: () => void; onSave: () => void }) {
  const save = async (section: keyof PortfolioData, item: Record<string, unknown>) => {
    if ((item as { id?: string }).id) await updateItem(section, (item as { id: string }).id, item as never);
    else await addItem(section, item as never);
    onSave();
    showToast("Saved to Firebase!", "success");
  };
  return (
    <div className="modal-bg open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>×</button>
        {modal.type === "skill" && <SkillForm item={modal.item} onSave={(v) => void save("skills", v as never)} />}
        {modal.type === "project" && <ProjForm item={modal.item} onSave={(v) => void save("projects", v as never)} />}
        {modal.type === "certificate" && <CertForm item={modal.item} onSave={(v) => void save("certificates", v as never)} />}
        {modal.type === "education" && <EduForm item={modal.item} onSave={(v) => void save("education", v as never)} />}
        {modal.type === "experience" && <ExpForm item={modal.item} onSave={(v) => void save("experience", v as never)} />}
      </div>
    </div>
  );
}

function SkillForm({ item, onSave }: { item?: Skill; onSave: (v: Partial<Skill>) => void }) {
  const [f, setF] = useState<Partial<Skill>>(item || { name: "", level: 70, category: "Programming" });
  const skillCategories = ["AI", "ML", "Data Science", "Database", "Other"];
  const isCustomCategory = Boolean(f.category && !skillCategories.includes(f.category));
  const [categoryMode, setCategoryMode] = useState(isCustomCategory ? "Other" : f.category || "Programming");
  return (
    <>
      <h2>{item ? "Edit" : "Add"} Skill</h2>
      <div className="f-row"><label>Skill Name</label><input value={f.name || ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div className="f-row"><label>Level: {f.level}%</label><input type="range" min={0} max={100} value={f.level ?? 70} onChange={(e) => setF({ ...f, level: +e.target.value })} /></div>
      <div className="f-row"><label>Category</label>
        <select value={categoryMode} onChange={(e) => {
          setCategoryMode(e.target.value);
          setF({ ...f, category: e.target.value === "Other" ? "" : e.target.value });
        }}>
          {skillCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {categoryMode === "Other" && (
        <div className="f-row"><label>Custom Category</label><input value={f.category || ""} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Write your category" /></div>
      )}
      <div className="f-actions"><button className="btn-add" onClick={() => onSave(f)}>Save</button></div>
    </>
  );
}

function ProjForm({ item, onSave }: { item?: Project; onSave: (v: Partial<Project>) => void }) {
  const [f, setF] = useState<Partial<Project>>(item || { title: "", description: "", technologies: [], category: "ML", github: "", demo: "", image: "", imageFocusX: 50, imageFocusY: 50, imageZoom: 1 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const projectCategories = ["AI", "ML", "Data Science", "Database", "Other"];
  const isCustomProjectCategory = Boolean(f.category && !projectCategories.includes(f.category));
  const [categoryMode, setCategoryMode] = useState(isCustomProjectCategory ? "Other" : f.category || "ML");
  const imageFocusX = f.imageFocusX ?? 50;
  const imageFocusY = f.imageFocusY ?? 50;
  const imageZoom = f.imageZoom ?? 1;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }
    setImageFile(file);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      const image = removeImage ? "" : imageFile ? await compressProjectImage(imageFile) : f.image || "";
      onSave({
        ...f,
        image,
        imageFocusX: image ? imageFocusX : 50,
        imageFocusY: image ? imageFocusY : 50,
        imageZoom: image ? imageZoom : 1,
      });
    } catch {
      showToast("Image is too large. Please select a smaller image.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2>{item ? "Edit" : "Add"} Project</h2>
      <div className="f-row"><label>Title</label><input value={f.title || ""} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div className="f-row"><label>Description</label><textarea value={f.description || ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="f-row"><label>Technologies (comma-separated)</label><input value={(f.technologies || []).join(", ")} onChange={(e) => setF({ ...f, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} /></div>
      <div className="f-row"><label>Category</label>
        <select value={categoryMode} onChange={(e) => {
          setCategoryMode(e.target.value);
          setF({ ...f, category: e.target.value === "Other" ? "" : e.target.value });
        }}>
          {projectCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {categoryMode === "Other" && (
        <div className="f-row"><label>Custom Category</label><input value={f.category || ""} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Write your category" /></div>
      )}
      <div className="f-row"><label>GitHub URL</label><input type="url" value={f.github || ""} onChange={(e) => setF({ ...f, github: e.target.value })} /></div>
      <div className="f-row"><label>Live Demo URL</label><input type="url" value={f.demo || ""} onChange={(e) => setF({ ...f, demo: e.target.value })} /></div>
      <div className="f-row">
        <label>Project Image (upload)</label>
        <input type="file" accept="image/*" onChange={handleImageFile} />
        {(preview || f.image) && !removeImage && (
          <>
            <div className="project-crop-preview">
              <img
                src={preview || f.image}
                alt="Project preview"
                style={{
                  objectPosition: `${imageFocusX}% ${imageFocusY}%`,
                  transform: `scale(${imageZoom})`,
                  transformOrigin: `${imageFocusX}% ${imageFocusY}%`,
                }}
              />
            </div>
            <div className="crop-controls">
              <label>Move Left / Right: {imageFocusX}%</label>
              <input type="range" min={0} max={100} value={imageFocusX} onChange={(e) => setF({ ...f, imageFocusX: +e.target.value })} />
              <label>Move Up / Down: {imageFocusY}%</label>
              <input type="range" min={0} max={100} value={imageFocusY} onChange={(e) => setF({ ...f, imageFocusY: +e.target.value })} />
              <label>Zoom: {imageZoom.toFixed(1)}x</label>
              <input type="range" min={1} max={2} step={0.1} value={imageZoom} onChange={(e) => setF({ ...f, imageZoom: +e.target.value })} />
            </div>
            <button
              type="button"
              className="btn-del project-image-remove"
              onClick={() => {
                setImageFile(null);
                setPreview("");
                setRemoveImage(true);
                setF({ ...f, image: "", imageFocusX: 50, imageFocusY: 50, imageZoom: 1 });
              }}
            >
              Delete Image
            </button>
          </>
        )}
      </div>
      <div className="f-row"><label>Image URL (optional backup)</label><input value={f.image || ""} onChange={(e) => setF({ ...f, image: e.target.value })} /></div>
      <div className="f-actions"><button className="btn-add" disabled={saving} onClick={() => void saveProject()}>{saving ? "Uploading..." : "Save"}</button></div>
    </>
  );
}

function CertForm({ item, onSave }: { item?: Certificate; onSave: (v: Partial<Certificate>) => void }) {
  const [f, setF] = useState<Partial<Certificate>>(item || { name: "", org: "", date: "", link: "", image: "" });
  return (
    <>
      <h2>{item ? "Edit" : "Add"} Certificate</h2>
      <div className="f-row"><label>Certificate Name</label><input value={f.name || ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div className="f-row"><label>Issuing Organization</label><input value={f.org || ""} onChange={(e) => setF({ ...f, org: e.target.value })} /></div>
      <div className="f-row"><label>Date (YYYY-MM)</label><input value={f.date || ""} onChange={(e) => setF({ ...f, date: e.target.value })} placeholder="2025-06" /></div>
      <div className="f-row"><label>Verify Link (optional)</label><input type="url" value={f.link || ""} onChange={(e) => setF({ ...f, link: e.target.value })} /></div>
      <div className="f-row"><label>Certificate Image URL (optional)</label><input value={f.image || ""} onChange={(e) => setF({ ...f, image: e.target.value })} /></div>
      <div className="f-actions"><button className="btn-add" onClick={() => onSave(f)}>Save</button></div>
    </>
  );
}

function EduForm({ item, onSave }: { item?: Education; onSave: (v: Partial<Education>) => void }) {
  const [f, setF] = useState<Partial<Education>>(item || { degree: "", institution: "", startYear: "", endYear: "", grade: "", description: "" });
  return (
    <>
      <h2>{item ? "Edit" : "Add"} Education</h2>
      <div className="f-row"><label>Degree / Program</label><input value={f.degree || ""} onChange={(e) => setF({ ...f, degree: e.target.value })} /></div>
      <div className="f-row"><label>Institution</label><input value={f.institution || ""} onChange={(e) => setF({ ...f, institution: e.target.value })} /></div>
      <div className="f-grid">
        <div className="f-row"><label>Start Year</label><input value={f.startYear || ""} onChange={(e) => setF({ ...f, startYear: e.target.value })} /></div>
        <div className="f-row"><label>End Year</label><input value={f.endYear || ""} onChange={(e) => setF({ ...f, endYear: e.target.value })} /></div>
      </div>
      <div className="f-row"><label>Grade / CGPA</label><input value={f.grade || ""} onChange={(e) => setF({ ...f, grade: e.target.value })} /></div>
      <div className="f-row"><label>Description</label><textarea value={f.description || ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="f-actions"><button className="btn-add" onClick={() => onSave(f)}>Save</button></div>
    </>
  );
}

function ExpForm({ item, onSave }: { item?: Experience; onSave: (v: Partial<Experience>) => void }) {
  const [f, setF] = useState<Partial<Experience>>(item || { role: "", company: "", duration: "", description: "", technologies: [] });
  return (
    <>
      <h2>{item ? "Edit" : "Add"} Experience</h2>
      <div className="f-row"><label>Role / Title</label><input value={f.role || ""} onChange={(e) => setF({ ...f, role: e.target.value })} /></div>
      <div className="f-row"><label>Company</label><input value={f.company || ""} onChange={(e) => setF({ ...f, company: e.target.value })} /></div>
      <div className="f-row"><label>Duration</label><input value={f.duration || ""} onChange={(e) => setF({ ...f, duration: e.target.value })} placeholder="Jan 2025 — Present" /></div>
      <div className="f-row"><label>Description</label><textarea value={f.description || ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="f-row"><label>Technologies (comma-separated)</label><input value={(f.technologies || []).join(", ")} onChange={(e) => setF({ ...f, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} /></div>
      <div className="f-actions"><button className="btn-add" onClick={() => onSave(f)}>Save</button></div>
    </>
  );
}
