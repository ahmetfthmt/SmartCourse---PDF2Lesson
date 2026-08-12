# SmartCourse — AI Eğitim Tasarımcısı

SmartCourse, metin tabanlı PDF belgelerini yapılandırılmış modüllere, derslere, quizlere ve uygulama görevlerine dönüştüren iki dilli bir PWA'dır. Kullanıcı kendi OpenAI, Gemini veya OpenRouter anahtarını girer; uygulama erişilebilir modelleri değerlendirir, en uygun modeli seçer ve kota ya da hız sınırında aynı sağlayıcı içindeki yedek modellere geçer.

> **Gizlilik yaklaşımı:** Kullanıcının API anahtarı yalnızca üretim isteği için kullanılır. “Bu cihazda hatırla” seçeneği kapalıysa anahtar IndexedDB'ye yazılmaz. Kurslar ve ilerleme verileri cihazdaki IndexedDB'de tutulur.

| Klasör veya dosya | Açıklama |
|---|---|
| `client/` | React, Vite, Tailwind ve PWA kullanıcı arayüzü |
| `server/` | Express/tRPC API, PDF ayrıştırma ve AI sağlayıcı yönlendirmesi |
| `shared/` | Zod şemaları ile istemci/sunucu ortak tipleri |
| `drizzle/` | Veritabanı şeması ve geçiş altyapısı |
| `docs/` | GitHub, Render, ortam değişkenleri ve mimari belgeleri |
| `.github/workflows/` | GitHub Actions ile test ve tip denetimi |
| `render.yaml` | Render Blueprint dağıtım yapılandırması |

## Hızlı başlangıç

Node.js 22 ve pnpm kullanın. Önce `.env.example` dosyasını `.env` olarak kopyalayın, gerekli değerleri girin, ardından bağımlılıkları yükleyip geliştirme sunucusunu başlatın.

```bash
corepack enable
pnpm install --frozen-lockfile
cp docs/ENVIRONMENT.template .env
pnpm dev
```

Üretim derlemesi ve testler aşağıdaki komutlarla çalışır.

```bash
pnpm test
pnpm check
pnpm build
pnpm start
```

## Dağıtım yolları

GitHub'a aktarma, Render Blueprint ile dağıtma ve gerekli ortam değişkenleri için sırasıyla [GitHub rehberine](docs/GITHUB.md), [Render rehberine](docs/RENDER.md) ve [ortam değişkenleri rehberine](docs/ENVIRONMENT.md) bakın. Mimari ve kaynak kodu haritası [mimari belgesinde](docs/ARCHITECTURE.md) yer alır.

Render, `render.yaml` dosyasını destekleyen bir Node web servisi olarak yapılandırılmıştır. Mevcut Manus OAuth altyapısı için Manus tarafından sağlanan değerler dış platforma otomatik taşınmaz; dış dağıtımda OAuth'u korumak istiyorsanız ilgili değişkenleri kendi sağlayıcınızdan yapılandırmanız gerekir.

## Lisans

Bu proje kaynak paketi **MIT** lisansıyla sunulmuştur. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.
