
import express from 'express'
import { createBlog, getAllBlog, getBlogById } from '../controllers/blogController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = express()

router.post("/create", authMiddleware, createBlog)
router.get("/:blogId", getBlogById)
router.get("/", getAllBlog)

export default router