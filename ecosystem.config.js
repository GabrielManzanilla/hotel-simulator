require('dotenv').config();

module.exports = {
  apps: [{
    name: 'hotel-simulator',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'fork',
    env_file: '.env',
    env: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      PORT: process.env.PORT || 3000,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || 5432,
      DB_NAME: process.env.DB_NAME || 'hotel_db',
      DB_USER: process.env.DB_USER || 'hotel_user',
      DB_PASSWORD: process.env.DB_PASSWORD || 'hotel_password_2024',
      DATABASE_URL: process.env.DATABASE_URL
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};

