const CACHE_NAME = 'estetixhub-v1';
const API_CACHE = 'api-cache-v1';
const STATIC_CACHE = 'static-cache-v1';

// Arquivos para cache inicial
const urlsToCache = [
  '/',
  '/dashboard',
  '/clientes',
  '/agenda',
  '/servicos',
  '/anamnese',
  '/marketing',
  '/configuracoes',
  '/offline.html'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Cacheando arquivos estáticos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== API_CACHE) {
            console.log('🗑️ Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache: Stale-While-Revalidate para API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Cache da resposta atualizada
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            // Falha na rede, tenta cache
            return cache.match(event.request).then(cached => {
              if (cached) {
                console.log('📱 Respondendo do cache API:', url.pathname);
                return cached;
              }
              // Se não tiver cache, retorna erro offline
              return new Response(JSON.stringify({ 
                error: 'offline',
                message: 'Você está offline. Tente novamente quando conectar.'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
          });
      })
    );
    return;
  }
  
  // Arquivos estáticos
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // Outros recursos
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Sincronização em background
self.addEventListener('sync', event => {
  if (event.tag === 'sync-agendamentos') {
    console.log('🔄 Sincronizando agendamentos...');
    event.waitUntil(syncAgendamentos());
  }
});

async function syncAgendamentos() {
  // Implementar sincronização de agendamentos offline
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    if (request.url.includes('/api/agendamentos') && request.method === 'POST') {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Erro na sincronização:', error);
      }
    }
  }
}