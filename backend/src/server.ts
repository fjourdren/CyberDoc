import * as http from 'http';

import App from './App';

import { normalizePort } from './utils/Conversions';

class Server {
    private static serverInstance: Server;
    private appInstance: App = new App();
    private port: number = 3000;

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
        this.port = normalizePort(process.env.PORT || 3000);

        this.appInstance.expressApp.set('port', this.port);

        this.appInstance.expressApp.listen(this.port, () => {
            console.log(`Example app listening at http://localhost:${this.port}`)
        })
    }

}

export const server = Server.bootstrap();