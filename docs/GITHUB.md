# GitHub’a Aktarma

## 1. Yerel Git deposunu başlatın

Arşivi açtıktan sonra proje kökünde aşağıdaki komutları çalıştırın. Önce GitHub’da boş bir depo oluşturun; ardından `<HESAP>/<DEPO>` değerini kendi adresinizle değiştirin.

```bash
git init
git add .
git commit -m "Initial SmartCourse export"
git branch -M main
git remote add origin https://github.com/<HESAP>/<DEPO>.git
git push -u origin main
```

## 2. GitHub Actions doğrulaması

`.github/workflows/ci.yml`, `main` dalına yapılan push ve pull request işlemlerinde bağımlılıkları yükler, testleri, tip denetimini ve üretim derlemesini çalıştırır. İş akışı Node sürümünü `.node-version` dosyasından alır.

## 3. Gizli değerler

Depoda `.env` dosyası oluşturmadan önce `docs/ENVIRONMENT.template` şablonunu inceleyin. OAuth veya veritabanı kullanıyorsanız değerleri GitHub'da **Settings → Secrets and variables → Actions** bölümüne ekleyin. Uygulamanın kullanıcıdan aldığı OpenAI, Gemini ve OpenRouter anahtarlarını GitHub secrets alanına koymayın.

GitHub Actions ve Actions secrets kullanımı için resmi GitHub belgelerine başvurun: [GitHub Actions](https://docs.github.com/actions) ve [Actions secrets](https://docs.github.com/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions).
