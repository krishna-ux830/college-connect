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
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              📝
            </span>
            <div className="flex-1">
              <p className="text-sm text-text-primary">
                <span className="font-medium">{content.author.username}</span> shared a new post:
              </p>
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {content.content.substring(0, 50)}...
              </p>
            </div>
          </div>
        )
      case "Poll":
        return (
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              📊
            </span>
            <div className="flex-1">
              <p className="text-sm text-text-primary">
                <span className="font-medium">{content.author.username}</span> created a new poll:
              </p>
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {content.question}
              </p>
            </div>
          </div>
        )
      default:
        console.log("Unknown notification type:", type)
        return (
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              🔔
            </span>
            <div className="text-sm text-text-primary">
              You have a new notification
            </div>
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Notifications</h2>

      {loading ? (
        <div className="text-center py-8 text-text-secondary">
          Loading notifications...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-text-secondary">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                notification.read 
                  ? "bg-white border-border hover:bg-gray-50" 
                  : "bg-primary/5 border-primary/20 hover:bg-primary/10"
              } ${
                notification.priority 
                  ? "border-l-4 border-faculty" 
                  : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {renderNotificationContent(notification)}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-text-secondary">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                {!notification.read && (
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationPanel

