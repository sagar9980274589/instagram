import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../AxiosInstance";

const Userprofile = () => {
  const { id } = useParams();
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    (async function getUserProfile() {
      try {
        const res = await api.get(`/user/getothersprofile/${id}`);
        if (res.data.success) {
          setSelectedUserData(res.data.user);
          console.log("we got it", res.data.user);
        } else {
          console.log(res.data.message);
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [id]);

  if (!selectedUserData) return <div>Loading...</div>;

  return (
    <div className="profile w-full h-screen">
      <div className="profile flex w-[80%] mx-auto border-b-2 border-slate-400 h-[50%]">
        <div className="image w-[40%] h-[80%] flex justify-center items-center">
          <div className="w-[40%] h-[58%] rounded-full overflow-hidden">
            <img
              src={selectedUserData.profile || 'default-avatar.jpg'}
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        <div className="details w-[60%]">
          <div className="names h-[60%] flex flex-col justify-evenly">
            <span className="font-semibold text-2xl">{selectedUserData.username}</span>

            <div className="flex gap-6 font-semibold">
              <span>{selectedUserData.posts.length} Posts</span>
              <span>{selectedUserData.following.length} Following</span>
              <span>{selectedUserData.followers.length} Followers</span>
            </div>

            <div>{selectedUserData.bio}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 justify-center my-4">
        <span onClick={() => setToggle(false)} className="cursor-pointer text-xl">Posts</span>
        <span onClick={() => setToggle(true)} className="cursor-pointer text-xl">Saved</span>
      </div>

      <div className="grid grid-cols-3 w-[80%] mx-auto gap-2 p-4">
        {(toggle ? selectedUserData.bookmarkedPosts : selectedUserData.posts).map(p => (
          <div key={p._id} className="relative group h-[50vh] border rounded-md">
            <img src={p.image} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-xl">🤍{p.likes.length} 💬{p.comments.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Userprofile;
