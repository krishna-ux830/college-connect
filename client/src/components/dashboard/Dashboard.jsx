"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import PostItem from "../posts/PostItem"
import PollItem from "../polls/PollItem"
import NotificationPanel from "../notifications/NotificationPanel"
import Footer from "../layout/Footer"

const Dashboard = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("feed")
  const [searchParams] = useSearchParams()

  const handlePollDelete = (pollId) => {
    setPolls(polls.filter(poll => poll._id !== pollId))
  }

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId))
  }

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
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-4 md:mb-0">
            Welcome, {user?.username}!
          </h1>
          <div className="flex gap-4">
            <Link 
              to="/create-post" 
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              Create Post
            </Link>
            <Link 
              to="/create-poll" 
              className="bg-primary/90 text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              Create Poll
            </Link>
          </div>
        </div>

        <div className="flex border-b border-border mb-6">
          <button 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "feed"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
            onClick={() => setActiveTab("feed")}
          >
            Feed
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "notifications"
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === "feed" ? (
            <div>
              {loading ? (
                <div className="text-center py-8 text-text-secondary">
                  Loading content...
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              ) : combinedContent.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-text-secondary">
                    No posts or polls yet. Be the first to share something!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {combinedContent.map((item) =>
                    item.question ? (
                      <PollItem 
                        key={`poll-${item._id}`} 
                        id={`poll-${item._id}`} 
                        poll={item} 
                        onDelete={handlePollDelete} 
                      />
                    ) : (
                      <PostItem 
                        key={`post-${item._id}`} 
                        id={`post-${item._id}`} 
                        post={item} 
                        onDelete={handlePostDelete} 
                      />
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
      <Footer />
    </div>
  )
}

export default Dashboard

