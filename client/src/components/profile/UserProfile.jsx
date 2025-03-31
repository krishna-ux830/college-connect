"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import PostItem from "../posts/PostItem"
import PollItem from "../polls/PollItem"
import "../../styles/components/UserProfile.css"

const UserProfile = () => {
  const { username } = useParams()
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("posts") // posts or polls

  const handlePollDelete = (pollId) => {
    setPolls(polls.filter(poll => poll._id !== pollId))
  }

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId))
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        // Fetch user data
        const userResponse = await api.get(`/api/users/${username}`)
        setUserData(userResponse.data)

        // Fetch user's posts and polls
        const [postsResponse, pollsResponse] = await Promise.all([
          api.get(`/api/posts/user/${username}`),
          api.get(`/api/polls/user/${username}`)
        ])

        setPosts(postsResponse.data)
        setPolls(pollsResponse.data)
      } catch (err) {
        setError("Failed to load user data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [username])

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!userData) {
    return <div className="error">User not found</div>
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-cover">
          {/* You can add a cover photo here */}
        </div>
        <div className="profile-info">
          <div className="profile-picture">
            {userData.profilePic ? (
              <img src={userData.profilePic} alt={userData.username} />
            ) : (
              <div className="avatar-placeholder">{userData.username.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="profile-details">
            <h1>{userData.username}</h1>
            <p className="user-role">{userData.role}</p>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === "posts" ? "active" : ""}`} 
            onClick={() => setActiveTab("posts")}
          >
            Posts ({posts.length})
          </button>
          <button 
            className={`tab ${activeTab === "polls" ? "active" : ""}`} 
            onClick={() => setActiveTab("polls")}
          >
            Polls ({polls.length})
          </button>
        </div>

        <div className="content-section">
          {activeTab === "posts" ? (
            <div className="posts-list">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <p>No posts yet.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostItem key={post._id} post={post} onDelete={handlePostDelete} />
                ))
              )}
            </div>
          ) : (
            <div className="polls-list">
              {polls.length === 0 ? (
                <div className="empty-state">
                  <p>No polls yet.</p>
                </div>
              ) : (
                polls.map((poll) => (
                  <PollItem key={poll._id} poll={poll} onDelete={handlePollDelete} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile 