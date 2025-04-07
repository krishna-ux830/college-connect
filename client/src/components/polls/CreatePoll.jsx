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
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Create a New Poll</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Question
          </label>
          <input
            type="text"
            id="question"
            value={formData.question}
            onChange={handleQuestionChange}
            placeholder="Ask a question..."
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Options
          </label>
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {formData.options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="w-full px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              Add Option
            </button>
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
            {loading ? "Creating Poll..." : "Create Poll"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePoll

