"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useSocket } from "../../contexts/SocketContext"
import { getNotifications } from "../../api/notifications"
import SearchBar from "../common/SearchBar"

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const socket = useSocket()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const notifications = await getNotifications()
        const unread = notifications.filter(n => !n.read).length
        setUnreadCount(unread)
      } catch (err) {
        console.error("Failed to fetch unread count:", err)
      }
    }

    if (user) {
      fetchUnreadCount()
    }
  }, [user])

  useEffect(() => {
    if (!socket) return

    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1)
    }

    socket.on("newNotification", handleNewNotification)

    return () => {
      socket.off("newNotification", handleNewNotification)
    }
  }, [socket])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const getRoleColor = (role) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800'
      case 'faculty':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary hover:text-primary-hover transition-colors">
            Campus Connect
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <SearchBar />
              <Link to="/" className="text-text-secondary hover:text-primary transition-colors">
                Home
              </Link>
              <Link to={`/user/${user?.username}`} className="text-text-secondary hover:text-primary transition-colors">
                Profile
              </Link>
              <div className="relative user-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-text-primary font-semibold">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic || "/placeholder.svg"}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user?.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-border overflow-hidden">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-border bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-text-primary font-semibold">
                          {user?.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{user?.username.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{user?.username}</div>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                            {user?.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          handleLogout()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

