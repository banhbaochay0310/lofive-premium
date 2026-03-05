import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwt: {
    secret: string;
    expiresIn: string | number;
  };
  cors: {
    origin: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

// Validate critical environment variables
const validateConfig = () => {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }
  
  if (config.jwt.secret === 'fallback-secret-key' && config.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be defined in production environment');
  }
};

validateConfig();

export default config;
