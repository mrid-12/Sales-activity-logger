const express = require('express');
const cors = require('cors');
const path = require('path');
const activityRoutes = require('./routes/activityRoutes');
const configRoutes = require('./routes/configRoutes');

const app = express();
const publicDir = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use('/activities', activityRoutes);
app.use('/config', configRoutes);
app.use(express.static(publicDir));

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/activities')) return next();
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
