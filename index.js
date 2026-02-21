const express = require("express");
const redis = require("redis");

const app = express();
const PORT = process.env.PORT || 3000;

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://redis:6379"
});

client.connect();

(async () => {
  const tickets = await client.get("tickets");
  if (!tickets) {
    await client.set("tickets", 10);
  }
})();

app.get("/", (req, res) => {
  res.send("🎟️ Ticket Booking API Running");
});

app.get("/status", async (req, res) => {
  const tickets = await client.get("tickets");
  res.json({ remainingTickets: tickets });
});

app.post("/book", async (req, res) => {
  const tickets = await client.get("tickets");

  if (tickets > 0) {
    await client.decr("tickets");
    res.json({ message: "✅ Ticket booked successfully" });
  } else {
    res.status(400).json({ message: "❌ Tickets sold out" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});