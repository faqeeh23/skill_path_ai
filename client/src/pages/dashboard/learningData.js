export const lessonProgressKey = 'skillpath_demo_components_complete';
export function readLessonProgress() {
  try { return JSON.parse(sessionStorage.getItem(lessonProgressKey)) === true; }
  catch { return false; }
}
export const modules = [
  { title: 'HTML & CSS', detail: 'Structure, style, and responsive layouts', status: 'Complete' },
  { title: 'JavaScript essentials', detail: 'The building blocks of interactive experiences', status: 'Complete' },
  { title: 'React fundamentals', detail: 'Components, props, and state', status: 'In progress' },
  { title: 'Your portfolio project', detail: 'Bring everything together in a real application', status: 'Up next' },
];
export const pathOutlines = {
  'frontend-developer': ['HTML & CSS', 'JavaScript essentials', 'React fundamentals', 'Your portfolio project'],
  'data-analyst': ['Spreadsheets & statistics', 'SQL & data preparation', 'Python for analysis', 'An insight-driven case study'],
  'ui-ux-designer': ['Design foundations', 'User research', 'Wireframes & prototypes', 'Your design case study'],
  'cybersecurity-analyst': ['Networks & Linux', 'Security fundamentals', 'Threat detection', 'Incident response practice'],
};
