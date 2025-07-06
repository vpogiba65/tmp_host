#!/bin/bash

# Скрипт для деплоя на Koyeb
# Использование: ./deploy.sh [APP_NAME] [KOYEB_TOKEN]

set -e

APP_NAME=${1:-"asn-registry-api"}
KOYEB_TOKEN=${2:-$KOYEB_TOKEN}

if [ -z "$KOYEB_TOKEN" ]; then
    echo "Ошибка: Не указан KOYEB_TOKEN"
    echo "Использование: ./deploy.sh [APP_NAME] [KOYEB_TOKEN]"
    echo "Или установите переменную окружения KOYEB_TOKEN"
    exit 1
fi

echo "🚀 Начинаем деплой приложения $APP_NAME на Koyeb..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

# Проверяем наличие Koyeb CLI
if ! command -v koyeb &> /dev/null; then
    echo "📦 Устанавливаем Koyeb CLI..."
    curl -fsSL https://cli.koyeb.com/install.sh | bash
    export PATH="$HOME/.koyeb/bin:$PATH"
fi

# Авторизация в Koyeb
echo "🔐 Авторизация в Koyeb..."
echo "$KOYEB_TOKEN" | koyeb login --token -

# Сборка Docker образа
echo "🔨 Сборка Docker образа..."
docker build -t $APP_NAME .

# Тегирование образа для GitHub Container Registry
IMAGE_NAME="ghcr.io/vpogiba/$APP_NAME:latest"
echo "🏷️  Тегирование образа как $IMAGE_NAME..."
docker tag $APP_NAME $IMAGE_NAME

# Публикация образа
echo "📤 Публикация образа в GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u vpogiba --password-stdin
docker push $IMAGE_NAME

# Деплой на Koyeb
echo "🚀 Деплой на Koyeb..."
koyeb app init $APP_NAME \
    --docker $IMAGE_NAME \
    --ports 3000:http \
    --env NODE_ENV=production \
    --env PORT=3000 \
    --routes /:3000

echo "✅ Деплой завершен!"
echo "🌐 Приложение доступно по адресу: https://$APP_NAME.koyeb.app"
echo "📊 Dashboard: https://app.koyeb.com/apps/$APP_NAME" 