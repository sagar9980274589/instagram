import express, { urlencoded } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './db/db.js'
import cookieParser from 'cookie-parser'
dotenv.config({})

const app=express()
app.use(express.json())
app.use(urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    Credential:true
}))
//routes
import userRoute from './route/user.route.js'

app.use('/user',userRoute)


const port=process.env.PORT

app.get('/',(req,res)=>{
    res.send("hiiii")
})
app.listen(port,()=>{
    connectDB();
    console.log(`server running on port ${port}`)
})