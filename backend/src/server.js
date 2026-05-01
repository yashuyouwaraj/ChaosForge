require("dotenv").config();

const http = require("http");
const {initSocket} = require("./websocket/socket");
const app = require("./app");
const runConsumer = require("./consumers/traffic.consumer");
const connectDB= require("./config/db")
const cors = require("cors");
const errorHandler = require("./middleware/error.middleware");

const PORT = process.env.PORT || 3001;

const server = http.createServer(app)

const useKafka = process.env.USE_KAFKA === "true";
// init socket
initSocket(server)

connectDB();

app.use(errorHandler);

app.use(cors({
  origin: "*"
}));

const startServer = async () => {
  if (useKafka) {
    await runConsumer();
    console.log("Kafka consumer started.");
  } else {
    console.log("Kafka disabled in production. Skipping consumer startup.");
  }

  server.listen(PORT,()=>{
      console.log(`Server is running on port localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});
