self.addEventListener('install', (event) => {
  console.log('SW installed!');
});

self.addEventListener('fetch', (event) => {

});

self.addEventListener('activate', (event) => {
  // console.log('[SERVICE WORKER] activated', event);
  return self.clients.claim();
});
