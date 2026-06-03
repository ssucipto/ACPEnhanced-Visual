#!/usr/bin/env node
import { createServer } from 'node:net';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT_FILE = '.visualizer-port';

function findFreePort(start: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(start, () => {
      const port = (server.address() as { port: number }).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => resolve(findFreePort(start + 1)));
  });
}

const port = await findFreePort(3000);
writeFileSync(join(process.cwd(), PORT_FILE), String(port));
process.stdout.write(String(port));
