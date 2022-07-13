import axios from 'axios';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import {data} from '../data.js';
import Payment from '../models/payment.js';
import User from '../models/user.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';



const videoRouter = express.Router();



// videoRouter.get('/', expressAsyncHandler( async(req, res) => {
//     const videos = await Video.find({});
//     if(videos){
//         res.json(videos);
//     }else{
//         res.status.send({ message: 'No videos'});
//     }
// }));

videoRouter.get('/', expressAsyncHandler(async (req, res) =>{
    const videos = data;
    res.send(videos);
}));
    


// videoRouter.get('/seed', expressAsyncHandler(async (req, res) =>{
//     const createdVideos = await Video.insertMany(data);
//     res.json(createdVideos);
// }))



videoRouter.post('/dllist', expressAsyncHandler(async (req, res)=>{
    const { status, order_id, userId, payId } = req.body;
    if( status == null){
        const user = await User.findById(userId)
        return res.send( user.paidVidIds )
    }
    if(status == 10000){
        return res.send({ message: 'پرداخت انجام نشده است'});
    }
    else if(status == 2){
        return res.send({ message: 'پرداخت ناموفق بوده است'});
    }
    else if(status ==3){
        return res.send({ message: 'خطا رخ داده است'});
    }
    else if(status == 1){
        const payment = await Payment.findOne({ paymentId: payId });
        if(!payment){
            return res.send({ message: 'چنین تراکنشی وجود ندارد'})
        }
        const body = { 'id': payId, 'order_id': order_id }
        try{
            const response = await axios.post('https://api.idpay.ir/v1/payment/inquiry', body, { headers: { 'Content-Type': 'application/json', 'X-API-KEY': '8140f12b-92de-4dac-b720-9b2e8dd8b6ec', 'X-SANDBOX': true }})
            if( response.data.status == 1){
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

videoRouter.get('/download', expressAsyncHandler((req, res) =>{
    console.log('umad tu /download');
    const s3 = new S3Client({
        region: 'default',
        endpoint: 'https://s3.ir-thr-at1.arvanstorage.com',
        credentials: {
            accessKeyId: 'cd642d50-c891-4f1c-9d62-3c929e5b7e5c',
            secretAccessKey: '46c4b12ed300a4e49cfa8fc86d424c5f10137963feaf1655782750134996bbc9',
        }
    });

    const param = { Bucket: 'avayejan', Key: 'fa37b26f-cd76-556f-bb53-10e07d3b5220' };

    const run = async () => {
        try {
            const data = await s3.send(new GetObjectCommand(param));
            console.log(data)
            const ws = fs.createWriteStream(
                __dirname + '/../files/download-from-nodejs-sdk.png'
            );
            data.Body.pipe(ws);
            console.log('Success');
        } catch (err) {
            console.log('Error', err);
        }
    };

    run();

}))



videoRouter.get('/:id', expressAsyncHandler(async (req, res) => {
    const video = data.find(a => a.id == req.params.id);
    if(video){
        return res.send(video);
    }
    else{
        res.status(404).json({ message: 'این ویدیو وجود ندارد'})
    }
}))






export default videoRouter;