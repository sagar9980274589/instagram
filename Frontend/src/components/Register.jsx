import React from 'react'
import logo from '../assets/logo.png'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const sucess=(message)=>{
    toast.success(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      
      });
   } 
  const navigate=useNavigate();
    async function submithandler (data){
      
      
        
        try{
      const response=  await axios.post("http://localhost:3000/user/register",data);
      if( response.status==200){
     sucess("registerd")
     navigate("/login")
      
        }
        
      }
        catch(err)
        {

toast.error(err.response?.data?.message, {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    
    });
        }
       
        
    }
    const {register,handleSubmit,formState:{isLoading}}=useForm();
  return (
    <div className='w-full h-screen flex justify-center items-center '>
       
       
        <div className="form w-100% flex flex-col border-2 border-slate-200 lg:w-[25%] m-auto h-[97%] items-center p-0 justify-center">
        <img src={logo} className='w-[50%]'/>
        <span className='w-[55%]  text-center font-bold text-slate-500'>Sign up to see photos and videos from your friends.
        </span>
        <form  onSubmit={handleSubmit(submithandler)} className='flex w-[100%] h-[60%] flex-col items-center justify-center '>
            {/* <div className="inputs w-[100%] flex flex-col items-center  "> */}
            <input  {...register('email')}   name='email' className='mx-auto bg-sky-50 my-2  border-1 rounded-sm w-[80%]  border-black p-2 ' required placeholder='Email' type='email'/>
            <input {...register('password')} name='password' className='mx-auto bg-sky-50 my-2  border-1 rounded-sm w-[80%]  border-black p-2 ' required placeholder='password' type='password'/>
            <input {...register('username')} name='username' className='mx-auto bg-sky-50 my-2  border-1 rounded-sm w-[80%]  border-black p-2 ' required placeholder='username' type='text'/>
            <input {...register('fullname')} name='fullname' className='mx-auto bg-sky-50  my-2 border-1 rounded-sm w-[80%]  border-black p-2' required placeholder='fullname' type='text'/>
            {/* </div> */}
             <p className='text-center my-1 text-slate-400 text-sm w-[80%] m-x-auto'>People who use our service may have uploaded your contact information to Instagram. Learn More

By signing up, you agree to our Terms , Privacy Policy and Cookies Policy</p>
            <button  disabled={isLoading}   className='bg-blue-400 cursor-pointer my-1 text-white m-x-auto w-[80%] p-2 rounded-md' type='submit'>{isLoading?"Registering...":"Sign up"}</button>
            </form>
            <span className='text-center text-black-400 text-sm w-[30%] m-x-auto' >Have an account?</span>
            <span className='text-blue-400 cursor-pointer' onClick={()=>{navigate("/login")}}>Log in</span>
        </div>

    </div>
  )
}

export default Register