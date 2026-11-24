import { Link } from 'react-router';
import { modules, readLessonProgress } from './learningData';

export default function LearningPath() {
  const completed = readLessonProgress();
  return (
    <div className="dash-content">
      <div className="dash-page-heading"><p className="dash-greeting">Your roadmap</p><h1>One skill builds on another.</h1><p>A sample Frontend Developer curriculum, from the foundations to your first portfolio.</p></div>
      <div className="dash-path-summary"><div><span>Frontend Developer</span><strong>{completed ? '19' : '18'} of 40 lessons finished</strong></div><progress value={completed ? 19 : 18} max="40" aria-label="Sample path completion" /><Link className="dash-primary" to="/dashboard?lesson=components">{completed ? 'Review sample lesson' : 'Continue sample lesson'}</Link></div>
      <div className="dash-curriculum">{modules.map((module, index) => <section key={module.title} className={`dash-curriculum-module ${index === 2 ? 'current' : ''}`}><div className="dash-curriculum-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div><div><span className="dash-module-tag">{module.status}</span><h2>{module.title}</h2><p>{module.detail}</p>{index === 2 && <div className="dash-lesson-row"><div><strong>Components & props</strong><span>12 min · Interactive sample lesson</span></div><Link to="/dashboard?lesson=components">{completed ? 'Review lesson' : 'Open lesson'}</Link></div>}</div></section>)}</div>
      <aside className="dash-inline-note"><h2>A preview of your learning journey</h2><p>The curriculum and starting progress are sample data. You can complete the Components & props lesson here; the full course library will need backend integration.</p><Link to="/dashboard/explore">Explore a different direction</Link></aside>
    </div>
  );
}
