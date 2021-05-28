// Import dependencies
import { registerAs } from '@nestjs/config';

// Server config type
export interface ServerConfig {
  port: string | number;
  host: string;
}

// Export Server config
export default registerAs('server', (): ServerConfig => ({
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost'
}));
