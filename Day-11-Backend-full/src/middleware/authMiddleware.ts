import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { User } from "../../generated/prisma/client";

const JWT_SECRET = "QW23E465TGEVNU63F456GH4"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    try {

        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(404).json({
                message: " Authorization Header missing Or wrong token format",
                status: false
            })
            return
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(token, JWT_SECRET)

        if (!decoded) {
            res.status(401).json({
                message: " Wrong JWT token",
                status: false
            })
            return
        }

        req.user = decoded as User
        next()
    }
    catch (err) {
        res.status(500).json({
            message: "Server error in middleware",
            error: err
        })
        return
    }

}