# Докеризация сервиса «КупиПодариДай»

IP адрес: `84.201.175.38`

Frontend: `https://popinskisoda.nomorepartiessite.ru`

Backend: `https://api.popinskisoda.nomorepartiessite.ru`

## Локальный запуск

1. Скопируйте `.env.example` в `.env` и замените демонстрационные секреты.
2. Запустите сервисы командой `docker compose up --build`.
3. Откройте фронтенд на `http://localhost:8081`; API доступен на
   `http://localhost:4000`.

PostgreSQL доступен только контейнеру бэкенда во внутренней Docker-сети.
Данные базы сохраняются в именованном volume `postgres-data`.
