import { Module } from '@nestjs/common';
import { QueuesController } from './queues/queues.controller';
import { QueuesService } from './queues/queues.service';

@Module({
  controllers: [QueuesController],
  providers: [QueuesService]
})
export class ServiceBusModule {}
