"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
        setResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleUserClick = (username) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    navigate(`/user/${username}`);
  };

  return (
    <div className="relative w-72 md:w-80" ref={searchRef}>
      {/* Search Input */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full p-2 pr-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {results.map((user) => (
            <div
              key={user._id}
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleUserClick(user.username)}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-gray-600 text-lg">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>

              {/* User Info */}
              <div className="ml-3">
                <span className="block font-medium text-gray-800">{user.username}</span>
                <span className="block text-xs text-gray-500">{user.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
