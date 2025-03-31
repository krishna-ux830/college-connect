"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"

const PollItem = ({ poll, id }) => {
  const { user } = useAuth()
  const { _id, author, question, options, votes, createdAt } = poll
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(votes.includes(user?._id))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pollOptions, setPollOptions] = useState(options)

  const isFacultyPoll = author.role === "faculty"
  const totalVotes = pollOptions.reduce((sum, option) => sum + option.voteCount, 0)

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
          <div className="author-avatar">
            {author.profilePic ? (
              <img src={author.profilePic || "/placeholder.svg"} alt={author.username} />
            ) : (
              <div className="avatar-placeholder">{author.username.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="author-info">
            <h3>{author.username}</h3>
            <span className="poll-time">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
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

