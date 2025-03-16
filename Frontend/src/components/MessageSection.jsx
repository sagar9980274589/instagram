import React from 'react'

const MessageSection = ({selectedUser}) => {
  return (
  <>
  <div className="userinfo flex justify-center items-center flex-col">
  <div className="w-24 h-24 mt-8 rounded-full overflow-hidden ">
            <img src={selectedUser.profile || null} alt="Profile" className="w-full h-full object-cover" />

          </div>
          <span>{selectedUser.fullname} </span>
          <span>{selectedUser.username} </span>
          <button className='rounded-md bg-slate-100 px-3 py-1 mt-2'>View Profile</button>
  </div>
  <div className="messages flex flex-col">
{
    [1,2,3,4,5].map(
        (elem,idx)=>{
           return <span key={idx}>{elem}</span>
        }
        )
}
  </div>
  </>
  )
}

export default MessageSection