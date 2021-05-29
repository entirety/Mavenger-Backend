// Import dependencies
import { registerAs } from '@nestjs/config';

// Session config type
export interface SessionConfig {
  JwtSecretOrKey: string;
  JwtSignAlgorithm: string;
}

// Export Session config
export default registerAs(
  'session',
  (): SessionConfig => ({
    JwtSecretOrKey: process.env.JWT_SECRETORKEY || 'secret',
    JwtSignAlgorithm: process.env.JWT_SIGNALGORITHM || 'HS256',
  })
);
