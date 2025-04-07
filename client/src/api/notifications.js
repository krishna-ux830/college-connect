import api from "../services/api"

export const getNotifications = async () => {
  const response = await api.get("/api/notifications")
  return response.data
}

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/api/notifications/${notificationId}/read`)
  return response.data
}

export const markAllNotificationsAsRead = async () => {
  const response = await api.put("/api/notifications/read-all")
  return response.data
}

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/api/notifications/${notificationId}`)
  return response.data
} 