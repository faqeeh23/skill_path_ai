
const questionsByGoal = {
  1: [
    {
      id: "fe-1",
      skill: "JavaScript",
      question: "Which method creates a new array by transforming every element?",
      options: ["forEach()", "map()", "push()", "find()"],
      correctIndex: 1
    },
    {
      id: "fe-2",
      skill: "React",
      question: "What is the main purpose of useState in React?",
      options: [
        "Define routes",
        "Manage component state",
        "Make HTTP requests",
        "Create CSS styles"
      ],
      correctIndex: 1
    }
  ],
  2: [
    {
      id: "be-1",
      skill: "HTTP",
      question: "Which HTTP status code usually indicates successful resource creation?",
      options: ["200", "201", "401", "500"],
      correctIndex: 1
    },
    {
      id: "be-2",
      skill: "SQL",
      question: "Which SQL clause is used to filter grouped results?",
      options: ["WHERE", "ORDER BY", "HAVING", "LIMIT"],
      correctIndex: 2
    }
  ],
  3: [
    {
      id: "ai-1",
      skill: "Machine Learning",
      question: "Which approach learns from labeled examples?",
      options: [
        "Supervised learning",
        "Unsupervised learning",
        "Random search",
        "Data encryption"
      ],
      correctIndex: 0
    },
    {
      id: "ai-2",
      skill: "Model Evaluation",
      question: "What is a common use of a test dataset?",
      options: [
        "Store passwords",
        "Estimate generalization performance",
        "Design the interface",
        "Replace training data"
      ],
      correctIndex: 1
    }
  ],
  4: [
    {
      id: "da-1",
      skill: "SQL",
      question: "Which SQL function counts rows?",
      options: ["SUM()", "AVG()", "COUNT()", "MAX()"],
      correctIndex: 2
    },
    {
      id: "da-2",
      skill: "Statistics",
      question: "Which measure is the middle value of sorted data?",
      options: ["Mean", "Median", "Variance", "Range"],
      correctIndex: 1
    }
  ],
  5: [
    {
      id: "cy-1",
      skill: "Web Security",
      question: "Which technique helps prevent SQL injection?",
      options: [
        "Plain text passwords",
        "Parameterized queries",
        "Disabling HTTPS",
        "Removing indexes"
      ],
      correctIndex: 1
    },
    {
      id: "cy-2",
      skill: "Authentication",
      question: "What does MFA add to authentication?",
      options: [
        "An additional verification factor",
        "Faster database queries",
        "Automatic backups",
        "More CSS styles"
      ],
      correctIndex: 0
    }
  ],
  6: [
    {
      id: "ux-1",
      skill: "UX Research",
      question: "What is the main purpose of usability testing?",
      options: [
        "Measure server load",
        "Observe users completing tasks",
        "Encrypt information",
        "Optimize SQL queries"
      ],
      correctIndex: 1
    },
    {
      id: "ux-2",
      skill: "UI Design",
      question: "Which principle helps establish visual importance?",
      options: [
        "Visual hierarchy",
        "Random spacing",
        "Inconsistent typography",
        "Removing contrast"
      ],
      correctIndex: 0
    }
  ]
};

export function getQuestionsForGoal(goalId) {
  return questionsByGoal[goalId] ?? [];
}
