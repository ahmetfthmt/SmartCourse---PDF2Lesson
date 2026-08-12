# Render.com’a Dağıtım

## Hazırlık

Bu paket, proje kökündeki `render.yaml` dosyasıyla bir Render Blueprint olarak yapılandırılmıştır. Blueprint, Node web servisini oluşturur, pnpm ile üretim derlemesini alır ve `pnpm start` komutunu çalıştırır.

> Mevcut proje Manus OAuth altyapısını içerir. Manus çalışma alanındaki sistem değerleri GitHub veya Render'a aktarılmaz. Dış dağıtımda kimlik doğrulamayı kullanmak istiyorsanız `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `JWT_SECRET` ve gerekirse `DATABASE_URL` değerlerini kendi dış kurulumunuz için sağlamalısınız.

## Adımlar

1. Kaynak paketi GitHub'a gönderin.
2. Render Dashboard üzerinden **New → Blueprint** seçin ve GitHub deponuzu bağlayın.
3. Render'ın `render.yaml` dosyasını algılamasına izin verin.
4. `DATABASE_URL` ile OAuth değişkenlerini Render hizmetinin **Environment** panelinden tanımlayın.
5. İlk dağıtımın derleme günlüklerini kontrol edin ve uygulama URL'sini açın.

Render, web servisinin `PORT` değişkenini otomatik sağlar; uygulama bu değeri kullanır. Render Blueprint ve ortam değişkenleri hakkında güncel ayrıntılar için resmi belgeleri izleyin: [Render Blueprints](https://render.com/docs/blueprint-spec) ve [Render environment variables](https://render.com/docs/configure-environment-variables).

## Sağlayıcı anahtarı güvenliği

OpenAI, Gemini veya OpenRouter anahtarları Render ortam değişkeni olarak tanımlanmaz. Kullanıcı anahtarını uygulama ayarlarından girer; seçili sağlayıcıya doğrudan ve yalnızca o isteğin kapsamında kullanılır.
