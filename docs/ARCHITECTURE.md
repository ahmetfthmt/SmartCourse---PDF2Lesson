# Mimari ve Kaynak Haritası

## Genel yapı

Uygulama, React 19 istemcisi ile Express 4/tRPC 11 sunucusunu tek Node.js sürecinde birleştirir. PDF istemcide seçilir, sunucuda metne ayrıştırılır ve kullanıcının seçtiği AI sağlayıcısına yalnızca o isteğin anahtarıyla iletilir. Zod, hem AI çıktısını hem de API girişlerini doğrular. Üretilen kurs ve ilerleme verileri Dexie üzerinden IndexedDB'de cihazda saklanır.

| Katman | Ana dizinler | Sorumluluk |
|---|---|---|
| Arayüz | `client/src/pages`, `client/src/components` | PDF yükleme, AI ayarları, CourseViewer, quiz ve PWA deneyimi |
| Yerel veri | `client/src/lib/courseDb.ts` | Dexie tabloları, kurs kitaplığı, ilerleme ve yerel ayarlar |
| API sözleşmesi | `shared/course.ts`, `server/routers.ts` | Zod şemaları, tRPC giriş/çıkışları |
| AI yönlendirme | `server/modelRouting.ts`, `server/courseProvider.ts` | OpenAI, Gemini, OpenRouter model keşfi ve kota yedeklemesi |
| PDF işleme | `server/pdfParser.ts` | PDF metnini Markdown ve hiyerarşik bölümlere dönüştürme |
| Kimlik ve veri | `server/_core`, `drizzle/` | OAuth altyapısı, veritabanı bağlantısı ve kullanıcı modeli |

## AI model seçimi

`auto` seçeneğinde sistem, seçili sağlayıcının erişilebilir metin modellerini getirir ve pedagojik kurs üretimine uygun modelleri önceliklendirir. İstek sırasında `429`, kota veya hız sınırı benzeri geçici sağlayıcı hatası alınırsa, aynı sağlayıcıdaki sıradaki aday model denenir. Sağlayıcılar arasında otomatik geçiş yapılmaz; bu tercih kullanıcı anahtarı ve sağlayıcı sınırını korur.

## Dış dağıtım notu

Kurs oluşturma özelliği kullanıcıların kendi OpenAI, Gemini veya OpenRouter anahtarlarını istem anında kullanır; bu nedenle uygulamanın sunucusuna sağlayıcı anahtarı eklemeniz gerekmez. OAuth ve veritabanı özelliklerini dış altyapıda kullanmak için ise kendi dış ortam değişkenlerinizi sağlamanız gerekir.
