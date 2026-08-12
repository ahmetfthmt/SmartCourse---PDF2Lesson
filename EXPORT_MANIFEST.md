# SmartCourse Dışa Aktarma Paketi

Bu kaynak paketi, GitHub deposuna doğrudan yüklenebilecek veya Render Blueprint olarak bağlanabilecek şekilde düzenlenmiştir. Arşivde bağımlılık klasörleri, derleme çıktıları, yerel günlükler, Manus çalışma alanı dosyaları ve gizli değerler bulunmaz.

| Kategori | İçerik | Kullanım amacı |
|---|---|---|
| Uygulama arayüzü | `client/` | React sayfaları, bileşenler, PWA manifesti ve stil sistemi |
| API ve AI katmanı | `server/` | tRPC, PDF ayrıştırma, sağlayıcı model yönlendirmesi ve testler |
| Ortak sözleşmeler | `shared/` | Zod şemaları ile istemci/sunucu arasında paylaşılan tipler |
| Veri katmanı | `drizzle/` | Kullanıcı verisi için Drizzle şemaları ve geçiş altyapısı |
| Dağıtım belgeleri | `docs/` | Render, GitHub, ortam değişkenleri ve mimari açıklamaları |
| Otomasyon | `.github/workflows/` | Push ve pull request doğrulaması için GitHub Actions |
| Platform dosyaları | `render.yaml`, `.node-version` | Render Blueprint ve Node sürümü tanımı |
| Paket yapılandırması | `package.json`, `pnpm-lock.yaml`, `vite.config.ts` | Bağımlılıklar, üretim derlemesi ve çalışma zamanı ayarları |

## Arşivden bilinçli olarak çıkarılanlar

`node_modules/`, `dist/`, `.manus-logs/`, `.git/`, yerel `.env` dosyaları ve Manus'a özgü istemci hata ayıklama varlıkları dışa aktarma arşivine alınmaz. Böylece paket küçük kalır, gizli bilgi taşımaz ve bağımlılıklar hedef ortamda kilit dosyasından tekrarlanabilir biçimde yüklenir.

## İlk adım

Arşivi açtıktan sonra `README.md` dosyasını okuyun. GitHub için [docs/GITHUB.md](docs/GITHUB.md), Render için [docs/RENDER.md](docs/RENDER.md) yolunu izleyin. Ortam şablonu `docs/ENVIRONMENT.template` dosyasındadır.
