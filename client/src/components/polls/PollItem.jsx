"use client"
import { FaTrash } from "react-icons/fa";
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../../services/api"

const PollItem = ({ poll, id, onDelete }) => {
  const { user } = useAuth()
  const { _id, author, question, options, votes, createdAt } = poll
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(votes.includes(user?._id))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pollOptions, setPollOptions] = useState(options)
  const isFacultyPoll = author.role === "faculty"
  const isOwner = user?._id === author._id
  const totalVotes = pollOptions.reduce((sum, option) => sum + option.voteCount, 0)
  
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return

    try {
      await api.delete(`/api/polls/${_id}`)
      onDelete(_id) // Call the parent's onDelete function to remove the poll from the list
    } catch (error) {
      console.error("Failed to delete poll:", error)
      alert("Failed to delete poll. Please try again.")
    }
  }

  const handleVote = async () => {
    if (!selectedOption || hasVoted || loading) return

    setLoading(true)
    setError("")

    try {
      const response = await api.post(`/api/polls/${_id}/vote`, {
        optionId: selectedOption,
      })

      // Update poll options with new vote counts
      setPollOptions(response.data.options)
      setHasVoted(true)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit vote. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      id={id} 
      className={`bg-white rounded-lg shadow-sm p-4 max-w-2xl mx-auto ${
        isFacultyPoll ? "border-l-4 border-faculty" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Link to={`/user/${author.username}`} className="flex-shrink-0">
            {author.profilePic ? (
              <img 
                src={author.profilePic || "/placeholder.svg"} 
                alt={author.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                {author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <Link 
              to={`/user/${author.username}`} 
              className="font-medium text-text-primary hover:text-primary transition-colors text-sm"
            >
              <h3>{author.username}</h3>
            </Link>
            <span className="text-xs text-text-secondary">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isFacultyPoll && (
            <div className="px-2 py-0.5 text-xs font-medium text-faculty bg-faculty/10 rounded-full">
              Faculty Poll
            </div>
          )}
          {isOwner && (
            <button 
              onClick={handleDelete} 
              className="text-text-secondary hover:text-error transition-colors"
            >
              <FaTrash className="text-base" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-text-primary text-sm font-medium">{question}</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {pollOptions.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0

            return (
              <div
                key={option._id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  hasVoted 
                    ? "border-border cursor-default" 
                    : selectedOption === option._id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary hover:bg-primary/5"
                }`}
                onClick={() => !hasVoted && setSelectedOption(option._id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {!hasVoted && (
                      <input
                        type="radio"
                        name={`poll-${_id}`}
                        checked={selectedOption === option._id}
                        onChange={() => setSelectedOption(option._id)}
                        disabled={hasVoted}
                        className="w-4 h-4 text-primary border-border focus:ring-primary"
                      />
                    )}
                    <span className="text-sm text-text-primary">{option.text}</span>
                  </div>

                  {hasVoted && (
                    <div className="text-xs text-text-secondary">
                      {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""} ({percentage}%)
                    </div>
                  )}
                </div>

                {hasVoted && (
                  <div className="h-1 bg-border rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!hasVoted && (
          <button 
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            disabled={!selectedOption || loading} 
            onClick={handleVote}
          >
            {loading ? "Submitting..." : "Vote"}
          </button>
        )}

        {hasVoted && (
          <div className="text-xs text-text-secondary text-right">
            Total votes: {totalVotes}
          </div>
        )}
      </div>
    </div>
  )
}

export default PollItem

