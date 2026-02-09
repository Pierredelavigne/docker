const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(express.json());

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'evaluser',
  password: process.env.DB_PASSWORD || 'evalpass',
  database: process.env.DB_NAME || 'evaldb',
  port: 5432
});

// Configuration Redis
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:6379`
});
redisClient.connect();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api' });
});

app.get('/api/stats', async (req, res) => {
  // Vérifier le cache
  const cached = await redisClient.get('stats');
  if (cached) {
    return res.json({ ...JSON.parse(cached), source: 'cache' });
  }

  // Sinon, requête DB
  const result = await pool.query('SELECT COUNT(*) FROM users');
  const stats = { userCount: result.rows[0].count, timestamp: new Date() };

  // Mettre en cache 60 secondes
  await redisClient.setEx('stats', 60, JSON.stringify(stats));
  res.json({ ...stats, source: 'database' });
});

app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  await redisClient.del('stats'); // Invalider le cache
  res.status(201).json(result.rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));