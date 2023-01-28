const  express = require('express');
const  expressAsyncHandler = require('express-async-handler');
const User = require('../models/user.js');
const Payment = require('../models/payment.js');
const axios = require('axios');
const  { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const  { S3RequestPresigner } = require('@aws-sdk/s3-request-presigner');
const  { createRequest } = require('@aws-sdk/util-create-request');
const  { formatUrl } = require('@aws-sdk/util-format-url');




const myVidsLinksRouter = express.Router();

myVidsLinksRouter.post('/uservids', expressAsyncHandler(async(req, res)=>{
    const { status, userId, payId, order_id } = req.body;
    if( status == null){
        const user = await User.findById(userId)
        return res.send( user.paidVidIds )
    }
    const body = { 'id': payId, 'order_id': order_id }
    const response = await axios.post('https://api.idpay.ir/v1.1/payment/inquiry', body, { headers: { 'Content-Type': 'application/json', 'X-API-KEY': '3e1b9437-893a-417f-9355-1ba934862ccb'}})
    if( response.status == 200){
    const payment = await Payment.findOne({ paymentId: payId });
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
}}));

myVidsLinksRouter.post('/myvidslinks', expressAsyncHandler(async(req, res) =>{
    const fileNameInBucket = req.body.allFiles;
    const linksArr = [];
    for( let fileIndex in fileNameInBucket){
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
}));

module.exports = myVidsLinksRouter;