const { kafka } = require("./client");

async function init() {
  const admin = kafka.admin();
  console.log("Admin Connecting...");
  admin.connect();
  console.log("Admin Connected");

  console.log("Creating Topic [rider-status]");

  await admin.createTopics({
    topics: [
      {
        topic: "rider-status",
        numPartitions: 2,
      },
    ],
  });

  console.log("Topic Created Success [rider-status]");

  await admin.disconnect();
}

init();
