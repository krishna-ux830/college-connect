"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import PostItem from "../posts/PostItem"
import PollItem from "../polls/PollItem"
import NotificationPanel from "../notifications/NotificationPanel"

const Dashboard = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("feed")
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)

        // Fetch posts and polls in parallel
        const [postsResponse, pollsResponse] = await Promise.all([api.get("/api/posts"), api.get("/api/polls")])

        setPosts(postsResponse.data)
        setPolls(pollsResponse.data)
      } catch (err) {
        setError("Failed to load content. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Handle scrolling to specific post when postId is present
  useEffect(() => {
    const postId = searchParams.get("postId")
    if (postId && !loading) {
      // Switch to feed tab if we're on notifications
      setActiveTab("feed")
      
      // Wait for content to load and then scroll
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`) || document.getElementById(`poll-${postId}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        } else {
          // If element not found, try again after a longer delay
          setTimeout(() => {
            const element = document.getElementById(`post-${postId}`) || document.getElementById(`poll-${postId}`)
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }, 1000)
        }
      }, 1000)
    }
  }, [searchParams, posts, polls, loading])

  // Combine and sort posts and polls, with faculty content first
  const combinedContent = [...posts, ...polls].sort((a, b) => {
    // Faculty content first
    if (a.author.role === "faculty" && b.author.role !== "faculty") return -1
    if (a.author.role !== "faculty" && b.author.role === "faculty") return 1

    // Then sort by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <div className="action-buttons">
          <Link to="/create-post" className="btn btn-primary">
            Create Post
          </Link>
          <Link to="/create-poll" className="btn btn-secondary">
            Create Poll
          </Link>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab ${activeTab === "feed" ? "active" : ""}`} onClick={() => setActiveTab("feed")}>
          Feed
        </button>
        <button
          className={`tab ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "feed" ? (
          <div className="feed">
            {loading ? (
              <div className="loading">Loading content...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : combinedContent.length === 0 ? (
              <div className="empty-state">
                <p>No posts or polls yet. Be the first to share something!</p>
              </div>
            ) : (
              <div className="content-list">
                {combinedContent.map((item) =>
                  item.question ? (
                    <PollItem key={`poll-${item._id}`} id={`poll-${item._id}`} poll={item} />
                  ) : (
                    <PostItem key={`post-${item._id}`} id={`post-${item._id}`} post={item} />
                  ),
                )}
              </div>
            )}
          </div>
        ) : (
          <NotificationPanel />
        )}
      </div>
    </div>
  )
}

export default Dashboard

