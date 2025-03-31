"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const CreatePoll = () => {
  const [formData, setFormData] = useState({
    question: "",
    options: ["", ""], // Start with two empty options
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleQuestionChange = (e) => {
    setFormData({
      ...formData,
      question: e.target.value,
    })
  }

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options]
    updatedOptions[index] = value

    setFormData({
      ...formData,
      options: updatedOptions,
    })
  }

  const addOption = () => {
    if (formData.options.length < 10) {
      // Limit to 10 options
      setFormData({
        ...formData,
        options: [...formData.options, ""],
      })
    }
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      // Maintain at least 2 options
      const updatedOptions = formData.options.filter((_, i) => i !== index)

      setFormData({
        ...formData,
        options: updatedOptions,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!formData.question.trim()) {
      return setError("Please enter a question")
    }

    // Check if all options have content
    const emptyOptions = formData.options.filter((option) => !option.trim())
    if (emptyOptions.length > 0) {
      return setError("All options must have content")
    }

    // Check for duplicate options
    const uniqueOptions = new Set(formData.options.map((opt) => opt.trim()))
    if (uniqueOptions.size !== formData.options.length) {
      return setError("All options must be unique")
    }

    setLoading(true)

    try {
      await api.post("/api/polls", {
        question: formData.question,
        options: formData.options.map((text) => ({ text })),
      })

      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create poll. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/")
  }

  return (
    <div className="create-poll">
      <h2>Create a New Poll</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Question</label>
          <input
            type="text"
            id="question"
            value={formData.question}
            onChange={handleQuestionChange}
            placeholder="Ask a question..."
            required
          />
        </div>

        <div className="form-group">
          <label>Options</label>
          {formData.options.map((option, index) => (
            <div key={index} className="option-input">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
              {formData.options.length > 2 && (
                <button type="button" className="remove-option" onClick={() => removeOption(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}

          {formData.options.length < 10 && (
            <button type="button" className="btn btn-secondary add-option" onClick={addOption}>
              Add Option
            </button>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Poll..." : "Create Poll"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePoll

