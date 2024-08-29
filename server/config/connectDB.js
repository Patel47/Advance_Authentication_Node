const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.URL);
        console.log("Database connected successfully");
        
    } catch (error) {
        console.log(error);
        process.exit(1);
        
    }
}

module.exports = connectDb;