import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { BlogSchema } from "../schema/blogSchema";

export async function createBlog(req: Request, res: Response) {

    try {
        const { title, description, source } = req.body

        const safeResult = BlogSchema.safeParse({ title, description, source })
        if (!safeResult.success) {
            console.log(safeResult.error);
            res.status(400).json({
                message: "Zod validation failed",
                status: false,
                error: safeResult.error
            })
            return
        }

        if (!title || !description || !source) {
            res.status(422).json({
                message: "All fields are required"
            })
            return
        }

        const newBlog = await prisma.blog.create({
            data: {
                title: title,
                description: description,
                source: source,
                authorId: Number(req.user?.id) 
            }
        })

        res.status(201).json({
            message: "Blog created success",
            blog: newBlog
        })
        return
    }
    catch (err) {
        res.status(500).json({
            message: "Server error in creating blog",
            error: err
        })
        return
    }
}

export async function getBlogById(req: Request, res: Response) {

    try {
        const { blogId } = await req.params

        if (!blogId) {
            res.status(404).json({
                message: "BlogId is missing"
            })
            return
        }

        const blog = await prisma.blog.findUnique({
            where: {
                id: Number(blogId)
            }
        })

        res.status(201).json({
            message: "Blog feached successfully",
            blog: blog
        })
        return
    }
    catch (err) {
        res.status(500).json({
            message: "Server error in getting blog",
            error: err
        })
        return
    }
}


export async function getAllBlog(req: Request, res: Response) {

    try {

        const blog = await prisma.blog.findMany({})

        res.status(201).json({
            message: "Blog feached successfully",
            blog: blog
        })
        return
    }
    catch (err) {
        res.status(500).json({
            message: "Server error in getting blog",
            error: err
        })
        return
    }
}