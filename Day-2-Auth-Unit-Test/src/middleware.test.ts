import {describe, expect, it, jest} from '@jest/globals';

import { authMiddleware } from "./middleware.js"
import jwt from "jsonwebtoken"
describe("This is Testing Auth Middleware", () => {

    
    it("Should fail with status code 401 and message 'JWT token missing or malformed'" , async() =>{
        const req : any = {
            headers: {}
        }
        const res : any =  {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        const next : any = jest.fn()

        await authMiddleware(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            message: "JWT token missing or malformed"
        })
    })

// -------------------- Test-2/- Must pass------------------------

it("should attach decoded user to req and call next() when token is valid" , async() =>{
        const JWT_SECRET = "qwertyuiop"
        const payload = {
            name: "Anurag",
            email: "anurag@gmail.com"
        }
        
        const token = jwt.sign(payload, JWT_SECRET)
        
        const req1 : any = {
            headers: {authorization : `Bearer ${token}`}
        }
        const res1 : any =  {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        const next1 : any = jest.fn()
        
        await authMiddleware(req1, res1, next1)

        expect(req1.user).toBeDefined()
        expect(req1.user.email).toBe("anurag@gmail.com")
        expect(next1).toHaveBeenCalled()
    })
})