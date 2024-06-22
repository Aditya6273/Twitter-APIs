//Required packages
const express = require ("express")
const env  = require("dotenv").config()
const {v2:cloudinary} = require("cloudinary")
//Routes
const authRouter = require("./routes/authRouter")
const userRouter = require("./routes/userRouter")
const postRouter = require("./routes/postRouter")
const notificationRouter = require("./routes/notificationRouter")

//dbconnection 
const {Dbconnection}= require("./config/mongoose-connection")
const cookieParser = require("cookie-parser")
Dbconnection(process.env.MONGO_URI)
//Variables necessary
const app = express()
const PORT = process.env.PORT

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

//middleware for routes
app.use("/api/auth",authRouter)
app.use('/api/users',userRouter)
app.use("/api/posts",postRouter)
app.use("/api/notifications",notificationRouter)

//server listening 
app.listen(PORT,(e)=>{
    console.log(`Server is running on port ${PORT}`)
})