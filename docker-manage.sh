#!/bin/bash

# Farmease Docker Management Script
# Usage: ./docker-manage.sh [command] [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  Farmease Docker Management Script${BLUE}          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
}

print_usage() {
    cat << EOF
Usage: ./docker-manage.sh [command] [options]

Commands:
  start                Build and start all services
  stop                 Stop all running services
  restart              Restart all services
  logs [service]       View logs (service: backend, frontend, postgres, all)
  logs-tail [n]        View last N lines of logs
  exec [service] [cmd] Execute command in service
  status               Show status of all services
  build                Build Docker images
  clean                Stop and remove containers
  clean-all            Stop, remove containers and volumes (DELETE DATA!)
  migrate              Run database migrations
  seed                 Run database seeders
  db-backup            Backup PostgreSQL database
  db-restore [file]    Restore PostgreSQL database
  db-shell             Open PostgreSQL shell
  health               Check health of all services
  stats                Show resource usage

Examples:
  ./docker-manage.sh start
  ./docker-manage.sh logs backend
  ./docker-manage.sh exec backend ./farmease migrate
  ./docker-manage.sh db-shell
  ./docker-manage.sh logs-tail 100

EOF
}

# Start services
start_services() {
    echo -e "${YELLOW}Building and starting services...${NC}"
    docker-compose up -d --build
    echo -e "${GREEN}✓ Services started${NC}"
    sleep 3
    show_status
}

# Stop services
stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    docker-compose stop
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# Restart services
restart_services() {
    echo -e "${YELLOW}Restarting services...${NC}"
    docker-compose restart
    echo -e "${GREEN}✓ Services restarted${NC}"
    sleep 2
    show_status
}

# View logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        service="all"
    fi
    
    if [ "$service" = "all" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# View last N lines
show_logs_tail() {
    local lines=${1:-50}
    docker-compose logs --tail="$lines"
}

# Show status
show_status() {
    echo -e "${BLUE}Service Status:${NC}"
    docker-compose ps
}

# Build images
build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker-compose build
    echo -e "${GREEN}✓ Images built${NC}"
}

# Execute command
execute_command() {
    local service=$1
    shift
    local cmd="$@"
    
    if [ -z "$service" ] || [ -z "$cmd" ]; then
        echo -e "${RED}Error: Service and command required${NC}"
        echo "Usage: ./docker-manage.sh exec [service] [command]"
        exit 1
    fi
    
    docker-compose exec "$service" "$cmd"
}

# Clean containers
clean_containers() {
    echo -e "${YELLOW}Stopping and removing containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Containers removed${NC}"
}

# Clean everything
clean_all() {
    echo -e "${RED}WARNING: This will delete database and all volumes!${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing everything...${NC}"
        docker-compose down -v
        echo -e "${GREEN}✓ Everything cleaned${NC}"
    else
        echo "Cancelled"
    fi
}

# Run migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker-compose exec backend ./farmease migrate
    echo -e "${GREEN}✓ Migrations completed${NC}"
}

# Run seeders
run_seeders() {
    echo -e "${YELLOW}Running database seeders...${NC}"
    docker-compose exec backend sh -c '
        for file in auth.sql farms.sql cages.sql sheep.sql breedings.sql feeds.sql healths.sql manures.sql notifications.sql tasks.sql weights.sql; do
            echo "Running seeder: $file..."
            psql "$APP_POSTGRES_URL" -f "/app/seeders/$file" || exit 1
        done
    '
    echo -e "${GREEN}✓ Seeders completed${NC}"
}

# Backup database
backup_database() {
    local backup_file="farmease_backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${YELLOW}Backing up database to $backup_file...${NC}"
    docker-compose exec postgres pg_dump -U postgres farmease > "$backup_file"
    echo -e "${GREEN}✓ Database backed up to $backup_file${NC}"
}

# Restore database
restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}Error: Backup file required${NC}"
        echo "Usage: ./docker-manage.sh db-restore [backup_file]"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}Error: Backup file not found: $backup_file${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Restoring database from $backup_file...${NC}"
    docker-compose exec -T postgres psql -U postgres farmease < "$backup_file"
    echo -e "${GREEN}✓ Database restored${NC}"
}

# Database shell
db_shell() {
    echo -e "${BLUE}Opening PostgreSQL shell...${NC}"
    docker-compose exec postgres psql -U postgres farmease
}

# Health check
health_check() {
    echo -e "${BLUE}Checking service health...${NC}"
    
    echo -ne "Frontend: "
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
    
    echo -ne "Backend:  "
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
    
    echo -ne "Database: "
    if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
}

# Show stats
show_stats() {
    docker stats
}

# Main
main() {
    local command=$1
    
    case "$command" in
        start)
            print_header
            start_services
            ;;
        stop)
            print_header
            stop_services
            ;;
        restart)
            print_header
            restart_services
            ;;
        logs)
            print_header
            show_logs "$2"
            ;;
        logs-tail)
            print_header
            show_logs_tail "$2"
            ;;
        exec)
            shift
            execute_command "$@"
            ;;
        status)
            print_header
            show_status
            ;;
        build)
            print_header
            build_images
            ;;
        clean)
            print_header
            clean_containers
            ;;
        clean-all)
            print_header
            clean_all
            ;;
        migrate)
            print_header
            run_migrations
            ;;
        seed)
            print_header
            run_seeders
            ;;
        db-backup)
            print_header
            backup_database
            ;;
        db-restore)
            print_header
            restore_database "$2"
            ;;
        db-shell)
            db_shell
            ;;
        health)
            print_header
            health_check
            ;;
        stats)
            show_stats
            ;;
        help|--help|-h)
            print_header
            print_usage
            ;;
        *)
            if [ -z "$command" ]; then
                print_header
                print_usage
            else
                echo -e "${RED}Unknown command: $command${NC}"
                print_usage
                exit 1
            fi
            ;;
    esac
}

main "$@"
