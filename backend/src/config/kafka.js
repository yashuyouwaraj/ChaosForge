const {Kafka} = require('kafkajs')

const kafka = new Kafka({
    clientId: 'chaosforge',
    brokers:[process.env.KAFKA_BROKER || 'localhost:9092']
})

const producer = kafka.producer();

module.exports = producer;


// 1. Connect → Kafka broker
// 2. Send → message goes to topic
// 3. Kafka → stores in partition
// 4. Disconnect → done