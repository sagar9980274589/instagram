import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./socketSlice";  // Assuming you have a socketSlice to handle socket connection
import { setOnlineUsers,setMessages} from "./chatSlice";  // Import chatSlice actions
import io from "socket.io-client";
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Myprofile from "./components/Myprofile";
import Chatpage from "./components/Chatpage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.data.userdata);  // Get user data from Redux state
  const socket = useSelector((state) => state.socket.socket); // Get socket instance directly from Redux state

  useEffect(() => {
    // Only initialize socket if user is available and socket instance is not already set
    if (user && user._id && !socket) {
      const socketio = io("http://localhost:3000", {
        query: { userId: user._id },
        transports: ['polling', 'websocket'],
      });

      // Dispatch socket instance to Redux state
      dispatch(setSocket({
        socket: socketio, // Store socket instance
        userId: user._id, // User ID
        connected: socketio.connected, // Connection status
      }));

      // Listen for online users event
      socketio.on("getonlineusers", (onlineusers) => {
        dispatch(setOnlineUsers(onlineusers));
      });

      // Listen for new messages event and add the new message
      socketio.on("newmessage", (newMessage) => {
        dispatch(setMessages(newMessage));
      });

      // Clean up the socket connection on component unmount
      return () => {
        if (socketio) {
          socketio.disconnect(); // Disconnect socket
          dispatch(setSocket({ socket: null, connected: false, userId: null })); // Clear socket info from Redux
        }
      };
    }

    return () => {
      // If socket already exists, clear it (although useEffect's cleanup already handles it)
      if (socket) {
        dispatch(setSocket({ socket: null, connected: false, userId: null }));
      }
    };
  }, [user, socket, dispatch]);  // Ensure effect only runs when user or socket changes

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<><ProtectedRoute><Sidebar /></ProtectedRoute></>}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Myprofile />} />
          <Route path="/chat" element={<Chatpage />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
