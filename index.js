const express = require("express");
const redis = require("redis");

const app = express();

// Railway / Docker automatically PORT deta hai
const PORT = process.env.PORT || 3000;

// 🔹 Redis client (ONLY env-based, works everywhere)
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

// 🔹 Redis error handle (VERY IMPORTANT)
client.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

// 🔹 Connect Redis safely
async function connectRedis() {
  await client.connect();

  const tickets = await client.get("tickets");
  if (!tickets) {
    await client.set("tickets", 10);
  }

  console.log("✅ Redis connected & tickets initialized");
}

connectRedis();

// ---------------- ROUTES ----------------

// Health check
app.get("/", (req, res) => {
  res.send("🎟️ Redis Ticket Booking API is running");
});

// Check remaining tickets
app.get("/status", async (req, res) => {
  const tickets = await client.get("tickets");
  res.json({
    remainingTickets: Number(tickets),
  });
});

// Book a ticket
app.post("/book", async (req, res) => {
  const tickets = await client.get("tickets");

  if (tickets > 0) {
    await client.decr("tickets");
    res.json({
      message: "✅ Ticket booked successfully",
    });
  } else {
    res.status(400).json({
      message: "❌ Tickets sold out",
    });
  }
});

// ---------------- SERVER ----------------

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});