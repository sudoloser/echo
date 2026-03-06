const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SOLVER_KEY = process.env.SOLVER_KEY;

if (!SOLVER_KEY) {
  console.warn('WARNING: SOLVER_KEY is not set. The server is currently unprotected.');
}

app.get('/', (req, res) => {
  res.send('Echo LRCLIB Solver Server is running.');
});

app.get('/health', (req, res) => res.send('OK'));

/**
 * Solve LRCLIB PoW challenge
 * Expects { prefix, target } in body
 */
app.post('/solve', (req, res) => {
  // Validate Solver Key
  const clientKey = req.headers['x-solver-key'];
  if (SOLVER_KEY && clientKey !== SOLVER_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Solver Key' });
  }

  const { prefix, target } = req.body;

  if (!prefix || !target) {
    return res.status(400).json({ error: 'Missing prefix or target' });
  }

  console.log(`Solving challenge for prefix: ${prefix}...`);
  const startTime = Date.now();
  const lowerTarget = target.toLowerCase();
  
  let nonce = 0;
  // Node.js native crypto is much faster than CryptoJS
  while (true) {
    const hash = crypto.createHash('sha256').update(prefix + nonce).digest('hex');
    if (hash < lowerTarget) {
      const elapsed = (Date.now() - startTime) / 1000;
      console.log(`Solved at nonce ${nonce} in ${elapsed}s`);
      return res.json({ nonce: nonce.toString(), elapsed });
    }
    nonce++;
    
    // Safety break for extremely high difficulty (prevents infinite loop on server)
    if (nonce > 50000000) {
      return res.status(500).json({ error: 'Difficulty too high for this server' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Echo Solver Server running on port ${PORT}`);
});
