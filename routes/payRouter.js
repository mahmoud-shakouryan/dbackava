const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const Payment = require('../models/payment.js');
const { isAuth } = require('../util.js')
const axios = require( 'axios');


const payRouter = express.Router();


payRouter.post('/',isAuth,  expressAsyncHandler((req, res)=>{
    console.log('umad pay');
    const params = { 'order_id': `${req.body.videoId}`, 'amount': req.body.price, 'callback': 'https://www.avayejan.ir/myvideos', 'desc':`${req.body.videoId}` };
    axios.post('https://api.idpay.ir/v1/payment', params, {headers:{ 'Content-Type': 'application/json',  'X-API-KEY': '8140f12b-92de-4dac-b720-9b2e8dd8b6ec', 'X-SANDBOX': true}})
    .then(response =>{
        console.log('resposnse = require( idPay request>>>>>', response);
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


module.exports = payRouter;