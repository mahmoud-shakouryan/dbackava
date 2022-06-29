import jwt from 'jsonwebtoken';


export const isAuth = (req, res, next) =>{
    console.log('umad isAuth')
    const authorization = req.headers.authorization;
    console.log(authorization)
    if(authorization){
        const token = authorization.slice(7, authorization.length);  //bearer xxxxxx
        jwt.verify(token, process.env.JWT_SECRET || 'somethingsupersupersecret', (error, decode) =>{
            if(error) {
                res.status(401).send({ message: 'invalid token'});
            }
            else{
                req.user = decode;
                next();
            }
        })
    }
    else{
        console.log('errore if(authorization) else tuye isAuth');
        res.status(401).send({ message: 'you are not authorized'});
    }
}