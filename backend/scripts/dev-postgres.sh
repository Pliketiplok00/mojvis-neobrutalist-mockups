#!/bin/bash
#
# Development PostgreSQL Docker Script
#
# Starts a PostgreSQL container for local development and runs migrations.
#
# Usage:
#   ./scripts/dev-postgres.sh        # Start container and run migrations
#   ./scripts/dev-postgres.sh stop   # Stop and remove container
#   ./scripts/dev-postgres.sh logs   # View container logs
#   ./scripts/dev-postgres.sh psql   # Connect with psql
#

set -e

CONTAINER_NAME="mojvis-postgres"
DB_NAME="mojvis"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_PORT=5432

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
  if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
  fi

  if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running"
    exit 1
  fi
}

stop_container() {
  log_info "Stopping container $CONTAINER_NAME..."
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  log_info "Container stopped and removed"
}

start_container() {
  log_info "Starting PostgreSQL container..."

  # Check if container already exists and is running
  if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    log_info "Container $CONTAINER_NAME is already running"
    return 0
  fi

  # Check if container exists but stopped
  if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
    log_info "Starting existing container $CONTAINER_NAME..."
    docker start "$CONTAINER_NAME"
    return 0
  fi

  # Create new container
  docker run -d \
    --name "$CONTAINER_NAME" \
    -e POSTGRES_USER="$DB_USER" \
    -e POSTGRES_PASSWORD="$DB_PASSWORD" \
    -e POSTGRES_DB="$DB_NAME" \
    -p "$DB_PORT:5432" \
    postgres:15-alpine

  log_info "Container started"

  # Wait for PostgreSQL to be ready
  log_info "Waiting for PostgreSQL to be ready..."
  for i in {1..30}; do
    if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" &>/dev/null; then
      log_info "PostgreSQL is ready"
      return 0
    fi
    sleep 1
  done

  log_error "PostgreSQL did not become ready in time"
  exit 1
}

run_migrations() {
  log_info "Running migrations..."

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  MIGRATIONS_DIR="$SCRIPT_DIR/../src/db/migrations"

  if [ ! -d "$MIGRATIONS_DIR" ]; then
    log_error "Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
  fi

  # Run each migration in order
  for migration in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$migration" ]; then
      filename=$(basename "$migration")
      log_info "Running migration: $filename"
      docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$migration"
    fi
  done

  log_info "All migrations completed"
}

show_connection_info() {
  echo ""
  echo "=============================================="
  echo "PostgreSQL Development Server"
  echo "=============================================="
  echo "Host:     localhost"
  echo "Port:     $DB_PORT"
  echo "Database: $DB_NAME"
  echo "User:     $DB_USER"
  echo "Password: $DB_PASSWORD"
  echo ""
  echo "Connection URL:"
  echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
  echo ""
  echo "Environment variables for backend:"
  echo "  export DB_HOST=localhost"
  echo "  export DB_PORT=$DB_PORT"
  echo "  export DB_NAME=$DB_NAME"
  echo "  export DB_USER=$DB_USER"
  echo "  export DB_PASSWORD=$DB_PASSWORD"
  echo "=============================================="
}

connect_psql() {
  log_info "Connecting to PostgreSQL..."
  docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
}

show_logs() {
  docker logs -f "$CONTAINER_NAME"
}

# Main
check_docker

case "${1:-start}" in
  start)
    start_container
    run_migrations
    show_connection_info
    ;;
  stop)
    stop_container
    ;;
  restart)
    stop_container
    start_container
    run_migrations
    show_connection_info
    ;;
  logs)
    show_logs
    ;;
  psql)
    connect_psql
    ;;
  migrate)
    run_migrations
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|logs|psql|migrate}"
    exit 1
    ;;
esac
