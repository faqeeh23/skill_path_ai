
import {
  faCode, faServer, faBrain,
  faChartLine, faShieldHalved, faPalette,
  faSeedling, faFlask, faRocket
} from "@fortawesome/free-solid-svg-icons";

export const careerGoals = [
  {
    id: 1,
    title: "Frontend Developer",
    description: "Build interactive and responsive web interfaces.",
    icon: faCode,
    skills: ["HTML", "CSS", "JavaScript", "React"]
  },
  {
    id: 2,
    title: "Backend Developer",
    description: "Build APIs, databases, and server-side systems.",
    icon: faServer,
    skills: ["PHP", "Laravel", "SQL", "REST APIs"]
  },
  {
    id: 3,
    title: "AI / ML Engineer",
    description: "Develop intelligent applications and ML models.",
    icon: faBrain,
    skills: ["Python", "Statistics", "Machine Learning"]
  },
  {
    id: 4,
    title: "Data Analyst",
    description: "Discover insights from complex datasets.",
    icon: faChartLine,
    skills: ["SQL", "Python", "Data Visualization"]
  },
  {
    id: 5,
    title: "Cybersecurity Specialist",
    description: "Understand and protect digital systems.",
    icon: faShieldHalved,
    skills: ["Networking", "Linux", "Web Security"]
  },
  {
    id: 6,
    title: "UI/UX Designer",
    description: "Design intuitive digital experiences.",
    icon: faPalette,
    skills: ["UX Research", "Figma", "Prototyping"]
  }
];

export const experienceLevels = [
  {
    id: "beginner",
    title: "Beginner",
    icon: faSeedling,
    description: "I'm starting from the fundamentals."
  },
  {
    id: "intermediate",
    title: "Intermediate",
    icon: faFlask,
    description: "I know the basics and have built some projects."
  },
  {
    id: "advanced",
    title: "Advanced",
    icon: faRocket,
    description: "I have experience and want to identify deeper skill gaps."
  }
];
