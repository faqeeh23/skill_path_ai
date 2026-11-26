import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import ExplorePaths from "./pages/explore/ExplorePaths";
import { DemoProvider } from "./features/demo/store";
import Workspace from "./layouts/Workspace";
import Guard from "./routes/Guard";
import { Pricing, Checkout } from "./features/demo/auth";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
import Register from "./features/auth/pages/Register";
import VerifyEmail from "./features/auth/pages/VerifyEmail";
import Login from "./features/auth/pages/Login"
import StudentDashboard from "./features/student/StudentDashboard";
import Onboarding from "./features/demo/onboarding";
import LearningPaths from "./features/student/pages/LearningPaths";
import PathDetail from "./features/student/pages/PathDetail";
import SkillProfile from "./features/student/pages/SkillProfile";
import Notifications from "./features/student/pages/Notifications";
import Profile from "./features/student/pages/Profile";
import Settings from "./features/student/pages/Settings";
import Lesson from "./features/demo/lesson";
import Assessment from "./features/demo/assessment";
import Projects from "./features/demo/projects";
import Management from "./features/demo/management";
import AdminOverview from "./features/admin/pages/Overview";
import AdminUsers from "./features/admin/pages/Users";
import AdminInstructors from "./features/admin/pages/Instructors";
import AdminCareerGoals from "./features/admin/pages/CareerGoals";
import AdminLearningPaths from "./features/admin/pages/LearningPaths";
import AdminPlatformContent from "./features/admin/pages/PlatformContent";
import AdminSubscriptions from "./features/admin/pages/Subscriptions";
import AdminAnalytics from "./features/admin/pages/Analytics";
import "./styles/Landing.css";
import "./features/demo/styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="paths" element={<ExplorePaths />} />
            <Route path="paths/:pathId" element={<PathDetail />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route
                path="verify-email"
                element={
                    <Guard requireVerified={false}>
                        <VerifyEmail />
                    </Guard>
                }
            />            <Route path="unauthorized" element={<ErrorPage status={401} />} />
            <Route path="forbidden" element={<ErrorPage status={403} />} />
            <Route
              path="onboarding"
              element={
                <Guard role="student">
                  <Onboarding />
                </Guard>
              }
            />
            <Route path="*" element={<ErrorPage />} />
          </Route>
          <Route
            path="dashboard"
            element={
              <Guard role="student">
                <Workspace />
              </Guard>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="path" element={<LearningPaths />} />
            <Route
              path="explore"
              element={<ExplorePaths basePath="/dashboard/explore" />}
            />
            <Route path="explore/:pathId" element={<PathDetail dashboard />} />
            <Route path="lessons/:lessonId" element={<Lesson />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="skills" element={<SkillProfile />} />
            <Route path="progress" element={<SkillProfile />} />
            <Route path="projects" element={<Projects />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="goals" element={<Onboarding />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
          <Route
            path="assessment/initial"
            element={<Navigate to="/dashboard/assessment" replace />}
          />
          <Route
            path="learn/:enrollmentId"
            element={<Navigate to="/dashboard/path" replace />}
          />
          <Route
            path="lessons/:lessonId"
            element={
              <Guard role="student">
                <Workspace />
              </Guard>
            }
          >
            <Route index element={<Lesson />} />
          </Route>
          <Route
            path="quizzes/:quizId"
            element={<Navigate to="/dashboard/assessment" replace />}
          />
          <Route
            path="skills"
            element={<Navigate to="/dashboard/skills" replace />}
          />
          <Route
            path="projects/:enrollmentId"
            element={<Navigate to="/dashboard/projects" replace />}
          />
          <Route
            path="settings"
            element={<Navigate to="/dashboard/settings" replace />}
          />
          <Route
            path="instructor"
            element={
              <Guard role="instructor">
                <Workspace role="instructor" />
              </Guard>
            }
          >
            <Route index element={<Management role="instructor" />} />
            {[
              "paths",
              "lessons",
              "resources",
              "quizzes",
              "students",
              "projects",
            ].map((p) => (
              <Route
                key={p}
                path={p}
                element={<Management role="instructor" />}
              />
            ))}
            <Route path="*" element={<ErrorPage />} />
          </Route>
          <Route
            path="admin"
            element={
              <Guard role="admin">
                <Workspace role="admin" />
              </Guard>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="instructors" element={<AdminInstructors />} />
            <Route path="goals" element={<AdminCareerGoals />} />
            <Route path="paths" element={<AdminLearningPaths />} />
            <Route path="content" element={<AdminPlatformContent />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </DemoProvider>
    </BrowserRouter>
  );
}
