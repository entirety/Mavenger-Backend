// Import dependencies
import { Module } from '@nestjs/common';

// Import local dependencies
import { HelloWorldModule } from './hello-world/hello-world.module';

@Module({
  imports: [HelloWorldModule]
})
export class AppModule {}
