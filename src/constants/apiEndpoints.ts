const BASE_URL = process.env.BASE_URL || 'http://localhost';
const PORT = process.env.PORT || 3890;
export const API_ENDPOINTS = {
  CRON: {
    START: `${BASE_URL}:${PORT}/api/cron/start`,
    STOP: `${BASE_URL}:${PORT}/api/cron/stop`,
  },
  MENU: {
    WEEKLY: `${BASE_URL}:${PORT}/api/menu/weekly-menu`,
    SEND_TO_SLACK: `${BASE_URL}:${PORT}/api/menu/send-menu-to-slack`,
    SEND_MARKDOWN_TO_SLACK: `${BASE_URL}:${PORT}/api/menu/send-markdown-menu-to-slack`,
  },
} as const;

export default API_ENDPOINTS;
