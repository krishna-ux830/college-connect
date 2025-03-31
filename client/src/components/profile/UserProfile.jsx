"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import PostItem from "../posts/PostItem";
import PollItem from "../polls/PollItem";

const UserProfile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userResponse = await api.get(`/api/users/${username}`);
        setUserData(userResponse.data);

        const [postsResponse, pollsResponse] = await Promise.all([
          api.get(`/api/posts/user/${username}`),
          api.get(`/api/polls/user/${username}`),
        ]);

        setPosts(postsResponse.data);
        setPolls(pollsResponse.data);
      } catch (err) {
        setError("Failed to load user data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return <div className="text-center text-lg text-gray-600">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="text-center text-gray-500">User not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        <div className="p-6 flex flex-col sm:flex-row items-center -mt-16">
          {/* Profile Picture */}
          <div className="w-36 h-36 rounded-full border-4 border-white overflow-hidden">
            {userData.profilePic ? (
              <img src={userData.profilePic} alt={userData.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-4xl text-gray-600">
                {userData.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-800">{userData.username}</h1>
            <p className="text-gray-600">{userData.role}</p>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-center text-lg ${
              activeTab === "posts"
                ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts ({posts.length})
          </button>
          <button
            className={`flex-1 py-2 text-center text-lg ${
              activeTab === "polls"
                ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("polls")}
          >
            Polls ({polls.length})
          </button>
        </div>

        {/* Content Section */}
        <div className="mt-4">
          {activeTab === "posts" ? (
            <div>
              {posts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No posts yet.</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostItem key={post._id} post={post} onDelete={(id) => setPosts(posts.filter(p => p._id !== id))} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {polls.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No polls yet.</p>
              ) : (
                <div className="space-y-4">
                  {polls.map((poll) => (
                    <PollItem key={poll._id} poll={poll} onDelete={(id) => setPolls(polls.filter(p => p._id !== id))} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
