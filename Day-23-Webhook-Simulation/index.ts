import express, { Request, Response } from 'express'
import { validateMHAS } from './validate';

export const SECRET = "random_secret_123"
const app = express()


app.post('/webhook', express.raw({ type: "application/json" }), (req: Request, res: Response) => {

    const rawBody = req.body.toString('utf8');
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
        res.status(400).json({
            message: "Signature is missing in header❌❌",
            success: false
        })
        return;
    }

    const isValid = validateMHAS(rawBody, signature, SECRET)

    if (!isValid) {
        res.status(400).json({
            message: "Signature validation failed❌❌",
            success: false
        })
        return;

    }
    
    try {
        const payload = JSON.parse(rawBody);
        console.log('✅ Verified Webhook Event:', payload.event);
        res.status(200).send({ status: 'ok' });
    } catch (err) {
        res.status(400).json({ message: "Invalid JSON payload", success: false });
    }

})

app.use(express.json())

app.listen(5000, () => {
    console.log("App is listening at port 5000")
})