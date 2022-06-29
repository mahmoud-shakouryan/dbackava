import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Payment from '../models/payment.js';
import { isAuth } from '../util.js'

import axios from 'axios';


const payRouter = express.Router();


payRouter.post('/', isAuth, expressAsyncHandler(async (req, res) =>{
    const params = { merchant_id: '1b339e9c-96eb-4761-93b5-0426f0dee81a', amount: req.body.price, callback_url: 'http://localhost:5000/paycallback', description:`${req.body.videoId}` };
    const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/request.json', params);
    if(response.data.data.code === 100){
        const newPayment = new Payment({ user: req.user._id, amount: req.body.price, resNumber: response.data.data.authority});
         await newPayment.save();
        res.redirect(`https://www.api.zarinpal.com/pg/StartPay/${response.data.data.authority}`);
         
    }
    else{
        res.status(404).send({ message: 'error ghesmate ijade new Payment'})
    }
}))






export default payRouter;