import http from 'http';
import url from 'url';

export function getServerUrl(server: http.Server): string {
  const address = server.address();
  return typeof address === 'string' ?
    address :
    url.format({
      protocol: 'http',
      hostname: address?.address,
      port: address?.port
    });
}
