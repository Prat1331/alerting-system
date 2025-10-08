import { createServer } from './server';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function main(): Promise<void> {
  const app = await createServer();
  app.listen(PORT, () => {
    console.log(`Alerting service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal error on startup', err);
  process.exit(1);
});


