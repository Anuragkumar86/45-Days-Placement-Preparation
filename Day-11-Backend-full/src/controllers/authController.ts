import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { UserSchema } from "../schema/userSchema";

const JWT_SECRET = "QW23E465TGEVNU63F456GH4"

export async function register(req: Request, res: Response) {

    try {

        const { name, email, password, confirmPassword } = req.body

        const safeResult = UserSchema.safeParse({name, email, password})
        if(!safeResult.success){
            console.log(safeResult.error);
             res.status(400).json({
                message: "Zod validation failed",
                status: false,
                error: safeResult.error
            })
            return
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })

        if (user) {
            res.status(409).json({
                message: "Email Already exist",
                status: false
            })
            return
        }

        if (password !== confirmPassword) {
            res.status(409).json({
                message: " Password and confirm password does not match..❌",
                status: false
            })
            return
        }
        const hashed = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: hashed
            }
        })

        res.status(201).json({
            message: " Registration completed successfully Now login with same credentials",
            email: newUser.email
        })
    }
    catch (err) {
        res.status(500).json({
            message: "Registration failed due to server error",
            error: err
        })
        return
    }
}


// Login Controller 
export async function login(req: Request, res: Response) {

    try {


        const { email, password } = req.body

         const safeResult = UserSchema.safeParse({email, password})
        if(!safeResult.success){
            console.log(safeResult.error);
             res.status(400).json({
                message: "Zod validation failed",
                status: false,
                error: safeResult.error
            })
            return
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })

        if (!user) {
            res.status(404).json({
                message: "Email does not Already exist",
                status: false
            })
            return
        }

        const isCorrect = await bcrypt.compare(password, user.password)

        if (!isCorrect) {
            res.status(401).json({
                message: " Password galat hai bhai...❌",
                status: false
            })
            return
        }

        const token = jwt.sign({id: user.id, email: user.email, name: user.name }, JWT_SECRET)


        res.status(200).json({
            message: "Login Success",
            token: token
        })
        return
    }
    catch (err) {
        res.status(500).json({
            message: "Login failed due to server error",
            error: err
        })
        return
    }
}