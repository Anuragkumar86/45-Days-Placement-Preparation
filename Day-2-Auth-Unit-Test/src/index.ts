import express, { type Request, type Response } from 'express'
import jwt from "jsonwebtoken"
import { authMiddleware } from './middleware.js'
const app = express()
app.use(express.json())

const JWT_SECRET = "qwertyuiop"
const users = [
    {
        name: "Anurag",
        email: "anuragg@gmail.com",
        password: "12345678a"
    }
]
app.post("/login", async (req, res) => {
    const {email , password} = req.body

    if(!users.find(u => u.email === email)){
        res.status(404).json({
            message: "User not found"
        })
        return;
    }
    
    const user = users.find(u => u.email = email)
    
    if(user?.password !== password){
        res.status(404).json({
            message: "Password galat hai bhai"
        })
        return;

    }
    const payload = {
        name: user?.name,
        email: email
    }
    const token =  jwt.sign(payload, JWT_SECRET)

    res.status(200).json({
        message: "User Logged in Success...✅✅",
        token: token
    })
})

app.get("/protected", authMiddleware , (req:Request, res: Response) => {
    const user = req.user

    console.log("User is ", user)

    res.json({
        message: `User is mill gya`,
        user: user
    })
})

app.listen(6000, () => {
    console.log("App is listening on 6000")
})