// Import dependencies
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

// Import local dependencies
import { AppModule } from './app.module';
import { ServerConfig } from './config/server.config';

/**
 * Bootstraps the Main app
 */
async function bootstrap(): Promise<void> {
  // Create app
  const app = await NestFactory.create(AppModule);

  // Create API options
  const options = new DocumentBuilder()
    .addTag('hello-world')
    .setTitle('Mavenger - Backend')
    .setVersion('1.0')
    .setDescription('A NestJS server for Mavenger, a web-based manager for maven artifacts');

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, options.build());

  // Setup Swagger
  SwaggerModule.setup('api', app, document);

  // Load server config
  const server = app.get(ConfigService).get<ServerConfig>('server');

  // Initialize validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // Run app
  await app.listen(server.port, server.host);

  // Log running
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// Bootstrap app
bootstrap();
