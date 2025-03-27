import { Router } from 'express';
import express from 'express';
import { startCronJob, stopCronJob } from '../controllers/cronController';

const cronRouter = express.Router();

cronRouter.get('/start', startCronJob);
cronRouter.get('/stop', stopCronJob);

export default cronRouter;
