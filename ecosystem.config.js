module.exports = {
  apps: [
    {
      name: 'telekom-digitalx-cms',
      cwd: '/var/www/digitalx_cms',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        RDS_HOSTNAME: 'your-unique-url.rds.amazonaws.com', // database Endpoint under 'Connectivity & Security' tab
        RDS_PORT: '3306',
        RDS_DB_NAME: 'telekom_digitalx_cms', // DB name under 'Configuration' tab
        RDS_USERNAME: 'cms_staging', // default username
        RDS_PASSWORD: 'Password',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    },
  ],
};
