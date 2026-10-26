import { Link, useParams } from 'react-router';
import { learningPaths } from '../../data/learningPaths';
import { pathOutlines } from './learningData';

export default function PathDetail({ dashboard = false }) {
  const { pathId } = useParams();
  const path = learningPaths.find(item => item.id === pathId);
  const base = dashboard ? '/dashboard/explore' : '/paths';
  if (!path) return <section className="dash-content dash-empty"><h1>We couldn’t find that path</h1><p>Choose one of the available learning paths to continue.</p><Link className="btn btn-primary" to={base}>Browse learning paths</Link></section>;
  return <div className={`dash-content dash-path-detail ${dashboard ? '' : 'public-path-detail'}`}>
    <Link className="dash-back-link" to={base}>Back to learning paths</Link>
    <div className="dash-detail-grid"><section className="dash-page-heading"><p className="dash-greeting">{path.category}</p><h1>{path.title}</h1><p>{path.description}</p><ul className="dash-detail-tags"><li>{path.level}</li><li>{path.durationWeeks} weeks</li><li>4 modules</li></ul><h2>Skills you’ll work on</h2><ul className="dash-detail-skills">{path.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></section><aside className="dash-detail-aside"><span>Your starting point</span><h2>A plan that starts with you.</h2><p>Choose your career goal and experience level, then try a sample skill assessment.</p><Link className="btn btn-primary" to={dashboard ? '/dashboard/goals' : '/onboarding'}>Set your learning goal</Link><small>Curriculum preview. Full courses are not available yet.</small></aside></div>
    <section className="dash-panel"><h2>Your learning outline</h2><ol className="dash-outline">{pathOutlines[path.id].map((title,index) => <li key={title}><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{index === 3 ? 'Apply what you’ve learned in a practical project.' : 'Build your understanding through focused lessons and practice.'}</p></div></li>)}</ol></section>
  </div>;
}
