import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./socketSlice"; // Manage socket state in Redux
import { setOnlineUsers, addMessage } from "./chatSlice"; // Manage chat state
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
  const user = useSelector((state) => state.data.userdata); // Get user from Redux
  const socket = useSelector((state) => state.socket.socket); // Get socket from Redux

  useEffect(() => {
    if (user && user._id && !socket) {
     

      const socketio = io("http://localhost:3000", {
        query: { userId: user._id },
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socketio.on("connect", () => {
   
        dispatch(setSocket(socketio)); // Store socket instance directly in Redux
      });

      socketio.on("getonlineusers", (onlineusers) => {
    
        dispatch(setOnlineUsers(onlineusers));
      });

      socketio.on("newMessage", (newMessage) => {
       
        dispatch(addMessage(newMessage));
      });

      return () => {
        console.log("❌ Disconnecting socket...");
        socketio.disconnect();
        dispatch(setSocket(null)); // Reset socket in Redux
      };
    }
  }, [user, dispatch]); // Removed `socket` from dependency array

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
        <Route path="/" element={<ProtectedRoute><Sidebar /></ProtectedRoute>}>
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
