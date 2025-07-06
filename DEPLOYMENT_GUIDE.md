# Руководство по деплою на Koyeb

## Подготовка к деплою

### 1. Создание аккаунта на Koyeb
1. Зайдите на [koyeb.com](https://koyeb.com)
2. Зарегистрируйтесь через GitHub
3. Подтвердите email

### 2. Настройка GitHub Secrets

В настройках репозитория GitHub (`Settings` → `Secrets and variables` → `Actions`) добавьте:

- `KOYEB_TOKEN` - токен доступа к Koyeb API

### 3. Получение Koyeb Token

1. Войдите в Koyeb Dashboard
2. Перейдите в `Account` → `API Tokens`
3. Создайте новый токен с правами на деплой
4. Скопируйте токен и добавьте в GitHub Secrets

## Автоматический деплой

После настройки GitHub Actions, при каждом push в ветку `main` будет происходить:

1. Сборка Docker образа
2. Публикация в GitHub Container Registry
3. Автоматический деплой на Koyeb

## Ручной деплой

### Через Koyeb Dashboard

1. Войдите в Koyeb Dashboard
2. Нажмите `Create App`
3. Выберите `Docker`
4. Укажите образ: `ghcr.io/vpogiba/asn-registry-api:latest`
5. Настройте переменные окружения:
   - `NODE_ENV=production`
   - `PORT=3000`
6. Нажмите `Deploy`

### Через CLI

```bash
# Установка Koyeb CLI
curl -fsSL https://cli.koyeb.com/install.sh | bash

# Авторизация
koyeb login

# Деплой
koyeb app init asn-registry-api \
  --docker ghcr.io/vpogiba/asn-registry-api:latest \
  --ports 3000:http \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --routes /:3000
```

## Проверка деплоя

После деплоя проверьте:

1. **Health Check**: `https://your-app.koyeb.app/health`
2. **API Registry**: `https://your-app.koyeb.app/api/v1/registry`
3. **API Events**: `https://your-app.koyeb.app/api/v1/events`

## Обновление клиента

В файле `tmp_cli/client.js` замените:
```javascript
const res = await fetch('http://localhost:3000/api/v1/registry');
```
на:
```javascript
const res = await fetch('https://your-app.koyeb.app/api/v1/registry');
```

И аналогично для других запросов.

## Мониторинг

В Koyeb Dashboard доступны:
- Логи приложения
- Метрики производительности
- Статус health checks
- История деплоев

## Troubleshooting

### Проблемы с деплоем
1. Проверьте логи в Koyeb Dashboard
2. Убедитесь, что Docker образ собирается корректно
3. Проверьте переменные окружения

### Проблемы с подключением
1. Проверьте CORS настройки
2. Убедитесь, что порт 3000 открыт
3. Проверьте health check endpoint

### Проблемы с базой данных
1. SQLite файл сохраняется в контейнере
2. Для продакшена рекомендуется использовать внешнюю БД
3. Добавьте volume для персистентности данных 