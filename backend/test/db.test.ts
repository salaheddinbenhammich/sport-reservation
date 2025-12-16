import { connect } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config(); // load .env variables

const uri =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/football_reservation';

connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));
