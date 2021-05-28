// Import dependencies
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Import local dependencies
import configs from './config';

import { HelloWorldModule } from './hello-world/hello-world.module';

// Load env
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,

      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '.env.local'),
        path.resolve(process.cwd(), 'env', ENV ? `.env.${ENV}` : '.env'),
        path.resolve(process.cwd(), 'env', ENV ? `.env.${ENV}.local` : '.env.local')
      ]
    }),

    HelloWorldModule
  ]
})
export class AppModule {}
