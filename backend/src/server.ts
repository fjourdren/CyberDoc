import App from './App';

import connectMongodb from './helpers/MongooseConnection';

import { normalizePort } from './helpers/Conversions';
import { logger } from './helpers/Log';


// load config from environment variables
import './helpers/ConfigLoader'

class Server {
    private static serverInstance: Server;
    private appInstance: App = new App();
    private port?: number;

    public static bootstrap(): Server {
        if (!this.serverInstance) {
            this.serverInstance = new Server();
            return this.serverInstance;
        } else {
            return  this.serverInstance;
        }
    }

    private constructor() {
        this.runServer();
    }

    private runServer(): void {
        // mongodb connection
        connectMongodb();


        // start http server
        this.port = normalizePort(process.env.APP_PORT || 3000);

        this.appInstance.expressApp.set('port', this.port);

        this.appInstance.expressApp.listen(this.port, () => {
            logger.info(`Listening at http://localhost:${this.port}`)
        })
    }

}

export const server = Server.bootstrap();