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
            APP_FRONTEND_URL: string;
            APP_PORT: number;
            JWT_SECRET: string;
            JWT_ALGORITHM: string;
            MONGODB_URL: string;
            SENDGRID_API_KEY: string;
            SENDGRID_MAIL_FROM: string;
            SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD: string;
            SENDGRID_TEMPLATE_SEND_SHARING_CODE: string;
            SENDGRID_TEMPLATE_REQUEST_CREATE_ACCOUNT: string;
            TWILIO_ACCOUNT_SID: string;
            TWILIO_AUTH_TOKEN: string;
            TWILIO_SERVICE_ID: string;
            AMQP_URL: string;
            SONARQUBE_TOKEN: string;
        }
    }
}