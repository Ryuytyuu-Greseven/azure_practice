import { ServiceBusClient, delay, ServiceBusMessage } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueuesService {

    connectionString = '';
    queueName = '';

    constructor(private configService: ConfigService) {
        // connection string to your Service Bus namespace
        this.connectionString = this.configService.get('BUS_SAS')
        // name of the queue
        this.queueName = this.configService.get('QUEUE_NAME');

    }

    async sendMessages() {


        const messages = [
            { body: "Albert Einstein" },
            { body: "Werner Heisenberg" },
            { body: "Marie Curie" },
            { body: "Steven Hawking" },
            { body: "Isaac Newton" },
            { body: "Niels Bohr" },
            { body: "Michael Faraday" },
            { body: "Galileo Galilei" },
            { body: "Johannes Kepler" },
            { body: "Nikolaus Kopernikus" },
        ];
        // messages.push(...messages,...messages,...messages,...messages,...messages,...messages,)
        // create a Service Bus client using the connection string to the Service Bus namespace
        const sbClient = new ServiceBusClient(this.connectionString);

        // createSender() can also be used to create a sender for a topic.
        const sender = sbClient.createSender(this.queueName);

        try {
            // Tries to send all messages in a single batch.
            // Will fail if the messages cannot fit in a batch.
            // await sender.sendMessages(messages);

            // create a batch object
            let batch = await sender.createMessageBatch();
            for (let i = 0; i < messages.length; i++) {
                // for each message in the array

                // try to add the message to the batch
                if (!batch.tryAddMessage(messages[i])) {
                    // if it fails to add the message to the current batch
                    // send the current batch as it is full
                    await sender.sendMessages(batch);
                    
                    // then, create a new batch
                    batch = await sender.createMessageBatch();
                    console.log('New Badge Added!')

                    // now, add the message failed to be added to the previous batch to this batch
                    if (!batch.tryAddMessage(messages[i])) {
                        // if it still can't be added to the batch, the message is probably too big to fit in a batch
                        throw new Error("Message too big to fit in a batch");
                    }
                }
            }

            // Send the last created batch of messages to the queue
            await sender.sendMessages(batch);

            console.log(`Sent a batch of messages to the queue: ${this.queueName}`);

            // Close the sender
            await sender.close();
        } finally {
            await sbClient.close();
        }


    }

    // receive messages from queues
    async receiveQueues() {
        // create a Service Bus client using the connection string to the Service Bus namespace
        const sbClient = new ServiceBusClient(this.connectionString);

        // createReceiver() can also be used to create a receiver for a subscription.
        const receiver = sbClient.createReceiver(this.queueName);

        // function to handle messages
        const myMessageHandler = async (messageReceived) => {
            // throw Error('Testing')
            console.log(`Received message: ${messageReceived.body}`);
        };

        // function to handle any errors
        const myErrorHandler = async (error) => {
            console.log('Received Error ', error);
        };

        // subscribe and specify the message and error handlers
        receiver.subscribe({
            processMessage: myMessageHandler,
            processError: myErrorHandler
        });

        // Waiting long enough before closing the sender to send messages
        // await delay(10000);
        // await receiver.close();
        // await sbClient.close();
    }
}
