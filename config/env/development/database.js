module.exports = ({ env }) => ({
    connection: {
      client: 'mysql',
      connection: {
        host: env('RDS_HOSTNAME', '127.0.0.1'),
        port: env.int('RDS_PORT', 3306),
        database: env('RDS_DB_NAME', 'telekom_digitalx_cms'),
        user: env('RDS_USERNAME', 'cms_develop'),
        password: env('RDS_PASSWORD', ''),
        ssl: {
          rejectUnauthorized: env.bool('DATABASE_SSL', false), // For self-signed certificates
        },
      },
    },
  });
  