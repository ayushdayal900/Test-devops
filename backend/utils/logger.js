const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
const dotenv = require('dotenv');

dotenv.config();

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Chose the level of logging we want
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info'; // Warn: 'debug' can be verbose in prod
};

// Define the format of the logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format,
    ),
  }),
];

// Add CloudWatch transport if credentials exist
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.CLOUDWATCH_GROUP_NAME) {
  console.log('✅ AWS CloudWatch Logging Enabled');
  transports.push(
    new WinstonCloudWatch({
      logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
      logStreamName: `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: process.env.AWS_REGION,
      jsonMessage: true,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    })
  );
}

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = logger;
