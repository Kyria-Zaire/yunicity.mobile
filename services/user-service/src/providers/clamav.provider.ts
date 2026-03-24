import * as net from 'net';
import { env } from '../config/env.js';

export async function scanBuffer(buffer: Buffer): Promise<{
  clean: boolean;
  virusName?: string | undefined;
}> {
  // En dev sans CLAMAV_HOST → simulation propre
  if (!env.CLAMAV_HOST) {
    console.log(`[DEV CLAMAV] Scan simulé: ${buffer.length} bytes → CLEAN`);
    return { clean: true };
  }

  return new Promise((resolve, reject) => {
    const socket = net.createConnection(env.CLAMAV_PORT, env.CLAMAV_HOST!);
    socket.setTimeout(10_000);

    socket.on('connect', () => {
      socket.write('zINSTREAM\0');
      const sizeBuf = Buffer.alloc(4);
      sizeBuf.writeUInt32BE(buffer.length, 0);
      socket.write(sizeBuf);
      socket.write(buffer);
      socket.write(Buffer.alloc(4)); // EOF chunk
    });

    let response = '';
    socket.on('data', (chunk) => {
      response += chunk.toString();
    });

    socket.on('end', () => {
      socket.destroy();
      if (response.includes('OK')) {
        resolve({ clean: true });
      } else {
        const match = /: (.+) FOUND/.exec(response);
        resolve({ clean: false, virusName: match?.[1] ?? 'Unknown' });
      }
    });

    socket.on('error', (err) => reject(err));
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('ClamAV timeout after 10s'));
    });
  });
}
