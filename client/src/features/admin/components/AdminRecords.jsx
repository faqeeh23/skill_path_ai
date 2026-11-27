import { faBookOpen, faBullseye, faRoute } from "@fortawesome/free-solid-svg-icons";
import RecordManager from "../../management/components/RecordManager";

const pages = {
  goals: { title: "Career goals", noun: "career goal", icon: faBullseye, description: "Organize the career outcomes available to learners." },
  paths: { title: "Learning paths", noun: "learning path", icon: faRoute, description: "Manage the curricula learners can explore and enroll in." },
  content: { title: "Platform content", noun: "lesson", icon: faBookOpen, description: "Review lessons, media processing, and publishing status." },
};

export default function AdminRecords({ kind }) {
  return <RecordManager kind={kind} presentation={pages[kind]} />;
}
