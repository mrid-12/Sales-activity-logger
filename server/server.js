const express = require('express');
const cors = require('cors');
const path = require('path');
const activityRoutes = require('./routes/activityRoutes');
const configRoutes = require('./routes/configRoutes');
const CONSTANTS = require('./constants');

const app = express();
const publicDir = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(CONSTANTS.API_ACTIVITIES, activityRoutes);
app.use(CONSTANTS.API_CONFIG, configRoutes);
app.use(express.static(publicDir));

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith(CONSTANTS.API_ACTIVITIES)) return next();
  res.sendFile(path.join(publicDir, 'index.html'));
});

function startServer(port = 0) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      const assignedPort = server.address().port;
      console.log(`Server running on port ${assignedPort}`);
      resolve(assignedPort);
    });
  });
}

if (require.main === module) {
  startServer(5000);
}

module.exports = { startServer };
