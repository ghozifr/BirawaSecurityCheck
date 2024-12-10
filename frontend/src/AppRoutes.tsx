import { Route, Routes } from "react-router-dom"
import Home from "@/pages/LoginPage"
import Dashboard from "@/pages/DashboardPage"
import Ceklaporan from "@/pages/CekLaporanPage"
import Inbox from "@/pages/InboxPage"
import NotFound from "@/pages/NotFoundPage"
import Forgotpassword from "@/pages/ForgotPasswordPage"
import Layout from "@/components/custom/layout/Layout"
import SettingsPage from "@/pages/SettingsPage"
import MobilePage from "@/pages/MobilePage"
import useDetection from "@/hooks/useDetection"
import DaftarPekerjaan from "@/pages/Mitra/buatlaporan/DaftarPekerjaanPage"
import TambahMitraPage from "@/pages/CPM/tambahmitra/TambahMitraPage"
import ProtectedRoute from "@/auth/ProtectedRoute"
import DaftarMitraPage from "@/pages/CPM/tambahmitra/DaftarMitraPage"
import MitraDetailPage from "@/pages/CPM/detailmitra/MitraDetailPage"
import BuatLaporanPage from "@/pages/Mitra/buatlaporan/BuatLaporanPage"
import BuatLaporanPageTest from "@/pages/Mitra/buatlaporan-jeki/BuatLaporanPageTest.tsx"

function AppRoutes() {
  const isMobile = useDetection(620)

  if (isMobile) {
    return (
      <Routes>
        <Route path="*" element={<MobilePage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/forgotpassword" element={<Forgotpassword />} />

      {/* Shared Routes (Admin & Mitra) */}
      <Route element={<ProtectedRoute roles={["admin", "mitra"]} />}>
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/ceklaporan"
          element={
            <Layout>
              <Ceklaporan />
            </Layout>
          }
        />
        <Route
          path="/inbox"
          element={
            <Layout>
              <Inbox />
            </Layout>
          }
        />
        <Route path="/settings/*" element={<SettingsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route
          path="/daftarmitra"
          element={
            <Layout>
              <DaftarMitraPage />
            </Layout>
          }
        />
        <Route
          path="/daftarmitra/detailmitra/:nama_mitra"
          element={
            <Layout>
              <MitraDetailPage />
            </Layout>
          }
        />
        <Route
          path="daftarmitra/tambahmitra"
          element={
            <Layout>
              <TambahMitraPage />
            </Layout>
          }
        />
      </Route>

      {/* Mitra Routes */}
      <Route element={<ProtectedRoute roles={["mitra"]} />}>
        <Route
          path="/daftarpekerjaan"
          element={
            <Layout>
              <DaftarPekerjaan />
            </Layout>
          }
        />
        <Route
          path="/daftarpekerjaan/buatlaporan"
          element={
            <Layout>
              <BuatLaporanPage />
            </Layout>
          }
        />
        <Route
          path="/daftarpekerjaan/buatlaporan-test"
          element={
            <Layout>
              <BuatLaporanPageTest />
            </Layout>
          }
        />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
