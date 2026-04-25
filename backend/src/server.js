require("dotenv").config();

const http = require("http");
const {initSocket} = require("./websocket/socket");
const app = require("./app");
const runConsumer = require("./consumers/traffic.consumer");
const connectDB= require("./config/db")

const PORT = process.env.PORT || 3001;

const server = http.createServer(app)

// init socket
initSocket(server)

connectDB();

// start consumer
runConsumer().catch((error) => {
    console.error("Kafka consumer failed to start:", error.message);
});

server.listen(PORT,()=>{
    console.log(`Server is running on port localhost:${PORT}`);
});

