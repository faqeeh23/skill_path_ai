import { useSearchParams } from 'react-router';
import { readLessonProgress } from './learningData';

const weeks = {
  week: { label: 'This week', values: [25, 40, 0, 35, 55, 20, 0] },
  last: { label: 'Last week', values: [20, 30, 15, 25, 30, 10, 0] },
};
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const skills = [['HTML & CSS', 92], ['JavaScript', 74], ['React', 48], ['Accessibility', 36]];

export default function Progress() {
  const [params, setParams] = useSearchParams();
  const period = params.get('period') === 'last' ? 'last' : 'week';
  const selected = weeks[period];
  const total = selected.values.reduce((sum, value) => sum + value, 0);
  const lessons = readLessonProgress() ? 19 : 18;
  return <div className="dash-content">
    <div className="dash-page-heading"><p className="dash-greeting">See your momentum</p><h1>Progress you can build on.</h1><p>Explore sample learning activity and skill estimates. These are demonstration figures.</p></div>
    <div className="dash-stat-grid"><article><span>Focused learning</span><strong>{Math.floor(total / 60)}h {total % 60}m</strong><p>{selected.label}</p></article><article><span>Lessons finished</span><strong>{lessons}<small> / 40</small></strong><p>Sample curriculum</p></article><article><span>Learning streak</span><strong>3<small> days</small></strong><p>Sample activity</p></article></div>
    <div className="dash-progress-grid">
      <section className="dash-panel"><div className="dash-panel-title"><h2>Your learning rhythm</h2><label className="dash-period-label">Activity period<select name="period" value={period} onChange={event => setParams({ period: event.target.value })}><option value="week">This week</option><option value="last">Last week</option></select></label></div><p className="dash-muted" role="status">{selected.label}: {total} minutes of sample learning activity.</p><div className="dash-progress-chart" aria-hidden="true">{selected.values.map((value,index) => <div key={days[index]}><strong>{value}</strong><div><span style={{ height: `${value / 60 * 100}%` }} /></div><span>{days[index].slice(0,3)}</span></div>)}</div><details className="dash-activity-details"><summary>View daily learning minutes</summary><dl>{selected.values.map((value,index) => <div key={days[index]}><dt>{days[index]}</dt><dd>{value} min</dd></div>)}</dl></details></section>
      <section className="dash-panel"><h2>Your skill snapshot</h2><p className="dash-muted">Illustrative values, not assessment results.</p><div className="dash-skill-list">{skills.map(([label,value]) => <div key={label}><div><label htmlFor={`skill-${value}`}>{label}</label><span>{value}%</span></div><progress id={`skill-${value}`} value={value} max="100" /></div>)}</div></section>
    </div>
    <p className="dash-footnote">Sample lesson completion is retained in this browser tab. Activity and skill figures are illustrative.</p>
  </div>;
}
