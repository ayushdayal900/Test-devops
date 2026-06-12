module.exports = {
    apps: [
        {
            name: 'mahalaxmi-backend',
            script: 'server.js',
            instances: 1, // Run a single instance (or 'max' for cluster mode if scaling is needed)
            autorestart: true,
            watch: false, // Don't watch files in production
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            }
        }
    ]
};
