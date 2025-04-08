"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useSocket } from "../../contexts/SocketContext"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../api/notifications"

const NotificationPanel = ({ onMarkAsRead }) => {
  const { user } = useAuth()
  const socket = useSocket()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications()
        // Filter out notifications created by the current user and sort by date
        const filteredAndSortedNotifications = data
          .filter(notification => notification.content.author._id !== user._id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setNotifications(filteredAndSortedNotifications)
        setError(null)
      } catch (err) {
        setError("Failed to load notifications")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    if (!socket || !user) return

    const handleNewNotification = (notification) => {
      // Only add notification if it's not from the current user
      if (notification.content.author._id !== user._id) {
        setNotifications(prev => [notification, ...prev])
      }
    }

    socket.on("newNotification", handleNewNotification)

    return () => {
      socket.off("newNotification", handleNewNotification)
    }
  }, [socket, user])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
      if (onMarkAsRead) {
        onMarkAsRead()
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
      if (onMarkAsRead) {
        onMarkAsRead()
      }
    } catch (err) {
      setError("Failed to mark all notifications as read")
    }
  }

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification._id)
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
        {notifications.length > 0 && notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

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
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {renderNotificationContent(notification)}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-text-secondary">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
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

