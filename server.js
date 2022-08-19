const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routes/userRouter.js');
const payRouter = require('./routes/payRouter.js');
const myVidsLinksRouter = require('./routes/videoRouter.js');



const MONGODB_URI = 'mongodb+srv://avayejaan:avayejaan1886181170@cluster0.kj3hf.mongodb.net/?retryWrites=true&w=majority'; //avayejaan avayejaan1886181170      mahmoud-shakouryan TarYDvaALJVMQ8w   //mongodb+srv://<username>:<password>@cluster0.kj3hf.mongodb.net/?retryWrites=true&w=majority



const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use(cors());

app.use('/api/videos', myVidsLinksRouter);
app.use('/api/users', userRouter);
app.use('/api/pay', payRouter);
app.use((err, req, res, next) => { 
    console.log('expressAsyncHandler error = require( api to client')
    res.status(500).send({ message: err.message })
});





let port = process.env.PORT || 8800;
mongoose.connect(MONGODB_URI).then( result =>{
    app.listen(port);
    console.log('connected ro mongodb and port');
})
.catch(err =>{
    console.log('mongoose.connect error');
})














