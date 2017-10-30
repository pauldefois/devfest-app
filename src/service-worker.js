'use strict';
importScripts('./build/sw-toolbox.js');

self.toolbox.options.cache = {
  name: 'ionic-cache'
};

// pre-cache our key assets
self.toolbox.precache(
  [
    './build/main.js',
    './build/main.css',
    './build/polyfills.js',
    'index.html',
    'manifest.json'
  ]
);

// dynamically cache any other local assets
self.toolbox.router.any('/*', self.toolbox.cacheFirst);

// for any other requests go to the network, cache,
// and then only use that cached resource if your user goes offline
self.toolbox.router.default = self.toolbox.networkFirst;


const FILES_TO_CACHE = [
  '.',
  './build/main.js',
  './build/main.css',
  './build/polyfills.js',
  './build/sw-toolbox.js',
  './build/vendor.js',
  'index.html',
  './assets/img/speakers/ad.jpg',
  './assets/img/speakers/ae.jpg',
  'manifest.json'
];

self.addEventListener('install', event => {
  console.log('Installation du service worker...');
  console.log('Mise en cache des ressources');

  event.waitUntil(
      caches.open(self.toolbox.options.cache.name).then(cache => {
          return cache.addAll(FILES_TO_CACHE);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Activation du service worker...');

  const cacheWhiteList = [self.toolbox.options.cache.name];

  event.waitUntil(
      caches.keys().then(cacheNames => {
          return Promise.all(
              cacheNames.map(cacheName => {
                  if (cacheWhiteList.indexOf(cacheName) < 0) {
                      return caches.delete(cacheName);
                  } 
              })
          );
      })
  );
});

self.addEventListener('fetch', event => {
  console.log('Fetching: ', event.request.url);

  event.respondWith(
      caches.match(event.request).then(response => {
          if (response) {
              console.log(event.request.url, 'servi depuis le cache');

              return response;
          }

          console.log(event.request.url, 'servi depuis le réseau');

          return fetch(event.request);
      }).then(response => {
          return caches.open(self.toolbox.options.cache.name).then(cache => {
              if (event.request.url.indexOf('no.cache') < 0) {
                  cache.put(event.request.url, response.clone());
              }

              return response;
          });
      }).catch(error => {
          console.log('Problème');
      })
  );
});

self.skipWaiting();