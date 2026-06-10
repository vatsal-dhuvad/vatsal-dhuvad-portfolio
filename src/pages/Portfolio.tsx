import { useEffect, useRef, useState } from "react";
import { getAllData } from "../lib/data";
import type { PortfolioData } from "../lib/types";

const ICONS: Record<string, string> = {
  trophy: "🏆", code: "💻", "git-branch": "🌿", star: "⭐", award: "🎖️", medal: "🥇", default: "✨",
};
const CERT_ICOS = ["🎓","📜","🏅","⚡","🔬","☁️","🤖","📊","📈","🔢","🌐","💡","🧬","🔭","🎯"];
const PROJ_ICOS: Record<string,string> = { NLP:"💬", ML:"🧠", "Computer Vision":"👁️", "Data Analysis":"📊", "Deep Learning":"🤖", Other:"📁" };

// ────────────────────────────────────────────────────────────────────────────
// Particle canvas (kept subtle, behind grid)
// ────────────────────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf: number;
    type P = { x:number; y:number; vx:number; vy:number; r:number; a:number };
    const pts: P[] = [];
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 55; i++)
      pts.push({ x: Math.random()*c.width, y: Math.random()*c.height,
                 vx: (Math.random()-.5)*.25, vy: (Math.random()-.5)*.25,
                 r: Math.random()*1.2+.4, a: Math.random()*.4+.1 });

    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c.width;
        if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height;
        if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(0,229,255,${p.a})`; ctx.fill();
      });
      for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
        const d = Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
        if (d<110) {
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(0,229,255,${.07*(1-d/110)})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.35,pointerEvents:"none" }} />;
}

// ────────────────────────────────────────────────────────────────────────────
// Main Portfolio component
// ────────────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [active,      setActive]      = useState("home");
  const [typeText,    setTypeText]    = useState("");
  const [typeIdx,     setTypeIdx]     = useState(0);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [taglineIdx,  setTaglineIdx]  = useState(0);
  const [skillFilter, setSkillFilter] = useState("All");
  const [projFilter,  setProjFilter]  = useState("All");
  const [certSearch,  setCertSearch]  = useState("");
  const [formOk,      setFormOk]      = useState(false);

  useEffect(() => {
    getAllData().then(fetched => setData(fetched));
  }, []);

  // scroll + active section
  useEffect(() => {
    const SECS = ["home","about","skills","projects","certificates","education","experience","contact"];
    const fn = () => {
      setScrolled(window.scrollY > 40);
      for (const id of [...SECS].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 130) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // reveal on scroll
  useEffect(() => {
    if (!data) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("on"); }),
      { threshold: 0.07 }
    );
    document.querySelectorAll(".rv").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [data, skillFilter, projFilter]);

  // skill bar animation
  useEffect(() => {
    if (!data) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting)
          e.target.querySelectorAll<HTMLElement>(".skill-fill")
            .forEach(b => { b.style.width = (b.dataset.level||"0")+"%"; });
      }),
      { threshold: 0.1 }
    );
    const el = document.getElementById("skillsGrid");
    if (el) io.observe(el);
    return () => io.disconnect();
  }, [data, skillFilter]);

  // typing animation
  useEffect(() => {
    if (!data) return;
    const tags = data.profile.taglines;
    if (!tags.length) return;
    const cur = tags[taglineIdx];
    const spd = isDeleting ? 50 : 90;
    const t = setTimeout(() => {
      if (!isDeleting) {
        setTypeText(cur.slice(0, typeIdx+1));
        if (typeIdx+1 === cur.length) setTimeout(() => setIsDeleting(true), 1600);
        else setTypeIdx(i => i+1);
      } else {
        setTypeText(cur.slice(0, typeIdx-1));
        if (typeIdx <= 1) { setIsDeleting(false); setTypeIdx(0); setTaglineIdx(i => (i+1)%tags.length); }
        else setTypeIdx(i => i-1);
      }
    }, spd);
    return () => clearTimeout(t);
  }, [data, typeIdx, isDeleting, taglineIdx]);

  const goto = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); setMobileOpen(false); };

  const handleResume = () => {
    if (!data) return;
    if (data.profile.resumeBase64) {
      const a = document.createElement("a"); a.href = data.profile.resumeBase64;
      a.download = data.profile.resumeFileName || "resume.pdf"; a.click();
    } else alert("Resume not uploaded yet — add it from the admin panel.");
  };

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault(); setFormOk(true);
    setTimeout(() => setFormOk(false), 3500);
    (e.target as HTMLFormElement).reset();
  };

  if (!data) return null;
  const { profile, skills, projects, certificates, education, experience, socialLinks } = data;

  const skillCats = ["All", ...Array.from(new Set(skills.map(s => s.category)))];
  const shownSkills = skillFilter === "All" ? skills : skills.filter(s => s.category === skillFilter);
  const projCats = ["All", ...Array.from(new Set(projects.map(p => p.category)))];
  const shownProjs = projFilter === "All" ? projects : projects.filter(p => p.category === projFilter);
  const shownCerts = certificates.filter(c =>
    c.name.toLowerCase().includes(certSearch.toLowerCase()) ||
    c.org.toLowerCase().includes(certSearch.toLowerCase())
  );

  const NAV = ["home","about","skills","projects","certificates","education","experience","contact"];

  return (
    <div style={{ background:"var(--bg-0)", minHeight:"100vh" }}>
      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav className={`nav${scrolled?" scrolled":""}`}>
        <div className="wrap">
          <button className="nav-logo" onClick={() => goto("home")}>&lt;<em>VD</em>/&gt;</button>
          <div className={`nav-links${mobileOpen?" open":""}`}>
            {NAV.map(s => (
              <button key={s} className={`nav-link${active===s?" act":""}`} onClick={() => goto(s)}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
            <a href="/admin" className="nav-admin">Admin ↗</a>
          </div>
          <button className="mob-btn" onClick={() => setMobileOpen(v => !v)} aria-label="menu">
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="hero" id="home">
        {/* Grid background */}
        <div className="hero-grid-bg" />
        {/* Particle network */}
        <ParticleCanvas />
        {/* Radial glow spots */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1,
          background:"radial-gradient(ellipse 70% 55% at 50% 60%, rgba(139,92,246,.08) 0%, transparent 70%)" }} />

        <div className="wrap" style={{ position:"relative", zIndex:2, width:"100%" }}>
          <div className="hero-content">
            {/* Badge */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
              <div className="hero-badge">
                <span className="dot" />
                Available for work
              </div>
            </div>

            {/* Heading */}
            <h1>Hi, I'm <em>{profile.name.split(" ")[0]}</em> {profile.name.split(" ").slice(1).join(" ")}</h1>

            {/* Typing */}
            <div className="hero-type">
              <span className="type-label">// </span>
              <span className="type-text">{typeText}</span>
              <span className="type-cur" />
            </div>

            {/* Tags */}
            <div className="hero-tags">
              <span className="hero-tag">Data Science</span>
              <span className="hero-tag-sep" />
              <span className="hero-tag">Machine Learning</span>
              <span className="hero-tag-sep" />
              <span className="hero-tag">AI Integration</span>
            </div>

            {/* Description */}
            <p className="hero-desc">{profile.bio.slice(0, 170)}...</p>

            {/* Buttons */}
            <div className="hero-btns">
              <button className="btn btn-solid" onClick={() => goto("projects")}>See My Work</button>
              <button className="btn btn-ghost" onClick={handleResume}>Download Resume</button>
              <button className="btn btn-ghost" onClick={() => goto("contact")}>Contact Me</button>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              <div><div className="hs-num">{projects.length}+</div><div className="hs-lbl">Projects</div></div>
              <div><div className="hs-num">{certificates.length}+</div><div className="hs-lbl">Certs</div></div>
              <div><div className="hs-num">{skills.length}+</div><div className="hs-lbl">Skills</div></div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll">
          <span>Scroll for more</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────────────── */}
      <section className="section" id="about" style={{ background:"linear-gradient(180deg,#06060a 0%,var(--bg-1) 100%)" }}>
        <div className="wrap">
          <div className="sh rv">
            <div className="sh-label">About Me</div>
            <h2>Know Who <span className="grad">I Am</span></h2>
            <p>A glimpse into my journey, passion, and what drives me forward.</p>
          </div>
          <div className="about-grid rv">
            <div>
              <div className="about-img-box">
                {profile.photoBase64
                  ? <img src={profile.photoBase64} alt={profile.name} />
                  : <span className="about-placeholder">👤</span>}
              </div>
            </div>
            <div>
              <p className="about-text">{profile.bio}</p>
              <div className="about-cards">
                <div className="about-item" data-hover>
                  <div className="about-icon">📍</div>
                  <div><h5>Location</h5><p>{profile.location}</p></div>
                </div>
                <div className="about-item" data-hover>
                  <div className="about-icon">✉️</div>
                  <div><h5>Email</h5><p>{profile.email}</p></div>
                </div>
                <div className="about-item" data-hover>
                  <div className="about-icon">📱</div>
                  <div><h5>Phone</h5><p>{profile.phone}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SKILLS ─────────────────────────────────── */}
      <section className="section" id="skills">
        <div className="wrap">
          <div className="sh rv">
            <div className="sh-label">My Skills</div>
            <h2>Technologies & <span className="grad">Expertise</span></h2>
            <p>Tools and technologies I use to turn ideas into reality.</p>
          </div>
          <div className="skill-tabs rv">
            {skillCats.map(c => (
              <button key={c} className={`skill-tab${skillFilter===c?" act":""}`} onClick={() => setSkillFilter(c)}>{c}</button>
            ))}
          </div>
          <div className="skills-grid rv" id="skillsGrid">
            {shownSkills.map(sk => (
              <div key={sk.id} className="skill-card">
                <div className="skill-row">
                  <span className="skill-name">{sk.name}</span>
                  <span className="skill-pct">{sk.level}%</span>
                </div>
                <div className="skill-track">
                  <div className="skill-fill" data-level={sk.level} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ───────────────────────────────── */}
      <section className="section" id="projects" style={{ background:"linear-gradient(180deg,var(--bg-0) 0%,var(--bg-1) 100%)" }}>
        <div className="wrap">
          <div className="sh rv">
            <div className="sh-label">My Projects</div>
            <h2>Featured <span className="grad">Work</span></h2>
            <p>Real-world projects showcasing my problem-solving abilities.</p>
          </div>
          <div className="proj-filters rv">
            {projCats.map(c => (
              <button key={c} className={`skill-tab${projFilter===c?" act":""}`} onClick={() => setProjFilter(c)}>{c}</button>
            ))}
          </div>
          <div className="proj-grid rv">
            {shownProjs.map(p => (
              <div key={p.id} className="proj-card">
                <div className="proj-thumb">
                  {p.image ? <img src={p.image} alt={p.title}/> : <span className="proj-thumb-icon">{PROJ_ICOS[p.category]||"📁"}</span>}
                  <span className="proj-badge">{p.category}</span>
                </div>
                <div className="proj-body">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="proj-tags">{p.technologies.map(t => <span key={t} className="proj-tag">{t}</span>)}</div>
                  <div className="proj-links">
                    {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="proj-lnk">🔗 GitHub</a>}
                    {p.demo   && <a href={p.demo}   target="_blank" rel="noopener noreferrer" className="proj-lnk">🚀 Live Demo</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATES ───────────────────────────── */}
      <section className="section" id="certificates">
        <div className="wrap">
          <div className="sh rv">
            <div className="sh-label">Certificates</div>
            <h2>Professional <span className="grad">Credentials</span></h2>
            <p>Industry-recognized certifications validating my expertise.</p>
          </div>
          <div className="cert-search rv">
            <span className="cert-search-icon">🔍</span>
            <input className="c-input" type="text" placeholder="Search certificates..."
              value={certSearch} onChange={e => setCertSearch(e.target.value)}
              style={{ paddingLeft:"46px" }} />
          </div>
          <div className="certs-grid rv">
            {shownCerts.map((c,i) => (
              <div key={c.id} className="cert-card">
                <div className="cert-ico">{CERT_ICOS[i%CERT_ICOS.length]}</div>
                <h3>{c.name}</h3>
                <p className="cert-org">{c.org}</p>
                <p className="cert-date">{c.date}</p>
                <div className="cert-actions">
                  {c.link  && <a href={c.link}  target="_blank" rel="noopener noreferrer" className="cert-btn">Verify ↗</a>}
                  {c.image && <a href={c.image} target="_blank" rel="noopener noreferrer" className="cert-btn">View</a>}
                </div>
              </div>
            ))}
            {shownCerts.length === 0 && (
              <div className="empty" style={{ gridColumn:"1/-1" }}>
                <div className="empty-icon">🔍</div><p>No certificates match your search.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ──────────────────────────────── */}
      <section className="section" id="education" style={{ background:"linear-gradient(180deg,var(--bg-0) 0%,var(--bg-1) 100%)" }}>
        <div className="wrap">
          <div className="sh rv">
            <div className="sh-label">Education</div>
            <h2>Academic <span className="grad">Journey</span></h2>
            <p>My educational background and qualifications.</p>
          </div>
          <div className="timeline-wrap rv">
            {education.map(e => (
              <div key={e.id} className="tl-item">
                <div className="tl-dot"/>
                <div className="tl-card">
                  <div className="tl-date">{e.startYear} — {e.endYear}</div>
                  <h3>{e.degree}</h3>
                  <h4>{e.institution}</h4>
                  <p>{e.description}</p>
                  {e.grade && <p className="tl-grade">🏅 {e.grade}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ─────────────────────────────── */}
      <section className="section" id="experience">
        <div className="wrap">
          <div className="sh rv">
            <div className="sh-label">Experience</div>
            <h2>Professional <span className="grad">Experience</span></h2>
            <p>Hands-on experience building real-world solutions.</p>
          </div>
          <div className="timeline-wrap rv">
            {experience.map(e => (
              <div key={e.id} className="tl-item">
                <div className="tl-dot"/>
                <div className="tl-card">
                  <div className="tl-date">{e.duration}</div>
                  <h3>{e.role}</h3>
                  <h4>{e.company}</h4>
                  <p>{e.description}</p>
                  <div className="tl-tags">{e.technologies.map(t => <span key={t} className="tl-tag">{t}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────── */}
      <section className="section" id="contact">
        <div className="wrap">
          <div className="sh rv">
            <div className="sh-label">Get In Touch</div>
            <h2>Let's <span className="grad">Connect</span></h2>
            <p>Have a question or want to collaborate? I'd love to hear from you.</p>
          </div>
          <div className="contact-grid rv">
            <div>
              <div className="contact-infos">
                {profile.email    && <div className="c-item" data-hover><div className="c-icon">✉️</div><div><h5>Email</h5><p>{profile.email}</p></div></div>}
                {profile.phone    && <div className="c-item" data-hover><div className="c-icon">📱</div><div><h5>Phone</h5><p>{profile.phone}</p></div></div>}
                {profile.location && <div className="c-item" data-hover><div className="c-icon">📍</div><div><h5>Location</h5><p>{profile.location}</p></div></div>}
              </div>
              <div className="socials">
                {socialLinks.github    && <a href={socialLinks.github}    target="_blank" rel="noopener noreferrer" className="soc-btn" title="GitHub"    data-hover>🐙</a>}
                {socialLinks.linkedin  && <a href={socialLinks.linkedin}  target="_blank" rel="noopener noreferrer" className="soc-btn" title="LinkedIn"  data-hover>💼</a>}
                {socialLinks.kaggle    && <a href={socialLinks.kaggle}    target="_blank" rel="noopener noreferrer" className="soc-btn" title="Kaggle"    data-hover>📊</a>}
                {socialLinks.leetcode  && <a href={socialLinks.leetcode}  target="_blank" rel="noopener noreferrer" className="soc-btn" title="LeetCode"  data-hover>🧩</a>}
                {socialLinks.twitter   && <a href={socialLinks.twitter}   target="_blank" rel="noopener noreferrer" className="soc-btn" title="Twitter"   data-hover>🐦</a>}
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="soc-btn" title="Instagram" data-hover>📸</a>}
              </div>
            </div>
            <form className="c-form" onSubmit={handleContact}>
              <input  className="c-input" type="text"  placeholder="Your Name"    required />
              <input  className="c-input" type="email" placeholder="Your Email"   required />
              <input  className="c-input" type="text"  placeholder="Subject" />
              <textarea className="c-input" placeholder="Your Message..." rows={5} required />
              {formOk && <p className="form-success">✅ Message sent! (Demo — configure email to receive messages.)</p>}
              <button type="submit" className="btn btn-grad" style={{ width:"100%", justifyContent:"center" }}>
                ✉️ Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-links">
            {["home","about","projects","certificates","experience","contact"].map(s => (
              <button key={s} onClick={() => goto(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
            ))}
            <a href="/admin" style={{ fontSize:".83rem", color:"var(--text-2)" }}>Admin</a>
          </div>
          <p>&copy; {new Date().getFullYear()} <a href="#home">{profile.name}</a> · Built with React + Vite</p>
        </div>
      </footer>
    </div>
  );
}
