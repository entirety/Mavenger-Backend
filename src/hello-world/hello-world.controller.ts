// Import dependencies
import { Get, Controller } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

// Import local dependencies
import { HelloWorld } from './entities/hello-world.entity';
import { HelloWorldService } from './hello-world.service';

@ApiTags('hello-world')
@Controller('hello-world')
@ApiBearerAuth()
export class HelloWorldController {
  /**
   * Construcs the Hello World Controller
   *
   * @param helloWorldService - the Hello World Service
   */
  public constructor(private readonly helloWorldService: HelloWorldService) {}

  /**
   * Gets a hello entity with a message
   *
   * @returns {HelloWorld} - the hello entity
   */
  @Get()
  @ApiResponse({
    type: HelloWorld,
    status: 200,
    description: 'Say hello'
  })
  public sayHello(): HelloWorld {
    return this.helloWorldService.sayHello();
  }
}
