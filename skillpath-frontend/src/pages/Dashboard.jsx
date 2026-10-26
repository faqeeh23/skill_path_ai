import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faChartLine, faChevronRight, faCode, faCompass, faHouse, faMoon, faRoute, faSliders, faSun } from '@fortawesome/free-solid-svg-icons';
import ExplorePaths from './explore/ExplorePaths';
import InitialAssessment from '../features/assessment/pages/InitialAssessment';
import Onboarding from '../features/onboarding/pages/Onboarding';
import Overview from './dashboard/Overview';
import LearningPath from './dashboard/LearningPath';
import Progress from './dashboard/Progress';
import PathDetail from './dashboard/PathDetail';
import lightLogo from '../assets/skillPathAI_logo_light_mode.png';
import darkLogo from '../assets/skillPathAI_logo_dark_mode.png';
import './dashboard.css';
import './dashboard/dashboard-pages.css';

const navigation = [
  { to: '/dashboard', label: 'Overview', icon: faHouse, end: true },
  { to: '/dashboard/path', label: 'My learning path', icon: faRoute },
  { to: '/dashboard/explore', label: 'Explore paths', icon: faCompass },
  { to: '/dashboard/progress', label: 'My progress', icon: faChartLine },
  { to: '/dashboard/assessment', label: 'Skill assessment', icon: faSliders },
  { to: '/dashboard/goals', label: 'Learning goal', icon: faBookOpen },
];
function Icon({ icon }) { return <FontAwesomeIcon icon={icon} aria-hidden="true" />; }

export default function Dashboard() {
  const { pathname } = useLocation();
  const main = useRef(null);
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* Use device preference when storage is unavailable. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const current = navigation.find(item => item.end ? pathname === item.to : pathname.startsWith(item.to));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* Toggle still works without storage. */ }
  }, [theme]);
  useEffect(() => {
    document.title = `${current?.label ?? 'Page not found'} | SkillPath AI`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
  }, [pathname, current?.label]);
  return (
    <div className="learning-dash">
      <a className="dash-skip" href="#dash-main">Skip to dashboard</a>
      <aside className="dash-sidebar">
        <Link to="/" className="dash-brand" aria-label="SkillPath AI home">
          <img className="dash-brand-logo" src={theme === 'dark' ? darkLogo : lightLogo} alt="SkillPath AI" width="180" height="52" />
        </Link>
        <p className="dash-workspace">Your learning space</p>
        <nav aria-label="Dashboard navigation" className="dash-nav">{navigation.map(item => <NavLink key={item.to} to={item.to} end={item.end}><Icon icon={item.icon} /><span>{item.label}</span></NavLink>)}</nav>
        <div className="dash-sidebar-note"><span className="dash-note-icon"><Icon icon={faBookOpen} /></span><h3>A little focus goes a long way.</h3><p>Choose a direction. Make time for one useful thing today.</p><Link to="/dashboard/goals">Set your learning goal <Icon icon={faChevronRight} /></Link></div>
        <div className="dash-profile"><span className="dash-avatar"><Icon icon={faCode} /></span><div><strong>Your workspace</strong><span>Demo mode</span></div><Link to="/login">Log in</Link></div>
      </aside>
      <main ref={main} id="dash-main" className="dash-main" tabIndex={-1}>
        <header className="dash-topbar"><span>Workspace <Icon icon={faChevronRight} /><strong>{current?.label ?? 'Page not found'}</strong></span><div className="dash-topbar-actions"><span className="dash-demo-badge">Sample workspace</span><button type="button" className="dash-theme" onClick={() => setTheme(value => value === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}><Icon icon={theme === 'light' ? faMoon : faSun} /></button></div></header>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="path" element={<LearningPath />} />
          <Route path="explore" element={<ExplorePaths basePath="/dashboard/explore" />} />
          <Route path="explore/:pathId" element={<PathDetail dashboard />} />
          <Route path="progress" element={<Progress />} />
          <Route path="assessment" element={<InitialAssessment goalPath="/dashboard/goals" />} />
          <Route path="goals" element={<Onboarding assessmentPath="/dashboard/assessment" exitPath="/dashboard" />} />
          <Route path="*" element={<div className="dash-content dash-empty"><h1>This page is not available</h1><p>Choose a section from your workspace navigation.</p><Link className="dash-primary" to="/dashboard">Back to overview</Link></div>} />
        </Routes>
      </main>
    </div>
  );
}
