//import amqp from "amqplib";
const amqp = require('amqplib');

class AMQPTalker {

    private static connection: any;
    private static channel: any;

    // create amqp connection
    private static async getConnection(): Promise<Record<any, any>> {
        if(AMQPTalker.connection == undefined || AMQPTalker.channel == undefined) {
            AMQPTalker.connection = await amqp.connect(process.env.AMQP_URL);
            AMQPTalker.channel    = await AMQPTalker.connection.createChannel();
        }

        return { connection: AMQPTalker.connection, channel: AMQPTalker.channel };
    }


    // publisher function
    public static async publisher(queueName: string, msg: string): Promise<void> {
        const { channel } = await AMQPTalker.getConnection();

        await channel.assertExchange(queueName, {
            durable: false
        });
        
        channel.publish(queueName, Buffer.from(msg));
    }


    // consumer function
    public static async consumer(queueName: string): Promise<Record<any, any>> {
        /*** USAGE ***
            const { channel, queue }: Record<any, any> = AMQPTalker.consumer("queue");
            channel.consume(queue.queue, function(msg: string) {
                console.log(msg);
            });
        ****/

        const { channel } = await AMQPTalker.getConnection();

        const q = await channel.assertQueue(queueName, {
            durable: false
        });

        return { channel: channel, queue: q }
    }
}

export default AMQPTalker;