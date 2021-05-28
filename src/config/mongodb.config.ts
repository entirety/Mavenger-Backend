// Import dependencies
import { registerAs } from '@nestjs/config';

// Export MongoDB config
export default registerAs('mongodb', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mavenger?retryWrites=true',
}));
