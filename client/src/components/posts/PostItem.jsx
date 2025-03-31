"use client"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "../../contexts/AuthContext"

const PostItem = ({ post }) => {
  const { user } = useAuth()
  const { _id, author, content, image, createdAt } = post
  const isFacultyPost = author.role === "faculty"

  return (
    <div className={`post-item ${isFacultyPost ? "faculty-post" : ""}`}>
      {isFacultyPost && <div className="faculty-badge">Faculty</div>}

      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {author.profilePic ? (
              <img src={author.profilePic || "/placeholder.svg"} alt={author.username} />
            ) : (
              <div className="avatar-placeholder">{author.username.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="author-info">
            <h3>{author.username}</h3>
            <span className="post-time">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      <div className="post-content">
        <p>{content}</p>

        {image && (
          <div className="post-image">
            <img src={image || "/placeholder.svg"} alt="Post attachment" />
          </div>
        )}
      </div>

      <div className="post-actions">
        <button className="action-button">
          <i className="far fa-heart"></i> Like
        </button>
        <button className="action-button">
          <i className="far fa-comment"></i> Comment
        </button>
        <button className="action-button">
          <i className="far fa-share-square"></i> Share
        </button>
      </div>
    </div>
  )
}

export default PostItem

