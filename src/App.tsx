import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'
import CoursesPage from './pages/public/CoursesPage'
import CourseDetailsPage from './pages/public/CourseDetailsPage'
import LoginPage from './pages/public/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import LeadsPage from './pages/admin/LeadsPage'
import AdminCoursesPage from './pages/admin/AdminCoursesPage'
import AdminBlacklistPage from './pages/admin/AdminBlacklistPage'
import RegisterPage from './pages/public/RegisterPage'
import ProfilePage from './pages/public/ProfilePage'
import AdminCommunityPage from './pages/admin/AdminCommunityPage'
import VerifyCertificatePage from './pages/public/VerifyCertificatePage'
import WorkshopsPage from './pages/public/WorkshopsPage'
import WorkshopDetailsPage from './pages/public/WorkshopDetailsPage'
import AdminWorkshopsPage from './pages/admin/AdminWorkshopsPage'
import WhatsAppButton from './components/WhatsAppButton'
import AdminLayout from './components/AdminLayout'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/workshops/:id" element={<WorkshopDetailsPage />} />
        <Route path="/verify-certificate" element={<VerifyCertificatePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
        <Route path="/admin/community" element={<AdminLayout><AdminCommunityPage /></AdminLayout>} />
        <Route path="/admin/courses" element={<AdminLayout><AdminCoursesPage /></AdminLayout>} />
        <Route path="/admin/workshops" element={<AdminLayout><AdminWorkshopsPage /></AdminLayout>} />
        <Route path="/admin/leads" element={<AdminLayout><LeadsPage /></AdminLayout>} />
        <Route path="/admin/blacklist" element={<AdminLayout><AdminBlacklistPage /></AdminLayout>} />
      </Routes>
      <WhatsAppButton />
    </>
  )
}
export default App