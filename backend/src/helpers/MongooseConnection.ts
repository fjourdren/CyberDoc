import mongoose from 'mongoose';

import { logger } from './Log';

export default function connectMongodb(): void {
    let db = mongoose.connection;

    // init event log on the mongodb connection
    db.on('connecting', function() {
        logger.info('Connecting to MongoDB...');
    });

    db.on('error', function(error) {
        logger.error('Error in MongoDb connection: ' + error);
        mongoose.disconnect();
    });

    db.on('connected', function() {
        logger.info('MongoDB connected !');
    });

    db.once('open', function() {
        logger.info('MongoDB connection opened !');

        //logger.info('Build GridFS object');
        //let gfs = Grid(db.db, mongoose.mongo);
    });

    db.on('reconnected', function () {
        logger.info('MongoDB reconnected !');
    });

    db.on('disconnected', function() {
        logger.error('MongoDB disconnected !');
        mongoose.connect(process.env.MONGODB_URL, {server:{auto_reconnect: true}});
    });



    // first connect to mongodb
    try {
        mongoose.connect(process.env.MONGODB_URL, {server:{auto_reconnect: true}});
    } catch(e: any) {
        logger.error(e);
        process.exit();
    }
}