import Register from "./components/Register";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { setonlineusers } from "./chatSlice";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Myprofile from "./components/Myprofile";
import Chatpage from "./components/Chatpage";
import { setsocket } from "./socketSlice"; // Import the action from socketSlice
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.data.userdata);
  const socket = useSelector((state) => state.socket.socketId); // Get socketId from Redux state

  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:3000", {
        query: { userId: user._id },
        transports: ['polling', 'websocket'],
      });

      // Dispatch metadata instead of the entire socket instance
      dispatch(setsocket({
        socketId: socketio.id, 
        connected: socketio.connected
      }));

      // Listening for events from the server
      socketio.on("getonlineusers", (onlineusers) => {
        dispatch(setonlineusers(onlineusers));
      });

      // Cleanup socket on component unmount
      return () => {
        socketio.disconnect();
        dispatch(setsocket({
          socketId: null,
          connected: false,
        })); // Reset socket metadata
      };
    }

    return () => {
      if (socket) {
        // Cleanup the socket if the user logs out or socket is no longer active
        socket.disconnect();
        dispatch(setsocket({
          socketId: null,
          connected: false,
        }));
      }
    };
  }, [user, dispatch, socket]);

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
