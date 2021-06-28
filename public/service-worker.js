// global constants
const APP_PREFIX = 'BudgetTracker-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// constant for cache files
const FILES_TO_CACHE = [
    "/",
    "/css/styles.css",
    "/js/idb.js",
    "/js/index.js",
    "/index.html",
    "/manifest.json"
];

// install function
self.addEventListener('install', function (e) {
    // tells browser to wait until work complete
    e.waitUntil(
        // open cache by specific name
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
})

// activate function that manages cache data
self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        // push cache to an array
        cacheKeeplist.push(CACHE_NAME);
        // returns a promise once all old cache data has been deleted
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
});

// fetches budget data
self.addEventListener("fetch", function (e) {
    e.respondWith(
        // display the users budget amount if offline
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(e.request).then(response => {
          return response || fetch(e.request);
        });
      })
    );
});
  
