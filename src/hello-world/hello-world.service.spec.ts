// Import dependencies
import { Test, TestingModule } from '@nestjs/testing';

// Import local dependencies
import { HelloWorldService } from './hello-world.service';

describe('HelloWorldService', () => {
  let service: HelloWorldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelloWorldService],
    }).compile();

    service = module.get<HelloWorldService>(HelloWorldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return entity with "Hello, World!" message', () => {
    expect(service.sayHello()).toMatchObject({ message: 'Hello, World!' });
  });
});
