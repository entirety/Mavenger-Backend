// Import dependencies
import { ApiProperty } from '@nestjs/swagger';

export class HelloWorld {
  @ApiProperty({ example: 'Hello, World!', description: 'The hello message' })
  message: string;
}
