import mongoose from 'mongoose';
import MongoClient, { ObjectID, GridFSBucket } from 'mongodb'
import { Readable } from 'stream';

import HTTPError from './HTTPError';
import HttpCodes from './HttpCodes';

class GridFSTalker {

    // get mongodb's client.db
    private static getDb(): MongoClient.Db {
        const db = mongoose.connection;
        return db.db;
    }

    // get buket configuration
    private static getBucket(): GridFSBucket {
        return new GridFSBucket(GridFSTalker.getDb());
    }

    // get a file's informations from gridfs storage
    public static async getFileInfos(id: ObjectID): Promise<any> { // use any because GridFSStream.Options isn't exported in @type/gridfs-stream
        //GRIDFS object stored
            //"_id" : <ObjectId>,
            //"length" : <num>,
            //"chunkSize" : <num>,
            //"uploadDate" : <timestamp>,
            //"md5" : <hash>,
            //"filename" : <string>,
            //"contentType" : <string>,
            //"aliases" : <string array>,
            //"metadata" : <any>,

        const bucket: GridFSBucket = GridFSTalker.getBucket();
        const output: any          = await bucket.find({ _id: id }).toArray();

        if(output.length != 1)
            throw new HTTPError(HttpCodes.NOT_FOUND, "Document can't be found");

        return output[0];
    }

    // get a file stream from gridfs storage
    public static getFileContent(id: ObjectID): MongoClient.GridFSBucketReadStream { // use any because GridFSStream.Options isn't exported in @type/gridfs-stream
        const bucket: GridFSBucket = GridFSTalker.getBucket();
        return bucket.openDownloadStream(id);
    }

    // check if a file exists in the gridfs storage
    public static async exists(id: ObjectID): Promise<boolean> { // use any because GridFSStream.Options isn't exported in @type/gridfs-stream
        const files: any = await GridFSTalker.getBucket().find({ _id: id }).toArray();
        return files.length > 0;
    }

    // create a file in gridfs
    public static create(filename: string, contentType: string, readableStream: Readable): string {
        const bukket: GridFSBucket = GridFSTalker.getBucket();

        // create the wrinting stream
        const writeStream: MongoClient.GridFSBucketWriteStream = bukket.openUploadStream(filename, { contentType: contentType });

        // push stream into the writing stream
        readableStream.pipe(writeStream);

        return writeStream.id.toString();
    }

    // update a file in gridfs
    public static update(id: ObjectID, filename: string, contentType: string, readableStream: Readable): string {
        const bukket: GridFSBucket = GridFSTalker.getBucket();

        // first delete old bucket
        bukket.delete(id);

        // create the wrinting stream
        let writeStream: MongoClient.GridFSBucketWriteStream 
        if(contentType != undefined)
            writeStream = bukket.openUploadStreamWithId(id, filename, { contentType: contentType });
        else
            writeStream = bukket.openUploadStreamWithId(id, filename);

        // push stream into the writing stream
        readableStream.pipe(writeStream);

        return writeStream.id.toString();
    }

    // delete a file from the gridfs storage
    public static delete(id: ObjectID): void { // use any because GridFSStream.Options isn't exported in @type/gridfs-stream
        const bucket: GridFSBucket = GridFSTalker.getBucket();
        bucket.delete(id);
    }
}

export default GridFSTalker;