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
    <div className="create-post">
      <h2>Create a New Post</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">What's on your mind?</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="4"
            placeholder="Share your thoughts..."
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image">Add an Image (optional)</label>
          <input type="file" id="image" name="image" onChange={handleChange} accept="image/*" />

          {preview && (
            <div className="image-preview">
              <img src={preview || "/placeholder.svg"} alt="Preview" />
              <button
                type="button"
                className="remove-image"
                onClick={() => {
                  setFormData({ ...formData, image: null })
                  setPreview(null)
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost

