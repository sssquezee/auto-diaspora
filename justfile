# Auto Diaspora — task runner. Run `just` on the production VPS (in /opt/auto-diaspora).
# Install just once: apt-get install -y just

# Default: list available recipes
default:
    @just --list

# Pull latest master, install deps, build, restart the service.
# This is the one-command deploy: `just deploy`
deploy:
    git fetch origin
    git reset --hard origin/master
    npm ci
    npm run build
    systemctl restart autodiaspora
    @sleep 3
    @just status

# Build without restarting (e.g. to check it compiles)
build:
    npm ci
    npm run build

# Restart the app service
restart:
    systemctl restart autodiaspora
    @sleep 3
    @just status

# Show service status + a local health check
status:
    @systemctl is-active autodiaspora && echo "service: active" || echo "service: DOWN"
    @curl -fsS -o /dev/null -w "localhost:3001 -> HTTP %{http_code}\n" http://127.0.0.1:3001/ || echo "app not responding on 3001"

# Tail the application logs (Ctrl-C to stop)
logs:
    journalctl -u autodiaspora -f -n 50

# Reload nginx after editing the vhost
reload-nginx:
    nginx -t
    systemctl reload nginx
