import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Payment from '../models/payment.js';
import { isAuth } from '../util.js'

import axios from 'axios';


const payRouter = express.Router();


payRouter.post('/', isAuth, expressAsyncHandler(async (req, res) =>{
    const params = { merchant_id: '1b339e9c-96eb-4761-93b5-0426f0dee81a', amount: req.body.price, callback_url: 'http://37.32.28.165/api/pay/callback', description:`${req.body.videoId}` };
    const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/request.json', params);
    if(response.data.data.code === 100){
        const newPayment = new Payment({ user: req.user._id, amount: req.body.price, resNumber: response.data.data.authority});
         await newPayment.save();
        
         res.send({ 'authority': response.data.data.authority }); 
         
    }
    else{
        res.status(404).send({ message: 'error'})
    }
}))

payRouter.get('/callback', expressAsyncHandler(async (req, res) =>{
    try{
        if( req.query.Status && req.query.Status !== 'OK'){
            return res.send({ message: 'تراکنش ناموفق'});
        }
        const payment = await Payment.findOne({ resNumber: req.query.Authority });
        if(!payment) {
            return res.send({ message: 'چنین تراکنشی وجود ندارد'});
        }
        let params = { merchant_id: '1b339e9c-96eb-4761-93b5-0426f0dee81a', amount: payment.amount, Authority: req.query.Authority };
        const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/verify.json', params);
        console.log('response',response)
        if(response.data.Status === 100){     // bad az check dar zaripal, zarinpal goft be ma ke pardakht movafagh bude;
        console.log('umad in tu>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
            payment.isPaid = true;
            await payment.save();
            res.redirect('http://37.32.28.165/videos')
        }
        else{
            return res.send({ message: 'تراکنش ناموفق بود'});
        }

    }
    catch(error){
        console.log('pay callback error')
    }
}))






export default payRouter;