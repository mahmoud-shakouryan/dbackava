import express from 'express';
import expressAsyncHandler  from 'express-async-handler';
import {data}  from '../data.js';



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
    


videoRouter.get('/seed', expressAsyncHandler(async (req, res) =>{
    const createdVideos = await Video.insertMany(data);
    res.json(createdVideos);
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