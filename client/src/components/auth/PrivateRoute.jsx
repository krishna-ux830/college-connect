import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute 