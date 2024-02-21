import express, { Request, Response, NextFunction } from 'express';
import { json, urlencoded } from 'body-parser';

import dotenv from 'dotenv';
dotenv.config();

import connection from './config/connection';
import CityWeatherRoute from './routes/cityWeather';

connection.sync().then(() => {
  console.log('Database synced');
}).catch((err) => {
  console.error('sync Error :: ', err);
});

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

app.use('/weather', CityWeatherRoute);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({ message: err.message });
});

app.listen(process.env.PORT || 3000);