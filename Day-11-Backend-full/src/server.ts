import express, { Request, Response } from "express"
import authRoutes from './routes/authRoutes'
import blogRoutes from './routes/blogRoutes'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.json())

app.get("/health", (req: Request, res: Response) =>{
    res.status(200).json({
        message: "Server is healthy",
        status: true
    })
})

app.use("/api/auth", authRoutes)
app.use("/api/blog", blogRoutes)

app.listen(PORT, () =>{
    console.log("App is listening at port 5000")
})