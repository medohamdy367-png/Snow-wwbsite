// اسم الكاش
const CACHE_NAME = 'snow-koral-v1';

// الملفات المراد تخزينها
const urlsToCache = [
  '/snow-website/',
  '/snow-website/index.html',
  '/snow-website/css/style.css',
  '/snow-website/js/main.js',
  '/snow-website/js/auth.js',
  '/snow-website/offline.html',
  '/snow-website/icons/icon-192.png',
  '/snow-website/icons/icon-512.png'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// استقبال الطلبات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان الملف في الكاش، اعرضه
        if (response) {
          return response;
        }
        
        // إذا مش موجود، حمله من النت
        return fetch(event.request).then(
          response => {
            // تأكد من أن الرد صالح
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // خزن النسخة في الكاش
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      }).catch(() => {
        // لو في وضع أوفلاين، اعرض صفحة أوفلاين
        if (event.request.url.indexOf('.html') > -1) {
          return caches.match('/snow-website/offline.html');
        }
      })
  );
});

// مزامنة في الخلفية
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// إشعارات push
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/snow-website/icons/icon-192.png',
    badge: '/snow-website/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    },
    actions: [
      { action: 'open', title: 'فتح' },
      { action: 'close', title: 'إغلاق' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// النقر على الإشعار
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// مزامنة البيانات
async function syncData() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  // محاولة تحديث الملفات
  requests.forEach(async request => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response);
      }
    } catch (error) {
      console.log('فشل تحديث:', request.url);
    }
  });
}