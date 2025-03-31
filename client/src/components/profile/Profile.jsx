"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profilePic: null,
  })
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        profilePic: null,
      })

      if (user.profilePic) {
        setPreview(user.profilePic)
      }
    }
  }, [user])

  const handleChange = (e) => {
    if (e.target.name === "profilePic") {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        profilePic: file,
      })

      // Create preview URL for the image
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Create FormData object for file upload
      const profileData = new FormData()
      profileData.append("username", formData.username)

      if (formData.profilePic) {
        profileData.append("profilePic", formData.profilePic)
      }

      const result = await updateProfile(profileData)

      if (result.success) {
        setSuccess("Profile updated successfully!")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-content">
        <div className="profile-avatar">
          {preview ? (
            <img src={preview || "/placeholder.svg"} alt={user?.username} className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">{user?.username.charAt(0).toUpperCase()}</div>
          )}

          <div className="avatar-upload">
            <label htmlFor="profilePic" className="upload-label">
              Change Profile Picture
            </label>
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              onChange={handleChange}
              accept="image/*"
              className="file-input"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} disabled className="disabled-input" />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              value={user?.role === "faculty" ? "Faculty" : "Student"}
              disabled
              className="disabled-input"
            />
            <small>Role cannot be changed</small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile

