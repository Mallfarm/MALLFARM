import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(express.json());

// 🧠 Connect to Render PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Render SSL
  },
});

// Example GET route
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Example POST route
app.post("/api/users", async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query("INSERT INTO users (name) VALUES ($1)", [name]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Insert error");
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));