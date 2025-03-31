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
    <div id={id} className={`poll-item ${isFacultyPoll ? "faculty-poll" : ""}`}>
      {isFacultyPoll && <div className="faculty-badge">Faculty Poll</div>}

      <div className="poll-header">
        <div className="poll-author">
          <Link to={`/user/${author.username}`} className="author-avatar">
            {author.profilePic ? (
              <img src={author.profilePic || "/placeholder.svg"} alt={author.username} />
            ) : (
              <div className="avatar-placeholder">{author.username.charAt(0).toUpperCase()}</div>
            )}
          </Link>
          <div className="author-info">
            <Link to={`/user/${author.username}`} className="author-name">
              <h3>{author.username}</h3>
            </Link>
            <span className="poll-time">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
          {isOwner && (
            <button className="delete-button" onClick={handleDelete}>
              <FaTrash className="text-xl" />
            </button>
          )}
        </div>
      </div>

      <div className="poll-content">
        <h3 className="poll-question">{question}</h3>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="poll-options">
          {pollOptions.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0

            return (
              <div
                key={option._id}
                className={`poll-option ${hasVoted ? "voted" : ""} ${selectedOption === option._id ? "selected" : ""}`}
                onClick={() => !hasVoted && setSelectedOption(option._id)}
              >
                <div className="option-content">
                  <div className="option-text">
                    {!hasVoted && (
                      <input
                        type="radio"
                        name={`poll-${_id}`}
                        checked={selectedOption === option._id}
                        onChange={() => setSelectedOption(option._id)}
                        disabled={hasVoted}
                      />
                    )}
                    <span>{option.text}</span>
                  </div>

                  {hasVoted && (
                    <div className="vote-count">
                      {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""} ({percentage}%)
                    </div>
                  )}
                </div>

                {hasVoted && (
                  <div className="vote-bar">
                    <div className="vote-progress" style={{ width: `${percentage}%` }}></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!hasVoted && (
          <button className="btn btn-primary vote-button" disabled={!selectedOption || loading} onClick={handleVote}>
            {loading ? "Submitting..." : "Vote"}
          </button>
        )}

        {hasVoted && <div className="total-votes">Total votes: {totalVotes}</div>}
      </div>
    </div>
  )
}

export default PollItem

