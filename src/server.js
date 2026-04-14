require("dotenv").config();

const http = require("http");
const {initSocket} = require("./websocket/socket");
const app = require("./app");
const runConsumer = require("./consumers/traffic.consumer");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app)

// init socket
initSocket(server)

// start consumer
runConsumer();

server.listen(PORT,()=>{
    console.log(`Server is running on port localhost:${PORT}`);
});

