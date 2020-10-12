import { logger } from './Log';
import dotenv from 'dotenv'

export default function runConfigLoader(): void {
    const env = process.env.APP_ENV || undefined

    try {
        let envConfigFilename: string;

        if(env == undefined)
            envConfigFilename = '.env';
        else
            envConfigFilename = '.env.' + env;

        logger.info(`Load config : ${envConfigFilename}`);

        dotenv.config({ path: __dirname + "/../../" + envConfigFilename });
    } catch (err) {
        logger.error(err);
        process.exit(-1);
    }
}




// Force env values in global process (needed to use process in typescript)
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            APP_ENV: string;
            APP_PORT: number;
            JWT_SECRET: string;
            JWT_ALGORITHM: string;
            MONGODB_URL: string;
            AMQP_URL: string;
            SENDGRID_API_KEY: string;
            SONARQUBE_TOKEN: string;
        }
    }
}