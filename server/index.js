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
  
  // Set headers for streaming progress
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  let nonce = 0;
  const progressInterval = 50000;

  try {
    while (true) {
      const hash = crypto.createHash('sha256').update(prefix + nonce).digest('hex');
      if (hash < lowerTarget) {
        const elapsed = (Date.now() - startTime) / 1000;
        console.log(`Solved at nonce ${nonce} in ${elapsed}s`);
        // Final result marked with a special prefix
        res.write(`RESULT: ${JSON.stringify({ nonce: nonce.toString(), elapsed })}\n`);
        return res.end();
      }
      
      nonce++;

      if (nonce % progressInterval === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        res.write(`PROGRESS: Nonce ${nonce} (${elapsed.toFixed(1)}s elapsed...)\n`);
      }
      
      // Safety break for extremely high difficulty
      if (nonce > 50000000) {
        res.write(`ERROR: Difficulty too high for this server\n`);
        return res.end();
      }
    }
  } catch (err) {
    console.error('Solver error:', err);
    res.write(`ERROR: Internal server error during solving\n`);
    return res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Echo Solver Server running on port ${PORT}`);
});
