import { FaTrash } from "react-icons/fa";
import React, { useState } from 'react';
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../../services/api"
import '../../styles/components/PostItem.css';

const PostItem = ({ post, id, onDelete }) => {
  const { user } = useAuth()
  const { _id, author, content, image, createdAt } = post
  const isFacultyPost = author.role === "faculty"
  const isOwner = user?._id === author._id
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return

    setIsDeleting(true);
    try {
      await api.delete(`/api/posts/${_id}`)
      onDelete(_id) // Call the parent's onDelete function to remove the post from the list
    } catch (error) {
      console.error("Failed to delete post:", error)
      alert("Failed to delete post. Please try again.")
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div id={id} className={`post-item ${isFacultyPost ? "faculty-post" : ""}`}>
      {isFacultyPost && <div className="faculty-badge">Faculty</div>}

      <div className="post-header">
        <div className="post-author">
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
            <span className="post-time">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
          {isOwner && (
            <button className="delete-button" onClick={handleDelete} disabled={isDeleting}>
              <FaTrash className="text-xl" />
            </button>
          )}
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

