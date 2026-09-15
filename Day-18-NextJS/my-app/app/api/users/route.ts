import connectDB from "@/lib/db";
import User from "@/models/user";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request){

    try{

        await connectDB()
        const body = await req.json()
        
        const newUser = await User.create(body)
        return NextResponse.json({message: "User Added Successfully", success: true, data: newUser})
    }
    catch(err){
        return NextResponse.json({message: `Error while adding the new User`, success: true, error: err})

    }

}


export async function GET(req: Request){

    try{

        await connectDB()
        
        const Users = await User.find({})
        return NextResponse.json({message: "Users feached Successfully", success: true, data: Users})
    }
    catch(err){
        return NextResponse.json({message: `Error while adding the new User`, success: true, error: err})

    }

}