const  express = require('express');
const  expressAsyncHandler = require('express-async-handler');

const  { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const  { S3RequestPresigner } = require('@aws-sdk/s3-request-presigner');
const  { createRequest } = require('@aws-sdk/util-create-request');
const  { formatUrl } = require('@aws-sdk/util-format-url');




const myVidsLinksRouter = express.Router();

myVidsLinksRouter.post('/myvidslinks', expressAsyncHandler(async(req, res) =>{
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
}));

module.exports = myVidsLinksRouter;