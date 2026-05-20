module.exports = {
  apps: [
    {
      name: 'pdl145-backend',
      cwd: '/home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/backend',
      script: 'dist/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
    },
    {
      name: 'pdl145-frontend',
      cwd: '/home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/frontend',
      script: 'npx',
      args: 'vite preview --port 5173 --host',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
    },
  ],
};
