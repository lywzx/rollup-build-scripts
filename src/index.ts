import { run } from './scripts/full-build';

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
