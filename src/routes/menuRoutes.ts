import express from 'express';
import { getWeeklyMenu } from '../controllers/menuController';

const menuRoutes = express.Router();

menuRoutes.get('/weekly-menu', getWeeklyMenu);

export default menuRoutes;
