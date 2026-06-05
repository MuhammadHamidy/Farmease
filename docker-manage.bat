@echo off
REM Farmease Docker Management Script for Windows
REM Usage: docker-manage.bat [command] [options]

setlocal enabledelayedexpansion

title Farmease Docker Manager

REM Colors using escape sequences
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

if "%1"=="" (
    call :print_header
    call :print_usage
    exit /b 0
)

if /i "%1"=="start" (
    call :print_header
    call :start_services
    exit /b 0
)

if /i "%1"=="stop" (
    call :print_header
    call :stop_services
    exit /b 0
)

if /i "%1"=="restart" (
    call :print_header
    call :restart_services
    exit /b 0
)

if /i "%1"=="logs" (
    call :print_header
    call :show_logs %2
    exit /b 0
)

if /i "%1"=="status" (
    call :print_header
    call :show_status
    exit /b 0
)

if /i "%1"=="build" (
    call :print_header
    call :build_images
    exit /b 0
)

if /i "%1"=="clean" (
    call :print_header
    call :clean_containers
    exit /b 0
)

if /i "%1"=="migrate" (
    call :print_header
    call :run_migrations
    exit /b 0
)

if /i "%1"=="seed" (
    call :print_header
    call :run_seeders
    exit /b 0
)

if /i "%1"=="db-shell" (
    call :db_shell
    exit /b 0
)

if /i "%1"=="health" (
    call :print_header
    call :health_check
    exit /b 0
)

if /i "%1"=="help" (
    call :print_header
    call :print_usage
    exit /b 0
)

echo Unknown command: %1
call :print_usage
exit /b 1

:print_header
echo.
echo ============================================
echo   Farmease Docker Management Script
echo ============================================
echo.
exit /b 0

:print_usage
echo.
echo Commands:
echo   docker-manage.bat start       Build and start all services
echo   docker-manage.bat stop        Stop all running services
echo   docker-manage.bat restart     Restart all services
echo   docker-manage.bat logs        View logs [backend^|frontend^|postgres^|all]
echo   docker-manage.bat status      Show status of all services
echo   docker-manage.bat build       Build Docker images
echo   docker-manage.bat clean       Stop and remove containers
echo   docker-manage.bat migrate     Run database migrations
echo   docker-manage.bat seed        Run database seeders
echo   docker-manage.bat db-shell    Open PostgreSQL shell
echo   docker-manage.bat health      Check health of all services
echo   docker-manage.bat help        Show this help message
echo.
exit /b 0

:start_services
echo Starting services...
docker-compose up -d --build
echo.
echo Services started!
timeout /t 3 /nobreak
call :show_status
exit /b 0

:stop_services
echo Stopping services...
docker-compose stop
echo Services stopped!
exit /b 0

:restart_services
echo Restarting services...
docker-compose restart
echo Services restarted!
timeout /t 2 /nobreak
call :show_status
exit /b 0

:show_logs
if "%1"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %1
)
exit /b 0

:show_status
echo Service Status:
docker-compose ps
exit /b 0

:build_images
echo Building Docker images...
docker-compose build
echo Images built!
exit /b 0

:clean_containers
echo Stopping and removing containers...
docker-compose down
echo Containers removed!
exit /b 0

:run_migrations
echo Running database migrations...
docker-compose exec backend ./farmease migrate
echo Migrations completed!
exit /b 0

:run_seeders
echo Running database seeders...
docker-compose exec backend sh -c "for file in auth.sql farms.sql cages.sql sheep.sql breedings.sql feeds.sql healths.sql manures.sql notifications.sql tasks.sql weights.sql; do echo Running seeder: $file...; psql \"$APP_POSTGRES_URL\" -f \"/app/seeders/$file\" || exit 1; done"
echo Seeders completed!
exit /b 0

:db_shell
echo Opening PostgreSQL shell...
docker-compose exec postgres psql -U postgres farmease
exit /b 0

:health_check
echo Checking service health...
echo.

setlocal enabledelayedexpansion
set timeout=1

echo Checking Frontend...
curl -s http://localhost:3000 >nul 2>&1
if !errorlevel! equ 0 (
    echo Frontend: OK
) else (
    echo Frontend: OFFLINE
)

echo Checking Backend...
curl -s http://localhost:8080/health >nul 2>&1
if !errorlevel! equ 0 (
    echo Backend: OK
) else (
    echo Backend: OFFLINE
)

echo Checking Database...
docker-compose exec postgres pg_isready -U postgres >nul 2>&1
if !errorlevel! equ 0 (
    echo Database: OK
) else (
    echo Database: OFFLINE
)

exit /b 0
