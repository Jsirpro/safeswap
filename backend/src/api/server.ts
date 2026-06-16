import { buildApp } from './router.js';
import { config } from '../lib/config.js';

const app = buildApp();

app.listen({ port: config.port, host: '0.0.0.0' }).catch((error) => {
  console.error(error);
  process.exit(1);
});
