# Быстрый деплой на Koyeb

## Вариант 1: Через GitHub Actions (Рекомендуется)

1. **Подготовка репозитория**
   ```bash
   git add .
   git commit -m "Add Koyeb deployment"
   git push origin main
   ```

2. **Настройка GitHub Secrets**
   - Перейдите в `Settings` → `Secrets and variables` → `Actions`
   - Добавьте `KOYEB_TOKEN` (получите на koyeb.com → Account → API Tokens)

3. **Автоматический деплой**
   - При каждом push в `main` будет автоматический деплой
   - Проверьте статус в `Actions` табе

## Вариант 2: Через Koyeb Dashboard

1. **Создание аккаунта**
   - Зайдите на [koyeb.com](https://koyeb.com)
   - Зарегистрируйтесь через GitHub

2. **Деплой приложения**
   - Нажмите `Create App`
   - Выберите `Docker`
   - Укажите образ: `ghcr.io/vpogiba/asn-registry-api:latest`
   - Добавьте переменные:
     - `NODE_ENV=production`
     - `PORT=3000`
   - Нажмите `Deploy`

## Вариант 3: Через CLI (Windows)

```powershell
# Установка Koyeb CLI
Invoke-WebRequest -Uri "https://cli.koyeb.com/install.ps1" | Invoke-Expression

# Авторизация
koyeb login

# Деплой
koyeb app init asn-registry-api --docker ghcr.io/vpogiba/asn-registry-api:latest --ports 3000:http --env NODE_ENV=production --env PORT=3000 --routes /:3000
```

## Проверка деплоя

После деплоя проверьте:

- **Health Check**: `https://your-app.koyeb.app/health`
- **API Registry**: `https://your-app.koyeb.app/api/v1/registry`
- **API Events**: `https://your-app.koyeb.app/api/v1/events`

## Обновление клиента

В `tmp_cli/client.js` замените:
```javascript
const res = await fetch('http://localhost:3000/api/v1/registry');
```
на:
```javascript
const res = await fetch('https://your-app.koyeb.app/api/v1/registry');
```

## Полезные команды

```bash
# Проверка статуса приложения
koyeb app list

# Просмотр логов
koyeb app logs asn-registry-api

# Обновление приложения
koyeb app update asn-registry-api --docker ghcr.io/vpogiba/asn-registry-api:latest
``` 