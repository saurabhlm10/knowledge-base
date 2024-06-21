import express from "express";
import axios from "axios";
import { argv } from "process";

interface Process {
  id: number;
  address: string;
  port: number;
}

let processes: Process[] = [
  { id: 1, address: "http://localhost:3001", port: 3001 },
  { id: 2, address: "http://localhost:3002", port: 3002 },
  { id: 3, address: "http://localhost:3003", port: 3003 },
  { id: 4, address: "http://localhost:3004", port: 3004 },
  { id: 5, address: "http://localhost:3005", port: 3005 },
];

const processNumber = Number(argv[2]) - 1;

let coordinator = 5;

const currentProcess: Process = processes[processNumber]; // Change this according to the process you're running

const app = express();
app.use(express.json());

app.post("/election", async (req, res) => {
  const fromId = req.body.id;
  console.log(`Received election message from process ${fromId}`);
  if (fromId < currentProcess.id) {
    console.log(
      `Responding to process ${fromId} from process ${currentProcess.id}`
    );
    res.status(200).send({ message: "Acknowledged", id: currentProcess.id });
  } else {
    res.status(200).send({ message: "No action needed" });
  }
});

app.post("/coordinator", (req, res) => {
  const coordinatorId = req.body.id;
  coordinator = coordinatorId;
  console.log(`New coordinator announced: Process ${coordinatorId}`);
  res.status(200).send({ message: "Coordinator acknowledged" });
});

app.get("/health", (req, res) => {
  res.status(200).send({ status: "up" });
});

const initiateElection = async () => {
  console.log(`Process ${currentProcess.id} is initiating an election.`);
  let higherProcesses = processes.filter((p) => p.id > currentProcess.id);
  let responses = await Promise.allSettled(
    higherProcesses.map((p) =>
      axios.post(`${p.address}/election`, { id: currentProcess.id })
    )
  );
  let noResponse = responses.every((result) => result.status === "rejected");
  if (noResponse) {
    announceCoordinator(currentProcess.id);
  }
};

const announceCoordinator = async (coordinatorId: number) => {
  console.log(
    `Process ${coordinatorId} is announcing itself as the coordinator.`
  );

  coordinator = coordinatorId;

  processes.forEach((p) => {
    axios
      .post(`${p.address}/coordinator`, { id: coordinatorId })
      .catch((err) =>
        console.error(`Error announcing to process at ${p.address}`, err)
      );
  });
};

app.get("/health", (req, res) => {
  res.status(200).send({ status: "up" });
});

const checkProcessHealth = async () => {
  console.log("coordinator = ", coordinator);
  processes.forEach(async (p) => {
    if (p.id !== currentProcess.id) {
      // No need to check self
      try {
        await axios.get(`${p.address}/health`);
      } catch (error) {
        console.log(
          `Process ${p.id} at ${p.address} failed. Initiating election.`
        );

        processes = processes.filter((item) => item.id !== p.id);

        if (p.id === coordinator) initiateElection();
      }
    }
  });
};

// Periodic health checks
setInterval(checkProcessHealth, 5000); // check every 5 seconds

const PORT = processes[processNumber].port;
app.listen(PORT, () => {
  console.log(
    `Server for process ${currentProcess.id} running on port ${PORT}`
  );
  setTimeout(() => {
    if (processNumber + 1 === coordinator) announceCoordinator(coordinator);
  }, 1000);
});

setInterval(checkProcessHealth, 5000); // Periodic health check every 5 seconds
