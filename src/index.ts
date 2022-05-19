import { run } from './scripts/full-build';
export { IRollupConfig } from './interfaces';
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
