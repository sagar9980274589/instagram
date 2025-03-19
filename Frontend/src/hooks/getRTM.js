import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../chatSlice";  // Action for setting messages
import { setSocket } from "../socketSlice";  // Action for setting socket in Redux
import io from "socket.io-client";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.data.userdata); // Get user data from Redux
  const { socket, userId, connected } = useSelector((state) => state.socket); // Get socket and userId from Redux
  const messages = useSelector((state) => state.chat.messages) || [];

  useEffect(() => {
   

   

      // Listen for "newMessage" event only if socket is available
      const handleNewMessage = (newMessage) => {
        console.log("New message received:", newMessage);
        dispatch(setMessages(newMessage)); // Dispatch the new message
      };

      if (socket) {
        socket.on("newMessage", handleNewMessage);
      }

      // Cleanup socket event listener and disconnect on component unmount or when user changes
      return () => {
        if (socket) {
          socket.off("newMessage");
          console.log("Socket event listener cleaned up.");
        }
      };
    
  }, [dispatch, user, socket]); // Depend on user and socket

  // Don't establish a new socket connection if socket is already available in Redux
  if (socket && connected) {
    console.log("Socket is already connected.");
  }

};

export default useGetRTM;
