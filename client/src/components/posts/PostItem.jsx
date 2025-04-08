import { FaTrash } from "react-icons/fa";
import React, { useState } from 'react';
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../../services/api"

const PostItem = ({ post, id, onDelete }) => {
  const { user } = useAuth()
  const { _id, author, content, image, likes, createdAt } = post
  const isFacultyPost = author.role === "faculty"
  const isOwner = user?._id === author._id
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [postLikes, setPostLikes] = useState(likes || []);
  const hasLiked = postLikes.includes(user?._id);

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

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (hasLiked) {
        await api.post(`/api/posts/${_id}/unlike`);
        setPostLikes(postLikes.filter(id => id !== user._id));
      } else {
        await api.post(`/api/posts/${_id}/like`);
        setPostLikes([...postLikes, user._id]);
      }
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
      alert("Failed to like/unlike post. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      id={id}
      className={`bg-white rounded-lg shadow-sm p-4 max-w-2xl mx-auto ${isFacultyPost ? "border-l-4 border-faculty" : ""
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
          {isFacultyPost && (
            <div className="bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-medium text-faculty bg-faculty/10 rounded-full">
              Faculty
            </div>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-text-secondary hover:text-error transition-colors disabled:opacity-50"
            >
              <FaTrash className="text-base" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-text-primary text-sm whitespace-pre-wrap">{content}</p>

        {image && (
          <div className="rounded-lg overflow-hidden max-h-[400px]">
            <img
              src={image || "/placeholder.svg"}
              alt="Post attachment"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center space-x-2 transition-colors text-sm ${hasLiked ? "text-primary" : "text-text-secondary hover:text-primary"
            }`}
        >
          <i className={`${hasLiked ? "fas" : "far"} fa-heart`}></i>
          <span>{postLikes.length} {postLikes.length === 1 ? "Like" : "Likes"}</span>
        </button>
        <button className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors text-sm">
          <i className="far fa-comment"></i>
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors text-sm">
          <i className="far fa-share-square"></i>
        </button>
      </div>
    </div>
  )
}

export default PostItem