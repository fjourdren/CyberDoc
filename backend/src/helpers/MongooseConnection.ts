import mongoose from 'mongoose';

import { logger } from './Log';

export default function connectMongodb(): void {
    const db = mongoose.connection;

    // init event log on the mongodb connection
    db.on('connecting', function() {
        logger.info('Connecting to MongoDB...');
    });

    db.on('error', function(err) {
        logger.error('Error in MongoDb connection: ' + err);
        mongoose.disconnect();
    });

    db.on('connected', function() {
        logger.info('MongoDB connected !');
    });

    db.once('open', function() {
        logger.info('MongoDB connection opened !');
    });

    db.on('reconnected', function () {
        logger.info('MongoDB reconnected !');
    });

    db.on('disconnected', function() {
        logger.error('MongoDB disconnected !');
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true
        });
    });



    // first connect to mongodb
    try {
        mongoose.set('useUnifiedTopology', true);
        mongoose.set('useCreateIndex', true);
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true
        });
    } catch(err) {
        logger.error(err);
    }
}