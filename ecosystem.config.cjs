module.exports = {
  apps: [
    {
      name: 'pdl145-backend',
      cwd: __dirname + '/backend',
      script: 'dist/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
    },
    {
      name: 'pdl145-frontend',
      cwd: __dirname + '/frontend',
      script: 'npx',
      args: 'vite preview --port 5173 --host',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
    },
  ],
};
