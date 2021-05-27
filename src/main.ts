// Import dependencies
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Import local dependencies
import { AppModule } from './app.module';

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

  // Run app
  await app.listen(5000);

  // Log running
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// Bootstrap app
bootstrap();
