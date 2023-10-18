import { Controller, Get, Post } from '@nestjs/common';
import { QueuesService } from './queues.service';

@Controller('queues')
export class QueuesController {

    constructor(private queuesService: QueuesService) {

    }

    @Post('/send')
    checkQueues() {
        this.queuesService.sendMessages();
        return 'Sending';
    }

    @Get('/receive')
    processMessages() {
        this.queuesService.receiveQueues();
        return 'Receiving';
    }
}
