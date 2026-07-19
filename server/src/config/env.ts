import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 7000,
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/safetyhub'),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export const isProduction = env.nodeEnv === 'production';
