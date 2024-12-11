import { Navigate, Outlet } from "react-router-dom"
import { getAccessToken } from "@/lib/utils"
import {jwtDecode} from "jwt-decode"

interface ProtectedRouteProps {
  roles: ("admin" | "mitra")[]
}

const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const accessToken = getAccessToken()
  console.log("Access token:", accessToken) //Debug.

  if (!accessToken) {
    return <Navigate to="/" replace />
  }

  try {
    const { nama_mitra }: { nama_mitra?: string } = jwtDecode(accessToken)
    const userRole = nama_mitra ? "mitra" : "admin"

    // Check if user's role matches any of the allowed roles
    if (!roles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
    
  } catch (error) {
    console.error("Error decoding token:", error)
    return <Navigate to="/" replace />
  }
}

export default ProtectedRoute