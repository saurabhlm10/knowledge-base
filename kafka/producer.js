const { kafka } = require("./client");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function init() {
  const producer = kafka.producer();

  console.log("Connecting Producer");
  await producer.connect();
  console.log("Producer Connected");

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", async function (line) {
    const [riderName, riderLoc] = line.split(" ");
    await producer.send({
      topic: "rider-status",
      messages: [
        {
          partition: riderLoc.toLowerCase() === "north" ? 0 : 1,
          key: "location-update",
          value: JSON.stringify({ riderName, riderLoc }),
        },
      ],
    });
  }).on("close", async () => {
    await producer.disconnect();
  });
}

init();
