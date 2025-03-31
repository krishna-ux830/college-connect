"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const CreatePost = () => {
  const [formData, setFormData] = useState({
    content: "",
    image: null,
  })
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        image: file,
      })

      // Create preview URL for the image
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
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

    // Validate form
    if (!formData.content && !formData.image) {
      return setError("Please add some content or an image to your post")
    }

    setLoading(true)

    try {
      // Create FormData object for file upload
      const postData = new FormData()
      postData.append("content", formData.content)

      if (formData.image) {
        postData.append("image", formData.image)
      }

      await api.post("/api/posts", postData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/")
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Create a New Post</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="content" 
            className="block text-sm font-medium text-text-primary mb-2"
          >
            What's on your mind?
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="4"
            placeholder="Share your thoughts..."
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
        </div>

        <div>
          <label 
            htmlFor="image" 
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Add an Image (optional)
          </label>
          <input 
            type="file" 
            id="image" 
            name="image" 
            onChange={handleChange} 
            accept="image/*"
            className="w-full text-sm text-text-secondary
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-primary/10 file:text-primary
              hover:file:bg-primary/20
              cursor-pointer"
          />

          {preview && (
            <div className="mt-4 relative">
              <img 
                src={preview || "/placeholder.svg"} 
                alt="Preview"
                className="w-full max-h-[400px] object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, image: null })
                  setPreview(null)
                }}
                className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm hover:bg-black/60 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button 
            type="button" 
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost

