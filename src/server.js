require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

const runConsumer = require("./consumers/traffic.consumer");

runConsumer();

app.listen(PORT,()=>{
    console.log(`Server is running on port localhost:${PORT}`);
});

