import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import type { CustomUser } from "./types/express.js";

const JWT_SECRET = "qwertyuiop"

export async function authMiddleware(req: Request, res: Response, next: NextFunction){

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "JWT token missing or malformed" });
        return;
    }

    const token = authHeader.split(" ")[1]


    if(!token){
        res.status(401).json({
            message: "JWT token missing"
        })
        return
    }

    try{

        const decoded = await jwt.verify(token, JWT_SECRET)
        req.user = decoded as CustomUser
    }
    catch(err){

        res.status(401).json({
            message: "Wrong JWT token login Failed...❌❌",
            error: err
        })
        return
    }


    next()
}