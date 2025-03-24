import express from 'express';
import { getWeeklyMenu, sendMenuToSlack } from '../controllers/menuController';

const menuRoutes = express.Router();

menuRoutes.get('/weekly-menu', getWeeklyMenu);
menuRoutes.get('/send-menu-to-slack', sendMenuToSlack);
menuRoutes.get('/send-markdown-menu-to-slack', (req, res) => {
  req.query.format = 'markdown';
  return sendMenuToSlack(req, res);
});

export default menuRoutes;
