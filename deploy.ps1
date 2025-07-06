# Скрипт для деплоя на Koyeb (PowerShell)
# Использование: .\deploy.ps1 -AppName "asn-registry-api" -KoyebToken "your-token"

param(
    [string]$AppName = "asn-registry-api",
    [string]$KoyebToken,
    [string]$GitHubToken
)

if (-not $KoyebToken) {
    Write-Host "Ошибка: Не указан KOYEB_TOKEN" -ForegroundColor Red
    Write-Host "Использование: .\deploy.ps1 -AppName 'app-name' -KoyebToken 'your-token'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Начинаем деплой приложения $AppName на Koyeb..." -ForegroundColor Green

# Проверяем наличие Docker
docker --version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker не установлен" -ForegroundColor Red
    exit 1
} else {
    Write-Host "Docker найден" -ForegroundColor Green
}

# Проверяем наличие Koyeb CLI
koyeb --version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Устанавливаем Koyeb CLI..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://cli.koyeb.com/install.ps1" -OutFile "install-koyeb.ps1"
    & .\install-koyeb.ps1
    Remove-Item "install-koyeb.ps1"
    Write-Host "Koyeb CLI установлен" -ForegroundColor Green
} else {
    Write-Host "Koyeb CLI найден" -ForegroundColor Green
}

# Авторизация в Koyeb
Write-Host "Авторизация в Koyeb..." -ForegroundColor Yellow
echo $KoyebToken | koyeb login --token -

# Сборка Docker образа
Write-Host "Сборка Docker образа..." -ForegroundColor Yellow
docker build -t $AppName .

# Тегирование образа для GitHub Container Registry
$ImageName = "ghcr.io/vpogiba/$AppName:latest"
Write-Host "Тегирование образа как $ImageName..." -ForegroundColor Yellow
docker tag $AppName $ImageName

# Публикация образа (если указан GitHub Token)
if ($GitHubToken) {
    Write-Host "Публикация образа в GitHub Container Registry..." -ForegroundColor Yellow
    echo $GitHubToken | docker login ghcr.io -u vpogiba --password-stdin
    docker push $ImageName
}

# Деплой на Koyeb
Write-Host "Деплой на Koyeb..." -ForegroundColor Yellow
koyeb app init $AppName --docker $ImageName --ports 3000:http --env NODE_ENV=production --env PORT=3000 --routes /:3000

Write-Host "Деплой завершен!" -ForegroundColor Green
Write-Host ("Приложение доступно по адресу: https://{0}.koyeb.app" -f $AppName) -ForegroundColor Cyan
Write-Host ("Dashboard: https://app.koyeb.com/apps/{0}" -f $AppName) -ForegroundColor Cyan 