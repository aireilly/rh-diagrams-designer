export interface IconDefinition {
  id: string;
  name: string;
  viewBox: string;
  path: string;
  width: number;
  height: number;
}

export const ICONS: IconDefinition[] = [
  // Row 1
  {
    id: 'storage',
    name: 'Storage, repo, database',
    viewBox: '0 0 32 32',
    path: 'M16 4C9.4 4 4 5.8 4 8v16c0 2.2 5.4 4 12 4s12-1.8 12-4V8c0-2.2-5.4-4-12-4zm0 2c5.5 0 10 1.6 10 2.5S21.5 11 16 11 6 9.4 6 8.5 10.5 6 16 6zM6 11.5c2.2 1.2 5.8 2 10 2s7.8-.8 10-2V16c0 .9-4.5 2.5-10 2.5S6 16.9 6 16v-4.5zM6 19c2.2 1.2 5.8 2 10 2s7.8-.8 10-2v5c0 .9-4.5 2.5-10 2.5S6 24.9 6 24v-5z',
    width: 32,
    height: 32,
  },
  {
    id: 'server',
    name: 'Server',
    viewBox: '0 0 32 32',
    path: 'M5 7v18h22V7H5zm2 2h18v14H7V9zm3 3v2h6v-2h-6zm12 0v2h2v-2h-2zm-12 5v2h6v-2h-6zm12 0v2h2v-2h-2z',
    width: 32,
    height: 32,
  },
  {
    id: 'router',
    name: 'Router, switch, load balancer',
    viewBox: '0 0 32 32',
    path: 'M5 7v18h22V7H5zm2 2h18v14H7V9zm5 3v8h2V12h-2zm3 0v8h2V12h-2zm3 0v8h2V12h-2zm3 0v8h2V12h-2z',
    width: 32,
    height: 32,
  },
  {
    id: 'document',
    name: 'Document, file, message',
    viewBox: '0 0 32 32',
    path: 'M7 4v24h14l4-4V4H7zm2 2h14v16h-4v4H9V6zm3 4v2h8v-2h-8zm0 4v2h8v-2h-8zm0 4v2h5v-2h-5z',
    width: 32,
    height: 32,
  },
  {
    id: 'user',
    name: 'User',
    viewBox: '0 0 32 32',
    path: 'M16 4a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm-8 14c0-3.3 3.6-6 8-6s8 2.7 8 6v2H8v-2zm2 0h12c-.3-2.2-3-4-6-4s-5.7 1.8-6 4z',
    width: 32,
    height: 32,
  },
  {
    id: 'public-access',
    name: 'Public access',
    viewBox: '0 0 32 32',
    path: 'M16 6c-5.2 0-10 2.5-10 6v8c0 3.5 4.8 6 10 6s10-2.5 10-6v-8c0-3.5-4.8-6-10-6zm0 2c4.4 0 8 2 8 4s-3.6 4-8 4-8-2-8-4 3.6-4 8-4zm-8 8.4c2 1.4 4.8 2.1 8 2.1s6-.7 8-2.1V20c0 2-3.6 4-8 4s-8-2-8-4v-3.6z',
    width: 32,
    height: 32,
  },
  // Row 2
  {
    id: 'storage-stack',
    name: 'Storage stack, repo, database',
    viewBox: '0 0 32 36',
    path: 'M16 2C10.5 2 6 3.5 6 5.5S10.5 9 16 9s10-1.5 10-3.5S21.5 2 16 2zm0 1.5c4.4 0 8 1.2 8 2s-3.6 2-8 2-8-1.2-8-2 3.6-2 8-2zM6 8c2 1 4.8 1.7 8 1.7h4c3.2 0 6-.7 8-1.7v3c0 .8-3.6 2-8 2h-4c-4.4 0-8-1.2-8-2V8zm0 5.5c2 1 4.8 1.7 8 1.7h4c3.2 0 6-.7 8-1.7v3c0 .8-3.6 2-8 2h-4c-4.4 0-8-1.2-8-2v-3zM16 12C10.5 12 6 13.5 6 15.5S10.5 19 16 19s10-1.5 10-3.5S21.5 12 16 12zm-10 8c2 1 4.8 1.7 8 1.7h4c3.2 0 6-.7 8-1.7v3c0 .8-3.6 2-8 2h-4c-4.4 0-8-1.2-8-2v-3zM16 22C10.5 22 6 23.5 6 25.5S10.5 29 16 29s10-1.5 10-3.5S21.5 22 16 22zm0 1.5c4.4 0 8 1.2 8 2s-3.6 2-8 2-8-1.2-8-2 3.6-2 8-2z',
    width: 32,
    height: 36,
  },
  {
    id: 'server-stack',
    name: 'Server stack',
    viewBox: '0 0 32 32',
    path: 'M5 4v8h22V4H5zm2 2h18v4H7V6zm3 1v2h6V7h-6zm12 0v2h2V7h-2zM5 14v8h22v-8H5zm2 2h18v4H7v-4zm3 1v2h6v-2h-6zm12 0v2h2v-2h-2zM5 24v4h22v-4H5zm2 1h18v2H7v-2z',
    width: 32,
    height: 32,
  },
  {
    id: 'gateway',
    name: 'Gateway',
    viewBox: '0 0 32 32',
    path: 'M5 5v22h22V5H5zm2 2h18v18H7V7zm4 4v2h2.6l-4.3 4.3 1.4 1.4L15 14.4V17h2v-6h-6zm7 7v6h6v-2h-2.6l4.3-4.3-1.4-1.4L20 14.6V12h-2v6z',
    width: 32,
    height: 32,
  },
  {
    id: 'documents',
    name: 'Documents, files, messages',
    viewBox: '0 0 32 32',
    path: 'M9 2v24h14l4-4V2H9zm2 2h14v16h-4v4H11V4zm3 4v2h8V8h-8zm0 4v2h8v-2h-8zm0 4v2h5v-2h-5zM5 6v24h14l4-4V28H7V6H5z',
    width: 32,
    height: 32,
  },
  {
    id: 'users',
    name: 'Users',
    viewBox: '0 0 36 32',
    path: 'M12 4a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4zm12 0a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4zM18 10a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4zM4 22c0-2.8 3.2-5 7-5 1.4 0 2.7.3 3.8.9C13 19 12 20.4 12 22v2H4v-2zm14 0c0-2.8 3.2-5 7-5 3 0 5.5 1.4 6.5 3.3.3.5.5 1.1.5 1.7v2H18v-2zm-4 0c0-2.8 2.7-5 6-5s6 2.2 6 5v2H14v-2zm2-.2c.4-1.7 2.2-3 4-3s3.6 1.3 4 3v.2h-8v-.2z',
    width: 36,
    height: 32,
  },
  {
    id: 'client',
    name: 'Client',
    viewBox: '0 0 32 32',
    path: 'M4 5v16h24V5H4zm2 2h20v12H6V7zm5 15h10v2h-4v2h-2v-2h-4v-2z',
    width: 32,
    height: 32,
  },
  // Row 3
  {
    id: 'virtual-storage',
    name: 'Virtual storage, repo, database',
    viewBox: '0 0 32 32',
    path: 'M16 4C9.4 4 4 5.8 4 8v16c0 2.2 5.4 4 12 4s12-1.8 12-4V8c0-2.2-5.4-4-12-4zm0 2c5.5 0 10 1.6 10 2.5S21.5 11 16 11 6 9.4 6 8.5 10.5 6 16 6zM6 11.5c2.2 1.2 5.8 2 10 2s7.8-.8 10-2V16c0 .9-4.5 2.5-10 2.5S6 16.9 6 16v-4.5zM6 19c2.2 1.2 5.8 2 10 2s7.8-.8 10-2v5c0 .9-4.5 2.5-10 2.5S6 24.9 6 24v-5z',
    width: 32,
    height: 32,
  },
  {
    id: 'virtual-server',
    name: 'Virtual server',
    viewBox: '0 0 32 32',
    path: 'M5 7h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zM5 9h2v2H5zM27 9v2h-2v3h-2v2h2v3h-2v2h2v3h2v2h-2v-2h-3v-2h-2v-2h2v-3h-2v-2h2v-3h-2V9h2v2h3V9h2zM5 11h2v2H5zm0 3h2v2H5v-2zm0 3h2v2H5v-2zm0 3h2v2H5v-2zm0 3h2v2H5v-2zm3 2h2v-2H8v2zm3 0h2v-2h-2v2zm3 0h2v-2h-2v2zm3 0h2v-2h-2v2zm3 0h2v-2h-2v2zm3 0h2v-2h-2v2zM10 12v8h6v-8h-6zm2 2h2v4h-2v-4z',
    width: 32,
    height: 32,
  },
  {
    id: 'virtual-router',
    name: 'Virtual router, switch, load balancer',
    viewBox: '0 0 32 32',
    path: 'M5 7h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zM5 9h2v14H5zm22 0v14h-2V9h2zM5 23h2v2H5zm3 2h2v-2H8v2zm3 0h2v-2h-2v2zm3 0h2v-2h-2v2zm3 0h2v-2h-2v2zm3 0h2v-2h-2v2zm3 0h2v-2h-2v2zm-14-13v8h2v-8h-2zm3 0v8h2v-8h-2zm3 0v8h2v-8h-2zm3 0v8h2v-8h-2z',
    width: 32,
    height: 32,
  },
  {
    id: 'health-monitor',
    name: 'Health Monitor',
    viewBox: '0 0 32 32',
    path: 'M16 3L4 9v6c0 8 5 15.4 12 17 7-1.6 12-9 12-17V9L16 3zm0 2.2L26 10v5c0 7-4.2 13-10 14.7C10.2 28 6 22 6 15v-5l10-4.8zM11 12v8h10v-8H11zm2 2h2v1h-1v1h1v2h-2v-1h1v-1h-1v-2zm4 0h2v4h-1v-3h-1v-1z',
    width: 32,
    height: 32,
  },
  // Row 4
  {
    id: 'virtual-storage-stack',
    name: 'Virtual storage stack, repo, database',
    viewBox: '0 0 32 36',
    path: 'M16 2C10.5 2 6 3.5 6 5.5S10.5 9 16 9s10-1.5 10-3.5S21.5 2 16 2zm0 1.5c4.4 0 8 1.2 8 2s-3.6 2-8 2-8-1.2-8-2 3.6-2 8-2zM6 8c2 1 4.8 1.7 8 1.7h4c3.2 0 6-.7 8-1.7v3c0 .8-3.6 2-8 2h-4c-4.4 0-8-1.2-8-2V8zm0 5.5c2 1 4.8 1.7 8 1.7h4c3.2 0 6-.7 8-1.7v3c0 .8-3.6 2-8 2h-4c-4.4 0-8-1.2-8-2v-3zM16 12C10.5 12 6 13.5 6 15.5S10.5 19 16 19s10-1.5 10-3.5S21.5 12 16 12zm-10 8c2 1 4.8 1.7 8 1.7h4c3.2 0 6-.7 8-1.7v3c0 .8-3.6 2-8 2h-4c-4.4 0-8-1.2-8-2v-3zM16 22C10.5 22 6 23.5 6 25.5S10.5 29 16 29s10-1.5 10-3.5S21.5 22 16 22zm0 1.5c4.4 0 8 1.2 8 2s-3.6 2-8 2-8-1.2-8-2 3.6-2 8-2z',
    width: 32,
    height: 36,
  },
  {
    id: 'virtual-server-stack',
    name: 'Virtual server stack',
    viewBox: '0 0 32 32',
    path: 'M5 4h2v1H5zm3 0h2v1H8zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zM5 5h1v6H5zm22 0v6h-1V5h1zM5 11h2v1H5zm3 0h2v1H8zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zM10 7v2h6V7h-6zm12 0v2h2V7h-2zM5 13h2v1H5zm3 0h2v1H8zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zM5 14h1v6H5zm22 0v6h-1v-6h1zM5 20h2v1H5zm3 0h2v1H8zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zM10 16v2h6v-2h-6zm12 0v2h2v-2h-2zM5 22h2v1H5zm3 0h2v1H8zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zM5 23h1v4H5zm22 0v4h-1v-4h1zM5 27h2v1H5zm3 0h2v1H8zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zM10 24v2h6v-2h-6zm12 0v2h2v-2h-2z',
    width: 32,
    height: 32,
  },
  {
    id: 'hypervisor',
    name: 'Hypervisor',
    viewBox: '0 0 32 32',
    path: 'M5 7h2v1H5zm3 0h2v1H8zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zM5 8h1v16H5zm22 0v16h-1V8h1zM5 24h2v1H5zm3 0h2v1H8zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zM10 12v2h12v-2H10zm0 4v2h12v-2H10zm0 4v2h8v-2h-8z',
    width: 32,
    height: 32,
  },
  {
    id: 'vpn',
    name: 'VPN',
    viewBox: '0 0 32 32',
    path: 'M16 3L4 9v6c0 8 5 15.4 12 17 7-1.6 12-9 12-17V9L16 3zm0 2.2L26 10v5c0 7-4.2 13-10 14.7C10.2 28 6 22 6 15v-5l10-4.8zm-1.4 9.3l-3.5 3.5 1.4 1.4L15 17v0l2.5 2.5 1.4-1.4-3.5-3.5-.9-.6z',
    width: 32,
    height: 32,
  },
];
