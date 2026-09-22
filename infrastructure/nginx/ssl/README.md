# SSL Certificates

Place your SSL certificates here for production HTTPS.

## Required Files

- `cert.pem` — Your SSL certificate chain
- `key.pem` — Your private key

## Quick Start with Self-Signed Certs (Development Only)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/CN=localhost"
```

## Production with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy to this directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem key.pem
```

## Auto-Renewal

Add to crontab:
```
0 0 1 * * certbot renew --post-hook "cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /path/to/ssl/cert.pem && cp /etc/letsencrypt/live/your-domain.com/privkey.pem /path/to/ssl/key.pem && docker compose restart nginx"
```
