// Import dependencies
import { registerAs } from '@nestjs/config';

// Session config type
export interface SessionConfig {
  JwtSecretOrKey: string;
  JwtSignAlgorithm: string;
  JwtAccessExpiresIn: string;
  JwtRefreshExpiresIn: string;
}

// Export Session config
export default registerAs(
  'session',
  (): SessionConfig => ({
    JwtSecretOrKey: process.env.JWT_SECRETORKEY || 'secret',
    JwtSignAlgorithm: process.env.JWT_SIGNALGORITHM || 'HS256',
    JwtAccessExpiresIn: process.env.JWT_ACCESSEXPIRESIN || '3600', // Access tokens
    JwtRefreshExpiresIn: process.env.JWT_ACCESSEXPIRESIN || '3600', // Refresh tokens
  })
);
