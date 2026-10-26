import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBookOpen, faChartLine, faCheck, faCode, faFire, faPlay, faXmark } from '@fortawesome/free-solid-svg-icons';
import { modules, readLessonProgress, lessonProgressKey } from './learningData';
function Icon({ icon, ...props }) { return <FontAwesomeIcon icon={icon} aria-hidden="true" {...props} />; }
const activity = [25, 40, 0, 35, 55, 20, 0];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Overview() {
  const lessonDialog = useRef(null);
  const launchButton = useRef(null);
  const [completed, setCompleted] = useState(() => readLessonProgress());
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [period, setPeriod] = useState('week');
  const lessonCount = completed ? 19 : 18;
  const progress = Math.round(lessonCount / 40 * 100);

  function closeLesson() {
    lessonDialog.current.close();

  }
  function checkAnswer(event) {
    event.preventDefault();
    if (answer === 'props') {
      setCompleted(true);
      setFeedback('Correct. Props pass information from a parent to a child component. Lesson complete!');
    } else {
      setFeedback('Try again: think about the values a parent passes into a child component.');
    }
  }

  const [params] = useSearchParams();
  useEffect(() => { try { sessionStorage.setItem(lessonProgressKey, JSON.stringify(completed)); } catch { /* Session storage may be disabled. */ } }, [completed]);
  useEffect(() => { if (params.get('lesson') === 'components' && !lessonDialog.current.open) lessonDialog.current.showModal(); }, [params]);

  return (<>
        <div className="dash-content">
          <div className="dash-heading"><div><p className="dash-greeting">Every step counts</p><h1>Your next chapter starts here.</h1><p>Pick up where you left off. Build something you're proud of.</p></div><span className="dash-preview">Sample workspace</span></div>

          <section className="dash-continue" aria-labelledby="continue-title">
            <div className="dash-continue-copy"><span className="dash-current"><span /> Your current path</span><h2 id="continue-title">Frontend Developer</h2><p>From your first line of code to experiences people love to use.</p><div className="dash-lesson-label">Next lesson <span>12 min</span></div><h3>{completed ? 'You completed Components & props' : 'Components & props'}</h3><button ref={launchButton} className="dash-primary" onClick={() => { setFeedback(''); lessonDialog.current.showModal(); }}><Icon icon={completed ? faCheck : faPlay} /> {completed ? 'Review lesson' : 'Continue learning'}</button></div>
            <div className="dash-path-art" aria-hidden="true"><div className="dash-orbit dash-orbit-one" /><div className="dash-orbit dash-orbit-two" /><div className="dash-code-window"><div className="dash-code-toolbar"><span /><span /><span /><em>My first component</em></div><div className="dash-code-content"><span className="dash-code-comment">// Small steps. Real skills.</span><br /><span className="dash-code-purple">function</span> Welcome({'{ name }'}) {'{'}<br />&nbsp; <span className="dash-code-purple">return</span> (<br />&nbsp; &nbsp; &lt;<span className="dash-code-green">h1</span>&gt;Hello, {'{name}'}&lt;/<span className="dash-code-green">h1</span>&gt;<br />&nbsp; );<br />{'}'}</div><div className="dash-code-result"><span><Icon icon={faCheck} /> Preview</span><strong>Hello, future developer.</strong></div></div><span className="dash-art-tag"><Icon icon={faCode} /> Learn it. Build it.</span></div>
          </section>

          <section className="dash-metrics" aria-label="Sample learning statistics"><div><span className="dash-metric-icon"><Icon icon={faChartLine} /></span><div><strong>{progress}<small>%</small></strong><span>Path completed</span></div><progress value={lessonCount} max="40" aria-label="Path completion" /></div><div><span className="dash-metric-icon"><Icon icon={faBookOpen} /></span><div><strong>{lessonCount}<small> / 40</small></strong><span>Lessons finished</span></div></div><div><span className="dash-metric-icon dash-flame"><Icon icon={faFire} /></span><div><strong>3<small> days</small></strong><span>Current learning streak</span></div></div></section>

          <div className="dash-bottom-grid">
            <section className="dash-roadmap" id="learning-path" aria-labelledby="roadmap-title"><div className="dash-section-heading"><div><h2 id="roadmap-title">A path with a purpose</h2><p>One milestone closer to your next role.</p></div><span>4 modules</span></div><ol className="dash-module-list">{modules.map((module, index) => <li key={module.title} className={index < 2 ? 'is-complete' : index === 2 ? 'is-current' : ''}><span className="dash-module-node">{index < 2 ? <Icon icon={faCheck} /> : index + 1}</span><div><h3>{module.title}</h3><p>{module.detail}</p></div><span className="dash-module-status">{module.status}</span></li>)}</ol><Link className="dash-text-link" to="/dashboard/explore">Explore other learning paths <Icon icon={faArrowRight} /></Link></section>
            <div className="dash-right-column"><section className="dash-activity" aria-labelledby="activity-title"><div className="dash-section-heading"><h2 id="activity-title">Time well spent</h2><select aria-label="Activity period" value={period} onChange={event => setPeriod(event.target.value)}><option value="week">This week</option><option value="last">Last week</option></select></div><p><strong>{period === 'week' ? '2h 55m' : '2h 10m'}</strong> of focused learning</p><div className="dash-bars" role="img" aria-label={period === 'week' ? 'Sample activity: Monday 25, Tuesday 40, Wednesday 0, Thursday 35, Friday 55, Saturday 20, Sunday 0 minutes.' : 'Sample activity: Monday 20, Tuesday 30, Wednesday 15, Thursday 25, Friday 30, Saturday 10, Sunday 0 minutes.'}>{(period === 'week' ? activity : [20, 30, 15, 25, 30, 10, 0]).map((minutes, index) => <div className="dash-bar-column" key={days[index]}><div className="dash-bar-track"><span style={{ height: `${minutes / 60 * 100}%` }} title={`${days[index]}: ${minutes} minutes`} /></div><span>{days[index]}</span></div>)}</div></section>
            <section className="dash-nudge"><span className="dash-nudge-symbol"><Icon icon={faChartLine} /></span><div><h2>Start with what you know.</h2><p>Take a short skill assessment to find your starting point.</p><Link to="/dashboard/assessment">Assess my skills <Icon icon={faArrowRight} /></Link></div></section></div>
          </div>
          <footer className="dash-footnote">Preview data for exploring your workspace. Sample lesson progress is kept in this browser tab.</footer>
        </div>
      <dialog ref={lessonDialog} className="dash-lesson-dialog" aria-labelledby="lesson-title" onClose={() => launchButton.current?.focus()} onClick={event => { if (event.target === event.currentTarget) closeLesson(); }}>
        <div className="dash-dialog-heading"><span>React fundamentals</span><button aria-label="Close lesson" onClick={closeLesson}><Icon icon={faXmark} /></button></div><h2 id="lesson-title">Components & props</h2><p>A component is a reusable piece of your interface. Props let you pass information into it, so the same component can display different content.</p><pre><code>{'function Welcome({ name }) {\n  return <h1>Hello, {name}</h1>;\n}\n\n<Welcome name="Alex" />'}</code></pre><p>Here, <code>name</code> is a prop. The component renders “Hello, Alex”.</p><form onSubmit={checkAnswer}><fieldset><legend>How does a parent pass information to a child component?</legend>{['props', 'styles', 'comments'].map(option => <label key={option}><input type="radio" name="answer" value={option} checked={answer === option} onChange={event => setAnswer(event.target.value)} required />{option[0].toUpperCase() + option.slice(1)}</label>)}</fieldset><p className="dash-feedback" role="status">{feedback}</p><button className="dash-primary" type="submit">Check answer</button>{completed ? <button className="dash-dialog-back" type="button" onClick={closeLesson}>Back to dashboard</button> : null}</form>
      </dialog>
  </>);
}
