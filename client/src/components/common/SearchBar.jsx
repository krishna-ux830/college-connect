"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import "../../styles/components/SearchBar.css"

const SearchBar = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      try {
        setLoading(true)
        const response = await api.get(`/api/users/search?query=${encodeURIComponent(query)}`)
        setResults(response.data)
        setShowResults(true)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleUserClick = (username) => {
    setQuery("")
    setResults([])
    setShowResults(false)
    navigate(`/user/${username}`)
  }

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="search-input"
        />
        {loading && <div className="search-spinner"></div>}
      </div>

      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((user) => (
            <div
              key={user._id}
              className="search-result-item"
              onClick={() => handleUserClick(user.username)}
            >
              <div className="result-avatar">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="result-info">
                <span className="result-username">{user.username}</span>
                <span className="result-role">{user.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar 