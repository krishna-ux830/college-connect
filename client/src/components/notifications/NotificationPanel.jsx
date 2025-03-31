"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/notifications")
        setNotifications(response.data)
      } catch (err) {
        setError("Failed to load notifications. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`)

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification._id)
    }

    // Navigate to the specific post
    if (notification.type === "Poll") {
      navigate(`/?postId=${notification.content._id}`)
    } else if (notification.type === "Post") {
      navigate(`/?postId=${notification.content._id}`)
    }
  }

  const renderNotificationContent = (notification) => {
    const { type, content } = notification

    switch (type) {
      case "Post":
        return (
          <div className="notification-content">
            <span className="notification-icon post-icon">📝</span>
            <div className="notification-text">
              <strong>{content.author.username}</strong> shared a new post:
              <p className="notification-excerpt">{content.content.substring(0, 50)}...</p>
            </div>
          </div>
        )
      case "Poll":
        return (
          <div className="notification-content">
            <span className="notification-icon poll-icon">📊</span>
            <div className="notification-text">
              <strong>{content.author.username}</strong> created a new poll:
              <p className="notification-excerpt">{content.question}</p>
            </div>
          </div>
        )
      default:
        console.log("Unknown notification type:", type)
        return (
          <div className="notification-content">
            <span className="notification-icon">🔔</span>
            <div className="notification-text">You have a new notification</div>
          </div>
        )
    }
  }

  return (
    <div className="notification-panel">
      <h2>Notifications</h2>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? "read" : "unread"} ${notification.priority ? "priority" : ""}`}
              onClick={() => handleNotificationClick(notification)}
              style={{ cursor: "pointer" }}
            >
              {renderNotificationContent(notification)}
              <div className="notification-meta">
                <span className="notification-time">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                {!notification.read && <span className="unread-indicator"></span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationPanel

