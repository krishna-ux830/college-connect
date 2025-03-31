"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import api from "../../services/api"

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/notifications")
        setNotifications(response.data)
      } catch (err) {
        setError("Failed to load notifications. Please try again later.")
        console.error(err)
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

  const renderNotificationContent = (notification) => {
    const { type, content } = notification

    switch (type) {
      case "post":
        return (
          <div className="notification-content">
            <span className="notification-icon post-icon">📝</span>
            <div className="notification-text">
              <strong>{content.author.username}</strong> shared a new post:
              <p className="notification-excerpt">{content.content.substring(0, 50)}...</p>
            </div>
          </div>
        )
      case "poll":
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
              onClick={() => !notification.read && markAsRead(notification._id)}
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

