import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Payment from '../models/payment.js';
import { isAuth } from '../util.js'

import axios from 'axios';


const payRouter = express.Router();


// payRouter.post('/', isAuth, expressAsyncHandler(async (req, res) =>{
//     const params = { merchant_id: "1b339e9c-96eb-4761-93b5-0426f0dee81a", amount: req.body.price, callback_url: 'http://www.avayejan.ir/api/pay/callback', description:`${req.body.videoId}` };
//     const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/request.json', params).catch(err=> console.log('err', err));
//     if(response.data.data.code === 100){
//         const newPayment = new Payment({ user: req.body.userId, amount: req.body.price, resNumber: response.data.data.authority});
//          await newPayment.save();
//         res.redirect(`https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`);
//         }
//     else{
//         res.status(404).send({ message: 'error'})
//     }
// }))

payRouter.post('/',isAuth,  expressAsyncHandler((req, res)=>{
    console.log('umad pay');
    const params = { 'order_id': `${req.body.videoId}`, 'amount': req.body.price, 'callback': 'https://www.avayejan.ir/api/pay/callback', 'desc':`${req.body.videoId}` };
    axios.post('https://api.idpay.ir/v1/payment', params, {headers:{ 'Content-Type': 'application/json',  'X-API-KEY': '8140f12b-92de-4dac-b720-9b2e8dd8b6ec'}})
    .then(response =>{
        console.log('resposnse from idPay request>>>>>', response);
        const newPayment = new Payment({ user: req.user, amount: req.body.price, paymentId: response.data.id, paymentLink: response.data.link});
        newPayment.save().then(result=>{
            return res.send({ link: response.data.link})
        })
        .catch(err=> console.log('new payment error'));
    })
    .catch(err=>{
        console.log('axios post requset error', err)
    })
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
        const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/verify.json', params).catch(err=>console.log('axios error>>>', err));
        if(response.status === 100){     
            payment.isPaid = true;
            await payment.save();
            res.redirect('http://www.avayejan.ir/videos')
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
        //  res.send({ 'authority': response.data.data.authority }); 