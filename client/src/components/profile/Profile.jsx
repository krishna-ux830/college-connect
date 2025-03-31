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
  const [previewUrl, setPreviewUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        profilePic: null,
      })
      setPreviewUrl(user.profilePic || "")
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateEmail = (email) => {
    return email.endsWith("@iiitg.ac.in")
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePic: file,
      }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate email domain
    if (formData.email !== user.email && !validateEmail(formData.email)) {
      return setError("Only IIIT Guwahati email addresses (@iiitg.ac.in) are allowed")
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("username", formData.username)
      formDataToSend.append("email", formData.email)
      if (formData.profilePic) {
        formDataToSend.append("profilePic", formData.profilePic)
      }

      const result = await updateProfile(formDataToSend)
      
      if (result.success) {
        setSuccess("Profile updated successfully!")
      } else {
        setError(result.message || "Failed to update profile. Please try again.")
      }
    } catch (err) {
      console.error("Profile update error:", err)
      setError(err.response?.data?.message || "Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Edit Profile</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-border p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-border">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-text-secondary">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="username@iiitg.ac.in"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base"
              />
              <p className="mt-2 text-sm text-text-secondary">
                Only IIIT Guwahati email addresses are allowed
              </p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Profile

