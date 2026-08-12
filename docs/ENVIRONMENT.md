# Ortam Değişkenleri

`docs/ENVIRONMENT.template` yalnızca güvenli bir şablondur; proje köküne `.env` adıyla kopyalandığında gerçek değerler hiçbir zaman Git deposuna eklenmemelidir. GitHub ve Render'da gizli değerleri platformların secrets/env arayüzlerinden tanımlayın.

| Değişken | Gereklilik | Amaç |
|---|---|---|
| `NODE_ENV` | Zorunlu | Ortam modunu belirler; dağıtımda `production` olmalıdır. |
| `PORT` | Platform tarafından sağlanır | HTTP dinleme noktası; Render bunu otomatik atar. |
| `DATABASE_URL` | Veritabanı/OAuth kullanılıyorsa gerekli | MySQL veya TiDB bağlantı dizesi. |
| `JWT_SECRET` | Oturum kullanılıyorsa gerekli | Oturum imzalama sırrı; uzun, rastgele bir değer kullanın. |
| `VITE_APP_ID` | Manus OAuth kullanılıyorsa gerekli | OAuth uygulama kimliği. |
| `OAUTH_SERVER_URL` | Manus OAuth kullanılıyorsa gerekli | OAuth sunucusu taban URL'si. |
| `VITE_OAUTH_PORTAL_URL` | Manus OAuth kullanılıyorsa gerekli | İstemci OAuth portalı URL'si. |
| `OWNER_OPEN_ID` | İsteğe bağlı | Varsayılan yönetici kimliği. |
| `BUILT_IN_FORGE_API_URL` ve `BUILT_IN_FORGE_API_KEY` | İsteğe bağlı | Manus yerleşik servisleri için; kişisel AI sağlayıcısı akışında kullanılmaz. |

> **Kişisel AI anahtarları:** OpenAI, Gemini veya OpenRouter anahtarlarını Render ya da GitHub secrets değişkeni olarak ayarlamayın. SmartCourse, kullanıcıdan seçtiği sağlayıcı için anahtarı çalışma anında alır ve sağlayıcıyı değiştirmeden istek yapar.
