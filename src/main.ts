import { App } from './app/App';
import './styles/global.css';

const mountNode = document.querySelector<HTMLElement>('#app');

if (!mountNode) {
  throw new Error('Missing #app mount node');
}

const app = new App(mountNode);
void app.init();
