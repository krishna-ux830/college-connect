"use client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { SocketProvider } from "./contexts/SocketContext"
import PrivateRoute from "./components/auth/PrivateRoute"
import Navbar from "./components/layout/Navbar"
import Home from "./pages/Home"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import Dashboard from "./components/dashboard/Dashboard"
import CreatePost from "./components/posts/CreatePost"
import CreatePoll from "./components/polls/CreatePoll"
import Profile from "./components/profile/Profile"
import UserProfile from "./components/profile/UserProfile"
import NotFound from "./components/common/NotFound"

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={

                    <Dashboard />

                  }
                />
                <Route
                  path="/create-post"
                  element={
                    <PrivateRoute>
                      <CreatePost />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-poll"
                  element={
                    <PrivateRoute>
                      <CreatePoll />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/user/:username"
                  element={
                    <PrivateRoute>
                      <UserProfile />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

