import * as crypto from 'crypto'


export function generateMHAS(payload: string, secret: string){

    return crypto.createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

}

export function validateMHAS(rawBody: string, reveivedSignature: string, secret: string){

    const expectedSignature = generateMHAS(rawBody, secret)

    const expectedSignatureBuffer = Buffer.from(expectedSignature)
    const receivedSignatureBuffer = Buffer.from(reveivedSignature)

    if(expectedSignatureBuffer.length !== receivedSignatureBuffer.length){
        return false;
    }

    return crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer)

}