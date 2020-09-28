import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

class GridFSTalker {

    // generate GridFS object to communicate with mongodb's gridfs driver
    private static getGrid(): Grid.Grid {
        let db = mongoose.connection;
        return Grid(db.db, mongoose.mongo);
    }

    // get a file's informations from gridfs storage
    public static getFileInfos(mongoDbOptions: any): Promise<any> { // use any because GridFSStream.Options isn't exported in @type/gridfs-stream
        /*
            GRIDFS object stored
            "_id" : <ObjectId>,
            "length" : <num>,
            "chunkSize" : <num>,
            "uploadDate" : <timestamp>,
            "md5" : <hash>,
            "filename" : <string>,
            "contentType" : <string>,
            "aliases" : <string array>,
            "metadata" : <any>,
        */

        return new Promise((resolve, reject) => {
            try {
                const gfs = GridFSTalker.getGrid();
                gfs.findOne(mongoDbOptions, function(err: Error, file: any) {
                    if(err)
                        reject(err);
                    
                    resolve(file);
                });
            } catch(err) {
                reject(err);
            }
        })
    }

    // get a file stream from gridfs storage
    public static getFileContent(mongoDbOptions: any): Promise<any> { // use any because GridFSStream.Options isn't exported in @type/gridfs-stream
        return new Promise((resolve, reject) => {
            try {
                const gfs = GridFSTalker.getGrid();
                resolve(gfs.createReadStream(mongoDbOptions)); // use stream.pipe(httpResponse) to send it to user
            } catch(err) {
                reject(err);
            }
        })
    }

    // check if a file exists in the gridfs storage
    public static exists(mongoDbOptions: any): Promise<boolean> { // use any because GridFSStream.Options isn't exported in @type/gridfs-stream
        return new Promise((resolve, reject) => {
            try {
                const gfs = GridFSTalker.getGrid();
                gfs.exist(mongoDbOptions, function(err: Error, found: boolean) {
                    if(err)
                        reject(err);
                    
                    resolve(found);
                });
            } catch(err) {
                reject(err);
            }
        });
    }

    // create a file in gridfs
    public static create(mongoDbOptions: any, content: any): Promise<any> { // use any because GridFSStream.Options and GridFSStream.readStream aren't exported in @type/gridfs-stream
        return new Promise((resolve, reject) => {
            try {
                const gfs = GridFSTalker.getGrid();
                var writeStream = gfs.createWriteStream(mongoDbOptions);
                content.pipe(writeStream);
                resolve();
            } catch(err) {
                reject(err);
            }
        });
    }

    // delete a file from the gridfs storage
    public static delete(mongoDbOptions: any): Promise<any> { // use any because GridFSStream.Options isn't exported in @type/gridfs-stream
        return new Promise((resolve, reject) => {
            try {
                const gfs = GridFSTalker.getGrid();
                gfs.remove(mongoDbOptions, function (err: Error) {
                    if(err)
                        reject(err);

                    resolve();
                });
            } catch(err) {
                reject(err);
            }
        });
    }
}

export default GridFSTalker;