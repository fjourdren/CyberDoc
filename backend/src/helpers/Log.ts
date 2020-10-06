
import { configure, getLogger } from 'log4js';

import configLog4JS from "../configs/log4js.json";

// appenders
configure(configLog4JS);

// fetch logger and export
export const logger = getLogger("app");