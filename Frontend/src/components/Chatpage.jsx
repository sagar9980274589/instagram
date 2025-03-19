import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedUser } from '../UserSlice';
import api from '../AxiosInstance';
import { useForm } from 'react-hook-form';
import MessageSection from './MessageSection';
import { setMessages } from '../chatSlice';
import useGetmessages from '../hooks/getmessages';
import useGetRTM from '../hooks/getRTM';

const Chatpage = () => {
  useGetmessages();
  useGetRTM();
  const { handleSubmit, register, reset, formState: { errors } } = useForm();
  
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();
  const onlineUsers = useSelector((state) => state.chat.onlineusers) || [];
  const selectedUser = useSelector((state) => state.data.selectedUser);
  const [suggested, setsuggested] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState(null);

  const userdata = useSelector((state) => state.data.userdata);

  const sendMessage = async (data) => {
    try {
  
      const response = await api.post(`/user/sendmessage/${selectedUser}`, data);
      if (response.data.sucess) {
        console.log(response.data.newMessage)
        dispatch(setMessages([...messages,response.data.newMessage]));  // Use addMessage for better handling
      } else {
        console.log(response.data);
      }
    } catch (err) {
      console.log(err);
    }
    reset();
  };

  const getSuggestedUsers = async () => {
    try {
      const res = await api.get('/user/getsuggested');
      if (res.data.success) {
        setsuggested(res.data.suggested);
      } else {
        console.log(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUserClick = (id) => {
    dispatch(setSelectedUser(id));

    // Fetch user profile after selecting
    (async function getUserProfile() {
      try {
        const res = await api.get(`/user/getothersprofile/${id}`);
        if (res.data.success) {
          setSelectedUserData(res.data.user);
        } else {
          console.log(res.data.message);
        }
      } catch (err) {
        console.log(err);
      }
    })();
  };

  useEffect(() => {
    getSuggestedUsers();
    return () => {
      dispatch(setSelectedUser(null));  // Clear selected user on unmount
    };
  }, [dispatch]);

  return (
    <>
      <div className="w-[42%] border-0 border-slate-400 h-full overflow-y-scroll">
        <div onClick={() => { dispatch(setSelectedUser(null)); setSelectedUserData(null); }} className="head w-full h-[15%] border-b border-slate-400 flex flex-col justify-center">
          <h1 className="mx-4 font-bold text-xl">{userdata?.username}</h1>
          <p className="text-slate-400 mx-4 mt-2">Messages</p>
        </div>

        <div className="body">
          <div className="mx-6 mt-1.5 box w-[80%] h-full">
            {suggested.map((sug, idx) => {
              if (userdata._id !== sug._id) {
                return (
                  <div onClick={() => handleUserClick(sug._id)} key={idx} className="p-2 my-2 card w-full h-15 flex justify-start items-start gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={sug.profile || null} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <span className="w-52 text-md font-medium flex justify-items-start">{sug.username}</span>
                    <span className={`${onlineUsers.includes(sug._id) ? "text-green-600" : "text-red-600"} font-semibold`}>
                      {onlineUsers.includes(sug._id) ? "Online" : "Offline"}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Chatbox Section */}
      <div className="chatbox w-full h-screen">
        {selectedUserData ? (
          <>
            <div className="border-b border-slate-400 p-2 my-2 card w-full h-15 flex justify-start items-start gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={selectedUserData.profile || null} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="w-52 text-md font-medium flex justify-items-start">{selectedUserData.username}</span>
            </div>
            <div className="chats w-full h-[80%] m-0">
              <MessageSection selectedUser={selectedUserData} />
            </div>
            <div className="sendmessage">
              <form onSubmit={handleSubmit(sendMessage)}>
                <div className="msgbox border border-slate-400 w-[96%] rounded-2xl m-auto h-[50px] flex justify-between items-center">
                  <input {...register("message")} className="w-[80%] h-full outline-0 mx-4 p-2" placeholder="Type your message..." type="text" />
                  <button type="submit">
                    <span className="w-4 mx-6 cursor-pointer material-symbols-outlined">send</span>
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          "Select a user to chat"
        )}
      </div>
    </>
  );
};

export default Chatpage;
