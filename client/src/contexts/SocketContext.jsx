import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    console.warn("useSocket must be used within a SocketProvider")
    return null
  }
  return context
}

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      // If there's no user, disconnect any existing socket
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
      autoConnect: true,
      forceNew: true
    })

    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id)
      newSocket.emit("join", user._id)
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected. Reason:", reason)
      if (reason === "io server disconnect") {
        // The disconnection was initiated by the server, you need to reconnect manually
        newSocket.connect()
      }
    })

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Reconnection attempt:", attemptNumber)
    })

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Successfully reconnected after", attemptNumber, "attempts")
      newSocket.emit("join", user._id)
    })

    newSocket.on("error", (error) => {
      console.error("Socket error:", error)
    })

    setSocket(newSocket)

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export { SocketProvider, useSocket }
export default SocketContext 