const  axios = require('axios');
const  express = require('express');
const  expressAsyncHandler = require('express-async-handler');
const  Payment = require('../models/payment.js');
const  User = require('../models/user.js');
const  { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const  { S3RequestPresigner } = require('@aws-sdk/s3-request-presigner');
const  { createRequest } = require('@aws-sdk/util-create-request');
const  { formatUrl } = require('@aws-sdk/util-format-url');




const videoRouter = express.Router();

videoRouter.post('/dllist', expressAsyncHandler(async (req, res)=>{
    const { status, order_id, userId, payId } = req.body;
    if( status == null){
        const user = await User.findById(userId)
        return res.send( user.paidVidIds )
    }
    if(status == 1){
        return res.send({ message: 'پرداخت انجام نشده است'});
    }
    else if(status == 2){
        return res.send({ message: 'پرداخت ناموفق بوده است'});
    }
    else if(status ==3){
        return res.send({ message: 'خطا رخ داده است'});
    }
    else if(status == 100){
        const payment = await Payment.findOne({ paymentId: payId });
        if(!payment){
            return res.send({ message: 'چنین تراکنشی وجود ندارد'})
        }
        const body = { 'id': payId, 'order_id': order_id }
        try{
            const response = await axios.post('https://api.idpay.ir/v1/payment/inquiry', body, { headers: { 'Content-Type': 'application/json', 'X-API-KEY': '3e1b9437-893a-417f-9355-1ba934862ccb'}})
            if( response.data.status == 100){
                let paysSoFar = +response.data.amount;
                const user = await User.findById(userId)
                if(user.paysSoFar){
                    paysSoFar += user.paysSoFar;
                }
                user.paysSoFar = paysSoFar;
                if(!user.paidVidIds.find( id => id === +order_id)){
                    user.paidVidIds.push(+order_id)
                }
                payment.isPaid = true;
                await payment.save();
                await user.save();
                return res.send( user.paidVidIds )         //ferestadane araye'ye id'haye video'haye kharidari shode be client
            }
        }
        catch(err){
            console.log(err)
        }
    }
    
}));



videoRouter.post('/listtoget', expressAsyncHandler(async(req, res) =>{
    const fileNameInBucket = req.body.allFiles;
    console.log('all files names',fileNameInBucket)
    const linksArr = [];
    for( let fileIndex in fileNameInBucket){
        console.log(fileIndex)
        const s3 = new S3Client({ region: 'default', endpoint: 'https://s3.ir-thr-at1.arvanstorage.com', forcePathStyle: false, credentials: { accessKeyId: 'cd642d50-c891-4f1c-9d62-3c929e5b7e5c', secretAccessKey: '46c4b12ed300a4e49cfa8fc86d424c5f10137963feaf1655782750134996bbc9' }});
        const clientParams = { Bucket: 'avayejan', Key: fileNameInBucket[fileIndex].title };
        const signedRequest = new S3RequestPresigner(s3.config);
        try {
            const request = await createRequest(s3, new GetObjectCommand(clientParams));
            const signedUrl = formatUrl( await signedRequest.presign(request, { expiresIn: 60 * 60 * 24 }));
            linksArr.push(signedUrl);
        } catch (err) {
            console.log('Error creating presigned URL', err);
        }
        }
        return res.send(linksArr);
}))



// videoRouter.get('/:id', expressAsyncHandler(async (req, res) => {
//     console.log('umad', req.params.id)
//     const video = data.find(a => a.id == req.params.id);
//     console.log(video)
//     if(video){
//         return res.send(video);
//     }
//     else{
//         res.status(404).json({ message: 'این ویدیو وجود ندارد'})
//     }
// }))






module.exports = videoRouter;