import express from "express";
import { Pool } from "pg";
import { Gauge, collectDefaultMetrics, Registry } from "prom-client";
import axios from "axios";

const app = express();
const PORT = 3000;
const register = new Registry();

const pool1 = new Pool({
  user: "saurabh",
  host: "localhost",
  database: "data_recovery",
  password: "saurabh",
  port: 5432,
});
const pool2 = new Pool({
  user: "saurabh",
  host: "localhost",
  database: "data_recovery_secondary",
  password: "saurabh",
  port: 5433,
});

pool1.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  dbConnectionHealth.set(0); // Set database connection health to 0
  pool = pool2; // Optional: switch to secondary database immediately
});

pool2.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  dbConnectionHealth.set(0); // Assume secondary is also down if primary was used before
  // Consider what should happen here: retry primary, alert admins, etc.
});

let pool = pool1;

const dbConnectionHealth = new Gauge({
  name: "db_connection_health",
  help: "Database connection health (1 = up, 0 = down)",
});

register.registerMetric(dbConnectionHealth);

const checkDbConnection = async () => {
  try {
    const { rows } = await pool.query("SELECT NOW()");

    // console.log(`Database time: ${rows[0].now}`);

    return true; // Connection is healthy
  } catch (error) {
    console.error("Database connection error:", error);
    return false; // Connection is unhealthy  }
  }
};

function updateDbHealthMetric() {
  // Assume a function `checkDbConnection` that returns a promise
  // which resolves to true if the connection is healthy, or false if not
  checkDbConnection()
    .then((isHealthy) => {
      dbConnectionHealth.set(isHealthy ? 1 : 0);
    })
    .catch((error) => {
      console.log("Failed to check database health:", error);
      dbConnectionHealth.set(0);
    });
}

// Collect default metrics every 5 seconds
collectDefaultMetrics({ register });

setInterval(updateDbHealthMetric, 1000);

async function checkDatabaseHealth() {
  try {
    const response = await axios.get("http://localhost:9090/api/v1/query", {
      params: {
        query: "db_connection_health",
      },
    });

    const value = response.data.data.result[0].value[1];
    if (value === "0") {
      // Database is considered down
      console.log("Primary database is down! Initiating failover...");
      // Implement your failover logic here

      pool = pool2;
    } else {
      console.log("Primary database is up.");
    }
  } catch (error: any) {
    console.error("Failed to query Prometheus:", error.message);
  }
}

setInterval(checkDatabaseHealth, 5000);

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    res.send(`Database time: ${rows[0].now}`);
  } catch (error) {
    res.status(500).send("Failed to connect to the database");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
