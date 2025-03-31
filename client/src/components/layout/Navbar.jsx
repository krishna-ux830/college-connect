"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import SearchBar from "../common/SearchBar"

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Campus Connect
        </Link>

        {isAuthenticated ? (
          <div className="navbar-menu">
            <SearchBar />
            <Link to="/" className="nav-item">
              Home
            </Link>
            <Link to={`/user/${user?.username}`} className="nav-item">
              Profile
            </Link>
            <div className="nav-item user-menu">
              <div className="user-avatar">
                {user?.profilePic ? (
                  <img src={user.profilePic || "/placeholder.svg"} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">{user?.username.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <span>{user?.username}</span>
                  <small>{user?.role}</small>
                </div>
                <Link to="/profile" className="dropdown-item">
                  Edit Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout">
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="navbar-menu">
            <Link to="/login" className="nav-item">
              Login
            </Link>
            <Link to="/register" className="nav-item">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

