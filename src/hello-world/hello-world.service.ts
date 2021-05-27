// Import dependencies
import { Injectable } from '@nestjs/common';

// Import local dependencies
import { HelloWorld } from './entities/hello-world.entity';

@Injectable()
export class HelloWorldService {
  /**
   * Gets the Hello World entity
   *
   * @returns {HelloWorld} - the Hello World entity containing the hello message
   */
  public sayHello(): HelloWorld {
    return { message: 'Hello, World!' };
  }
}
