import url from 'url';
import type http from 'http';

export function getServerUrl(server: http.Server): string {
  const address = server.address()!;
  return typeof address === 'string'
    ? address
    : url.format({
        protocol: 'http',
        hostname: address.address,
        port: address.port,
      });
}
