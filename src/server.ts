import app from "./app";
import logger from "./utils/logging";
const port = process.env.PORT || 3000;


process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection', { reason, p });
  process.exit(1);
}); 

const gracefulShutdown = () => {
  server.close(() => {
    console.log('Process terminated');
  });
  setTimeout(() => {
    console.log('Forcefully terminated');
    process.exit(1)
  }, 2000); // Force exit if not closed within 2 seconds
};


process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

