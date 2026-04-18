const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/records', require('./routes/records'));
app.use('/api/facilities', require('./routes/facilities'));

app.get('/', (req, res) => res.send('UNMAID API running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UNMAID backend running on port ${PORT}`));
