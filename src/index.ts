import 'module-alias/register';
require("dotenv").config();
import './pre-start'; // Must be the first import
import logger from 'jet-logger';
// import server from '@server';
import server from './server';

// Constants
const serverStartMsg = 'Express server started on port: ',
        port = (process.env.PORT || 3000);

// Start server
server.listen(port, () => {
    console.log('Express server started on port: ', port);
    logger.info(serverStartMsg + port);
});
