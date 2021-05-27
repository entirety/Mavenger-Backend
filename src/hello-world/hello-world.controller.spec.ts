// Import dependencies
import { Test, TestingModule } from '@nestjs/testing';

// Import local dependencies
import { HelloWorldService } from './hello-world.service';
import { HelloWorldController } from './hello-world.controller';

describe('HelloWorldController', () => {
  let controller: HelloWorldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelloWorldService],
      controllers: [HelloWorldController],
    }).compile();

    controller = module.get<HelloWorldController>(HelloWorldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return entity with "Hello, World!" message', () => {
    expect(controller.sayHello()).toMatchObject({ message: 'Hello, World!' });
  });
});
