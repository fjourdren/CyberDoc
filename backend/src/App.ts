import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import log4js from 'log4js';

import {default as routers} from './routers/ApiRouter';

import HttpCodes from './helpers/HttpCodes';
import { logger } from './helpers/Log';

class App {

    public expressApp: express.Application;

    constructor() {
        this.expressApp = express();
        this.middlewares();
        this.routes();
    }


    /**
     * http(s) request middleware
     */
    private middlewares(): void {
        this.expressApp.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));
        
        // compression gzip
        this.expressApp.use(compression({filter: function (req, res) {
            if (req.headers['x-no-compression']) {
                // don't compress responses with this request header
                return false
            }
         
           // fallback to standard filter function
            return compression.filter(req, res)
        }}));

        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
        this.expressApp.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*'); // dev only
            res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            if(req.method === 'OPTIONS') {
                res.status(200).send();
            } else {
                next();
            }
        });
    }


    /**
     * API main routes
     */
    private routes(): void {
        this.expressApp.use('/v1', routers);
        this.expressApp.use('/', (req, res) => {
            res.status(HttpCodes.NOT_FOUND);
            res.json({
                success: false,
                msg: "Unknow action"
            });
        });
    }

}

export default App;