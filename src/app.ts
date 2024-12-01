import envConfig from '@config/environment.config';
import { validateEnvironment } from '@utils/env-validator.util'

validateEnvironment();

const PORT = envConfig.getNumber('PORT', 3000);
const MONGOD_URI = envConfig.get('MONGODB_URI');
const NODE_ENV = envConfig.get('NODE_ENV', 'development');

class Application {
    constructor() {
        console.log(`Starting in ${NODE_ENV} mode`);
        console.log(`Connecting to MongoDB: ${MONGOD_URI}`)
    }

    start() {

    }
}

const app = new Application()
app.start();