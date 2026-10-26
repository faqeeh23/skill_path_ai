// Centralized presentation data. IDs are shared across catalog, lessons and assessments.
export const goals = [
  {
    id: "frontend",
    title: "Frontend Developer",
    description: "Build accessible interfaces for the web.",
  },
  {
    id: "backend",
    title: "Backend Developer",
    description: "Build dependable APIs and services.",
  },
  {
    id: "ai",
    title: "AI / ML Engineer",
    description: "Explore practical machine learning.",
  },
  {
    id: "data",
    title: "Data Analyst",
    description: "Turn data into clear decisions.",
  },
  {
    id: "security",
    title: "Cybersecurity Specialist",
    description: "Understand and protect digital systems.",
  },
  {
    id: "design",
    title: "UI/UX Designer",
    description: "Research, prototype and test useful experiences.",
  },
];
const skillGroups = [
  [
    "html",
    "HTML",
    [
      [
        "semantic",
        "Semantic HTML",
        "Choose meaningful elements such as main, nav and button.",
      ],
      [
        "forms",
        "Accessible forms",
        "Connect every control to a visible label and helpful validation.",
      ],
    ],
  ],
  [
    "css",
    "CSS",
    [
      [
        "layout",
        "Responsive layout",
        "Use flexible grids and content-driven breakpoints.",
      ],
      [
        "contrast",
        "Color & focus",
        "Use readable contrast and a visible keyboard focus indicator.",
      ],
    ],
  ],
  [
    "javascript",
    "JavaScript",
    [
      [
        "functions",
        "Functions & scope",
        "Keep functions focused and understand which variables they can access.",
      ],
      [
        "arrays",
        "Array transformations",
        "Use map to return a transformed array without mutating the original.",
      ],
    ],
  ],
  [
    "react",
    "React",
    [
      [
        "components",
        "Components & props",
        "Pass data from parent to child using props.",
      ],
      ["hooks", "Hooks", "Manage reusable state and effects with React hooks."],
    ],
  ],
  [
    "hooks",
    "Hooks",
    [
      [
        "use-state",
        "useState",
        "Update local state through its setter rather than mutation.",
      ],
      [
        "use-effect",
        "useEffect",
        "Synchronize with external systems and clean up subscriptions.",
      ],
      [
        "use-context",
        "useContext",
        "Read shared context from the nearest provider.",
      ],
      [
        "custom-hooks",
        "Custom hooks",
        "Extract reusable stateful logic into a function starting with use.",
      ],
    ],
  ],
  [
    "angular",
    "Angular",
    [
      [
        "angular-components",
        "Angular components",
        "Combine templates and component data to express an interface.",
      ],
      [
        "angular-services",
        "Services & injection",
        "Share behavior through injected services.",
      ],
    ],
  ],
  [
    "php",
    "PHP",
    [
      [
        "php-types",
        "PHP fundamentals",
        "Validate incoming values and use deliberate types.",
      ],
      [
        "laravel",
        "Laravel services",
        "Keep HTTP handling separate from application behavior.",
      ],
    ],
  ],
  [
    "node",
    "Node.js",
    [
      [
        "async",
        "Asynchronous JavaScript",
        "Await asynchronous operations and handle rejected promises.",
      ],
      [
        "api",
        "REST API design",
        "Use resources, HTTP methods and meaningful status codes.",
      ],
    ],
  ],
  [
    "sql",
    "SQL",
    [
      [
        "sql-select",
        "Queries & joins",
        "Join related tables on their keys and filter deliberately.",
      ],
      [
        "sql-aggregate",
        "Aggregations",
        "Group records to calculate an aggregate for each category.",
      ],
    ],
  ],
  [
    "python",
    "Python",
    [
      [
        "python-data",
        "Python collections",
        "Choose lists, dictionaries and sets for their distinct purposes.",
      ],
      [
        "python-analysis",
        "Data preparation",
        "Check missing values and data types before analysis.",
      ],
    ],
  ],
  [
    "ml",
    "Machine learning",
    [
      [
        "ml-validation",
        "Model validation",
        "Evaluate against held-out data rather than only training data.",
      ],
      [
        "ml-bias",
        "Bias & limitations",
        "Inspect error patterns and communicate limitations.",
      ],
    ],
  ],
  [
    "visualization",
    "Data visualization",
    [
      [
        "charts",
        "Choosing charts",
        "Match the chart to the comparison and label units.",
      ],
      [
        "story",
        "Explaining insights",
        "Connect an observation to evidence and a useful action.",
      ],
    ],
  ],
  [
    "networks",
    "Networks",
    [
      [
        "networking",
        "Network foundations",
        "Understand how addresses and protocols connect systems.",
      ],
      [
        "linux",
        "Linux permissions",
        "Grant only the permissions needed for the task.",
      ],
    ],
  ],
  [
    "defense",
    "Security practice",
    [
      [
        "threats",
        "Threat detection",
        "Look for meaningful signals in logs and investigate context.",
      ],
      [
        "response",
        "Incident response",
        "Contain an incident and preserve evidence before recovery.",
      ],
    ],
  ],
  [
    "research",
    "User research",
    [
      [
        "interviews",
        "User interviews",
        "Ask open questions about real behavior, avoiding leading prompts.",
      ],
      [
        "synthesis",
        "Research synthesis",
        "Group observations into themes and retain their supporting evidence.",
      ],
    ],
  ],
  [
    "design",
    "Interface design",
    [
      [
        "wireframes",
        "Wireframes",
        "Explore content hierarchy before adding visual decoration.",
      ],
      [
        "prototypes",
        "Usability testing",
        "Observe whether people can complete a realistic task.",
      ],
    ],
  ],
];
const records = new Map();
for (const [id, title, children] of skillGroups) {
  records.set(id, {
    ...records.get(id),
    id,
    title,
    children: children.map((child) => child[0]),
  });
  for (const [childId, childTitle, explanation] of children)
    records.set(childId, {
      id: childId,
      title: childTitle,
      parentId: id,
      explanation,
      children: [],
    });
}
export const skills = [...records.values()];
export const skillById = Object.fromEntries(
  skills.map((skill) => [skill.id, skill]),
);
export function leavesOf(id) {
  const skill = skillById[id];
  return skill?.children.length
    ? skill.children.flatMap(leavesOf)
    : skill
      ? [id]
      : [];
}
const pathSeeds = [
  [
    "react",
    "frontend",
    "Frontend with React",
    ["html", "css", "javascript", "react"],
    16,
    "Build reusable, accessible interfaces with React.",
  ],
  [
    "angular",
    "frontend",
    "Frontend with Angular",
    ["html", "css", "javascript", "angular"],
    18,
    "Create structured web applications with Angular.",
  ],
  [
    "laravel",
    "backend",
    "Backend with Laravel",
    ["php", "sql"],
    16,
    "Design data-driven services with PHP and Laravel.",
  ],
  [
    "node-api",
    "backend",
    "APIs with Node.js",
    ["javascript", "node", "sql"],
    14,
    "Build and reason about asynchronous API services.",
  ],
  [
    "python-ml",
    "ai",
    "Applied machine learning with Python",
    ["python", "ml", "visualization"],
    20,
    "Prepare data, evaluate models and communicate limitations.",
  ],
  [
    "sql-python",
    "data",
    "Data analysis with SQL & Python",
    ["sql", "python", "visualization"],
    14,
    "Investigate datasets and present useful insights.",
  ],
  [
    "security",
    "security",
    "Cybersecurity with Linux",
    ["networks", "defense"],
    20,
    "Practice system foundations, detection and incident response.",
  ],
  [
    "ux",
    "design",
    "UX research & interface design",
    ["research", "design", "css"],
    12,
    "Turn research into prototypes and test your decisions.",
  ],
];
export const paths = pathSeeds.map(
  ([id, goalId, title, roots, weeks, description]) => {
    const leafIds = roots.flatMap(leavesOf);
    return {
      id,
      goalId,
      title,
      roots,
      weeks,
      description,
      leafIds,
      lessonIds: leafIds.map((leaf) => `lesson-${leaf}`),
      level:
        id === "security" || id === "python-ml" ? "Intermediate" : "Beginner",
      outcomes: [
        "Apply the required skills in focused practice.",
        "Explain the decisions behind your work.",
        "Demonstrate every required skill in a final project.",
      ],
    };
  },
);
export const pathById = Object.fromEntries(
  paths.map((path) => [path.id, path]),
);
export const aliases = {
  "frontend-developer": "react",
  "data-analyst": "sql-python",
  "ui-ux-designer": "ux",
  "cybersecurity-analyst": "security",
};
export function resolvePath(id) {
  return pathById[id] ?? pathById[aliases[id]];
}
export const lessons = skills
  .filter((skill) => !skill.children.length)
  .map((skill, index) => ({
    id: `lesson-${skill.id}`,
    skillId: skill.id,
    title: skill.title,
    minutes: 8 + (index % 6),
    instructorId: "instructor-1",
    status: "published",
    processing: "ready",
    summary: skill.explanation,
    video: "/skillpath-demo.mp4",
    transcript: `${skill.title}\n\n${skill.explanation}\n\nStart with a small example and identify its inputs and expected outcome. Compare the result with your objective. Explain your choice, then change one condition and check the result again.\n\nPractice: describe a real situation where this concept helps. Write down a decision you would make and the evidence that supports it.`,
    objectives: [
      `Explain ${skill.title.toLowerCase()}.`,
      "Apply the concept in a small example.",
      "Recognize a common mistake and correct it.",
    ],
    resources: [
      {
        label: "MDN web development learning",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
      },
    ],
  }));
export const lessonById = Object.fromEntries(
  lessons.map((lesson) => [lesson.id, lesson]),
);
export function questionsFor(path, skillId) {
  return (skillId ? [skillId, skillId] : path.leafIds.slice(0, 6)).map(
    (id, index) => {
      const skill = skillById[id];
      const correctIndex = index % 3;
      const options = [
        "Skip validation and assume the result is correct.",
        "Use the same approach for every situation.",
      ];
      options.splice(correctIndex, 0, skill.explanation);
      return {
        id: `${skillId ? "checkpoint" : "placement"}-${id}-${index}`,
        skillId: id,
        text: `Which approach correctly applies ${skill.title}?`,
        options,
        correctIndex,
        explanation: skill.explanation,
      };
    },
  );
}
export const demoUsers = [
  {
    id: "student-1",
    name: "Alex Morgan",
    email: "student@skillpath.demo",
    role: "student",
    status: "active",
  },
  {
    id: "instructor-1",
    name: "Sam Rivera",
    email: "instructor@skillpath.demo",
    role: "instructor",
    status: "active",
  },
  {
    id: "admin-1",
    name: "Jordan Lee",
    email: "admin@skillpath.demo",
    role: "admin",
    status: "active",
  },
];
export const plans = [
  {
    id: "trial",
    name: "Free trial",
    price: 0,
    description: "Explore the learning features for 14 days.",
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    description: "Continue your learning with Pro.",
  },
];
export const tutorActions = [
  "Explain simply",
  "Show an example",
  "Summarize lesson",
  "Practice question",
];
export const navigation = {
  student: [
    ["", "Overview"],
    ["path", "My learning paths"],
    ["explore", "Explore paths"],
    ["skills", "Skill profile"],
    ["assessment", "Assessments"],
    ["projects", "Final project"],
    ["notifications", "Notifications"],
    ["profile", "My profile"],
    ["settings", "Settings"],
  ],
  instructor: [
    ["", "Overview"],
    ["paths", "Learning paths"],
    ["lessons", "Skills & lessons"],
    ["resources", "Video & resources"],
    ["quizzes", "Quiz management"],
    ["students", "Student progress"],
    ["projects", "Project reviews"],
  ],
  admin: [
    ["", "Overview"],
    ["users", "Users"],
    ["instructors", "Instructors"],
    ["goals", "Career goals"],
    ["paths", "Learning paths"],
    ["content", "Platform content"],
    ["subscriptions", "Subscriptions"],
    ["analytics", "Analytics"],
  ],
};
