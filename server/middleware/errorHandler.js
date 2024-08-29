const constant = require('../constant');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    switch(statusCode){
        case constant.VALIDATEION_ERROR: 
            res.json({
                title: "validation faild",
                message: err.message,
                stack: err.stack

            })
            break;

            case constant.UNAUTHORISED: 
            res.json({
                title: "Unauthorised",
                message: err.message,
                stack: err.stack

            })
            break;
        
            case constant.FORBIDDEN: 
            res.json({
                title: "Forbedded",
                message: err.message,
                stack: err.stack

            })
            break;

            case constant.NOT_FOUND: 
            res.json({
                title: "Not found",
                message: err.message,
                stack: err.stack

            })
            break;

            case constant.SERVER_ERROR: 
            res.json({
                title: "Server error",
                message: err.message,
                stack: err.stack

            })
            break;
        default:
            console.log(err);
            
            console.log("No error found all good");
            break;
    }
}

module.exports = errorHandler;
