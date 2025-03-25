import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import api from '../../AxiosInstance';
const SearchPage = () => {
const [allusers,setallusers]=useState([])
const serachref=useRef("");
const [matcheduser,setmatcheduser]=useState([])
    async function getalluser() {
        try {
          const res = await api.get('/user/getsuggested');
          if (res.data.success) {
            setallusers(res.data.suggested);
            console.log(res.data.suggested)
          } else {
            console.log(res.data.message);
          }
        } catch (err) {
          console.log(err);
        }
      }
    
useEffect(()=>{
    getalluser();
   
},[])


   
  return (
    <div className='w-full'>
<div className="head flex justify-center flex-col">
    <h1 className='font-semibold text-4xl p-4 flex justify-center  '>Search</h1>
    <div className="serachbox w-[85%] rounded-xl flex justify-between items-center  bg-slate-200 m-auto ">
    <input onChange={
        ()=>{
           

           if(serachref.current.value==="")
           {
setmatcheduser([])
           }
           else{
            setmatcheduser(allusers.filter((user)=>{
               let username=user.username.toLocaleLowerCase();
                return username.includes(serachref.current.value.toLocaleLowerCase())}))

           }
        
        }
}  ref={serachref}value={serachref.current.value} className='w-[96%] p-4 outline-none  text-xl m-auto ' type="text" placeholder='Enter username'/>
    <span  className="material-symbols-outlined  p-2 flex items-center justify-center ">
close
</span>
<span class="material-symbols-outlined p-4">
image_search
</span>
    </div>

</div>
<div className="recommends">{matcheduser.map((user)=>{
    return(
        
         <div key={user._id} className=" p-2 my-2 card w-full h-15 flex ml-25 justify-start items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={user.profile || null} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="w-52 text-md font-medium flex justify-items-start">{user.username}</span>
          </div>
        
    )
})}</div>

    </div>
  )
}

export default SearchPage