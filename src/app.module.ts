// Import dependencies
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Import local dependencies
import configs from './config';

import { HelloWorldModule } from './hello-world/hello-world.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

// Load env
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    HelloWorldModule,

    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,

      envFilePath: [
        path.resolve(process.cwd(), 'env', '.env'),
        path.resolve(process.cwd(), 'env', '.env.local'),
        path.resolve(process.cwd(), 'env', ENV ? `.env.${ENV}` : '.env'),
        path.resolve(process.cwd(), 'env', ENV ? `.env.${ENV}.local` : '.env.local'),
      ],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
  ],
})
export class AppModule {}
