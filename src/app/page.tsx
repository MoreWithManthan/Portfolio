'use client';

import CommandPalette from '@/components/portfolio/CommandPalette';
import KittuAssistant from '@/components/portfolio/KittuAssistant';
import NekoFriends from '@/components/portfolio/NekoFriends';
import SecurityLab from '@/components/portfolio/SecurityLab';
import SocialLinks from '@/components/portfolio/SocialLinks';
import SpotifyLastPlayed from '@/components/portfolio/SpotifyLastPlayed';
import TechnologyBadge from '@/components/portfolio/TechnologyBadge';
import { certifications, projects, skills } from '@/config/Portfolio';
import {
  Activity,
  ArrowUp,
  ArrowUpRight,
  Award,
  BrainCircuit,
  ChevronDown,
  Code2,
  Cpu,
  Github,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Terminal,
  Workflow,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function Heading({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <p>{eyebrow}</p>
      <h2>{children}</h2>
    </div>
  );
}
export default function Portfolio() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [experienceExpanded, setExperienceExpanded] = useState(false);
  const [lab, setLab] = useState<'terminal' | 'hash' | 'ctf' | null>(null);
  useEffect(() => {
    setMounted(true);
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
        return;
      }
      if (
        (e.target as HTMLElement).closest(
          'input,textarea,select,[contenteditable]',
        )
      )
        return;
      if (
        (e.key === '`' || e.key === '~') &&
        !document.querySelector('dialog[open]')
      ) {
        e.preventDefault();
        setLab((v) => (v ? null : 'terminal'));
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);
  return (
    <div className="reference-portfolio">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <nav aria-label="Main navigation">
          <div className="reference-nav-links">
            <a href="#home" aria-label="Manthan Garg home">
              Home
            </a>
            <a href="#projects">Work</a>
            <a href="#about">About</a>
            <a
              href="/assets/Manthan_Garg_Resume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Resume
            </a>
          </div>
          <div className="nav-tools">
            <button
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Search portfolio (Control or Command K)"
            >
              <Search size={18} />
              <span>
                <kbd>Ctrl</kbd> <kbd>K</kbd>
              </span>
            </button>
            <button
              className="icon-button"
              aria-label="Toggle light and dark theme"
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
            >
              {mounted && resolvedTheme === 'dark' ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>
          </div>
        </nav>
      </header>
      <main id="main" className="portfolio-shell">
        <section
          className="profile-summary"
          id="home"
          aria-labelledby="hero-title"
        >
          <div className="profile-top">
            <div className="profile-avatar-frame">
              <Image
                priority
                src="/assets/manthan-pixel.png"
                width={120}
                height={120}
                sizes="120px"
                className="profile-avatar"
                alt="Pixel portrait of Manthan Garg"
              />
            </div>
            <div className="profile-identity">
              <h1 id="hero-title">Manthan Garg</h1>
              <div className="profile-byline">
                <span>Cybersecurity · Systems · CSE</span>
                <a
                  className="profile-email"
                  href="mailto:linkwithmanthan@gmail.com"
                >
                  linkwithmanthan@gmail.com
                </a>
              </div>
              <p className="profile-location">
                <MapPin size={14} />
                Chandigarh, India
              </p>
            </div>
          </div>
          <p className="profile-intro">
            I build security tools, explore Linux internals, and turn ideas into
            things that work.
          </p>
          <div className="profile-tool-row">
            <span>Building with</span>
            {['Python', 'C++', 'Linux'].map((name) => (
              <TechnologyBadge key={name} name={name} />
            ))}
          </div>
          <SpotifyLastPlayed />
          <SocialLinks className="profile-socials" />
        </section>
        <section id="journey" className="content-section">
          <Heading eyebrow="Learning, leading, building">
            Experience & education
          </Heading>
          <div className="timeline">
            <article>
              <span className="timeline-icon">
                <GraduationCap size={20} />
              </span>
              <div>
                <div className="timeline-top">
                  <h3>Chitkara University</h3>
                  <span>2024 — 2028</span>
                </div>
                <p className="role">B.E. Computer Science Engineering</p>
                <div
                  className="experience-details"
                  hidden={!experienceExpanded}
                >
                  <p>
                    CGPA: <strong>8.34</strong> · Network Security,
                    Cryptography, Operating Systems, Data Structures &
                    Algorithms, and OOP in <span className="nowrap">C++.</span>
                  </p>
                </div>
              </div>
            </article>
            <article>
              <span className="timeline-icon">
                <Code2 size={20} />
              </span>
              <div>
                <div className="timeline-top">
                  <h3>IEEE Student Branch</h3>
                  <span>Chitkara University</span>
                </div>
                <p className="role">Vice Chair</p>
                <div
                  className="experience-details"
                  hidden={!experienceExpanded}
                >
                  <p>
                    Leading technical events, volunteer coordination, and
                    cross-chapter collaboration. Helped host orientation with
                    technical games and team-building activities.
                  </p>
                </div>
              </div>
            </article>
            <article>
              <span className="timeline-icon">
                <Award size={20} />
              </span>
              <div>
                <h3>IEEE Delhi SAC & IOC Team</h3>
                <p className="role">Team member</p>
                <div
                  className="experience-details"
                  hidden={!experienceExpanded}
                >
                  <p>
                    Contributing to regional student activities and outreach.
                    Led sponsorship outreach and designed the official brochure
                    for IEEE DSSYWLC 2025.
                  </p>
                </div>
              </div>
            </article>
          </div>
          <div hidden={!experienceExpanded}>
            <div className="achievement-row">
              <div>
                <Award size={19} />
                <div>
                  <strong>Published patent</strong>
                  <span>NeuroSole · Smart healthcare wearable</span>
                </div>
              </div>
              <div>
                <Code2 size={19} />
                <div>
                  <strong>Top 5 · Buildathon</strong>
                  <span>Emergence’26</span>
                </div>
              </div>
            </div>
            <details className="community-details">
              <summary>
                More from the community <ChevronDown size={15} />
              </summary>
              <ul>
                <li>
                  Recognised at the IEEE Delhi Section Student Network Awards
                  2026 for industrial collaboration and outreach.
                </li>
                <li>Top 10 at Chitkaraverse 2026 with Team NervoTech.</li>
                <li>
                  Winner of the Panel Discussion Contest organised by the NEP
                  Cell with IQAC, Chitkara University HP.
                </li>
                <li>
                  Previously served as IEEE Student Branch Webmaster.
                  Contributed to BuildX 2026, CodeWars 6.0, IEEE Day 2025, and
                  the Innovation for Impact Bootcamp.
                </li>
              </ul>
            </details>
          </div>
          <button
            className="experience-toggle"
            aria-expanded={experienceExpanded}
            onClick={() => setExperienceExpanded((v) => !v)}
          >
            {experienceExpanded
              ? 'Show less'
              : 'Show all experience & achievements'}
          </button>
        </section>
        <section id="projects" className="content-section">
          <Heading eyebrow="Selected work">Things I’ve built</Heading>
          <div className="project-grid">
            {projects.map((p, i) => {
              const Icon = [ShieldCheck, Activity, BrainCircuit][i];
              return (
                <article className={'project-card project-' + i} key={p.name}>
                  <div className="project-top">
                    <span className="project-icon">
                      <Icon size={26} strokeWidth={1.5} />
                    </span>
                    <span className="badge">{p.status}</span>
                  </div>
                  <p className="project-kind">{p.kind}</p>
                  <h3>{p.name}</h3>
                  <p className="project-description">{p.description}</p>
                  <ul
                    className="project-technologies"
                    aria-label={`${p.name} technologies`}
                  >
                    {p.tags.map((t) => (
                      <li key={t}>
                        <TechnologyBadge name={t} />
                      </li>
                    ))}
                  </ul>
                  <details>
                    <summary>
                      Under the hood <ChevronDown size={15} />
                    </summary>
                    <ul>
                      {p.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                    <p className="metadata">{p.date}</p>
                  </details>
                  <div className="project-links">
                    <a href={p.url} target="_blank" rel="noreferrer">
                      <Github size={16} /> Source <ArrowUpRight size={14} />
                    </a>
                    {p.live && (
                      <a href={p.live} target="_blank" rel="noreferrer">
                        Live project <ArrowUpRight size={15} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <a
            className="all-projects"
            href="https://github.com/MoreWithManthan?tab=repositories"
            target="_blank"
            rel="noreferrer"
          >
            More on GitHub <ArrowUpRight size={16} />
          </a>
        </section>
        <section id="about" className="content-section">
          <Heading eyebrow="A little context">About me</Heading>
          <div className="body-copy">
            <p>
              I’m a Computer Science Engineering student at{' '}
              <strong>Chitkara University</strong>, exploring the intersection
              of cybersecurity, systems, and intelligent software. My work spans
              endpoint analysis, real-time telemetry, embedded sensor pipelines,
              and machine-learning research.
            </p>
            <p>
              I enjoy understanding what happens beneath the interface: how a
              process behaves, how a network communicates, and what a signal can
              actually tell us. Outside my projects, I help bring people
              together as <strong>Vice Chair of the IEEE Student Branch</strong>
              .
            </p>
            <p>
              Also: Arch Linux, lightweight developer setups, and turning old
              hardware into fast, useful machines. There’s usually a terminal
              open somewhere.
            </p>
          </div>
        </section>
        <section id="skills" className="content-section">
          <Heading eyebrow="Tools & foundations">My technical stack</Heading>
          <div className="skill-groups">
            {skills.map(([group, items], index) => {
              const Icon = [
                ShieldCheck,
                Code2,
                Cpu,
                Workflow,
                BrainCircuit,
                Layers,
              ][index];
              return (
                <article className="skill-group" key={group}>
                  <div className="skill-category-heading">
                    <span className="skill-category-icon">
                      <Icon size={19} aria-hidden />
                    </span>
                    <h3>{group}</h3>
                  </div>
                  <ul className="skill-list" aria-label={`${group} skills`}>
                    {items.map((item) => (
                      <li key={item} className="technology-tile">
                        <TechnologyBadge name={item} />
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
        <section className="content-section" id="certifications">
          <Heading eyebrow="Continuing to learn">Certifications</Heading>
          <div className="certifications">
            {certifications.map(([name, issuer]) => (
              <div key={name}>
                <Award size={18} />
                <div>
                  <h3>{name}</h3>
                  <p>{issuer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="content-section" id="lab">
          <Heading eyebrow="For the curious">A small security lab</Heading>
          <p className="body-copy">
            A few things to tinker with while you’re here. Everything runs in
            your browser.
          </p>
          <div className="lab-launchers">
            <button onClick={() => setLab('terminal')}>
              <Terminal size={22} />
              <strong>Terminal</strong>
              <span>
                Try a command <kbd>~</kbd>
              </span>
            </button>
            <button onClick={() => setLab('ctf')}>
              <ShieldCheck size={22} />
              <strong>Capture the flag</strong>
              <span>Five clues to follow</span>
            </button>
            <button onClick={() => setLab('hash')}>
              <Code2 size={22} />
              <strong>Hash calculator</strong>
              <span>A fingerprint for your data</span>
            </button>
          </div>
        </section>
        <section id="contact" className="content-section contact-section">
          <Heading eyebrow="Have something in mind?">Let’s connect.</Heading>
          <p className="body-copy">
            I’m interested in open-source Linux, automation, security projects,
            and conversations with people who like building things.
          </p>
          <a
            className="email-link email-me-button"
            href="mailto:linkwithmanthan@gmail.com"
          >
            <Mail size={18} aria-hidden="true" /> Email me{' '}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <SocialLinks className="contact-socials" />
        </section>
        <footer>
          <div>
            <span>© {new Date().getFullYear()} Manthan Garg</span>
          </div>
          <a href="#" aria-label="Back to top">
            <ArrowUp size={18} />
          </a>
        </footer>
      </main>
      <NekoFriends />
      {searchOpen && (
        <CommandPalette
          onClose={() => setSearchOpen(false)}
          onLab={(tab) => {
            setSearchOpen(false);
            setLab(tab);
          }}
        />
      )}
      <KittuAssistant onOpenLab={(tab) => setLab(tab)} />
      {lab && (
        <SecurityLab
          initialTab={lab}
          onClose={() => setLab(null)}
          onAskKittu={() => {
            setLab(null);
            window.dispatchEvent(new Event('kittu-open'));
          }}
        />
      )}
    </div>
  );
}
