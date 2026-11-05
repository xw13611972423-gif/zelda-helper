import totk from './data/totk.json';
import botw from './data/botw.json';
import eow from './data/eow.json';
import amiibo from './data/amiibo.json';

export const APP_TITLE = '塞尔达助手';
export const APP_SUBTITLE = '攻略 · amiibo · 图鉴';

const GAMES = [
  { id: 'totk', name: '塞尔达传说', sub: '王国之泪', icon: '⚔️', color: '#E8A33D', deep: '#1E5B8E', data: totk },
  { id: 'botw', name: '塞尔达传说', sub: '旷野之息', icon: '🏹', color: '#7FB069', deep: '#3E7A4E', data: botw },
  { id: 'eow', name: '塞尔达传说', sub: '智慧的再现', icon: '✨', color: '#C792EA', deep: '#6B4A9E', data: eow },
  { id: 'amiibo', name: '塞尔达传说', sub: 'amiibo 图鉴', icon: '🎴', color: '#E0A84A', deep: '#8E5B1E', data: amiibo },
];

export default GAMES;
