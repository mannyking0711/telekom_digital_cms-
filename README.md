# Strapi CMS

## Tech-Stack

- Node 16
- npm 8
- MySQL 8.0


## Install

```shell
git clone https://git-codecommit.eu-central-1.amazonaws.com/v1/repos/telekom_digitalx_cms
cd telekom_digitalx_cms
npm ci
cp .env.example .env
```

## Setup

The `.env` file stores the basic configurations such as project name, host, port and authentication secrets. 

Changes to the `.env` file require rebuilding the admin panel. After saving the modified file run `npm run build --clean` to implement the changes.

Tip: To create secret keys, run either `openssl rand -base64 16` or `node -e "console.log(require('crypto').randomBytes(16).toString('base64'));"`.


### APP

`HOST=0.0.0.0` (string)
Host name.

`PORT=1337` (string)
Port on which the server should be running.

`APP_KEYS="toBeModified1,toBeModified2,toBeModified3,toBeModified4"` (string)
Session keys (based on Koa session), which is used by the session middleware for the Users & Permissions plugin and the Documentation plugin.

`API_TOKEN_SALT=tobemodified` (string)
Salt used to generate API tokens.

`ADMIN_JWT_SECRET=tobemodified` (string)
Secret used to encode JWT tokens.

`JWT_SECRET=tobemodified` (string)
Random string used to create new JWTs.


### DATABASE

`RDS_HOSTNAME=127.0.0.1` (string)
Database host name.

`RDS_PORT=3306` (string)
Database port.

`RDS_DB_NAME="telekom_digitalx_cms"` (string)
Database name.

`RDS_USERNAME="cms_develop"` (string)
Username used to establish the connection.

`RDS_PASSWORD=` (string)
Password used to establish the connection.

`DATABASE_SSL=false` (string)
For SSL database connection.


### AMAZON WEB SERVICES

`AWS_ACCESS_KEY_ID=""` (string)
AWS access key id. Can remain empty during development.

`AWS_ACCESS_SECRET=""` (string)
AWS access key id secret. Can remain empty during development.

`AWS_S3_BUCKET="telekom-digitalx-cms-develop"` (string)
AWS SE bucket.


### FRONTEND

`FRONTEND_URL="https://staging-web.digital-x.eu"` (string)
The url of the frontend is needed for the preview function.

`FRONTEND_PREVIEW_SECRET="super-secret-frontend-preview-token"` (string)
Secret used for the preview function. Must also be configured in CloudFront.


### MATOMO

`MATOMO_URL="https://analytics.digital-x.eu"` (string)
The url of the Matomo web analytics platform.

`MATOMO_TOKEN="abc123"` (string)
Secret token for Matomo API accesses.


## Development

```shell
# Build
npm run build --clean

# Start lokal Strapi
npm run develop --watch-admin
```

## Elasticsearch for Autocomplete

### Installation and Configuration (Ubuntu)

--- Installation
```shell
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic.gpg
echo "deb [signed-by=/usr/share/keyrings/elastic.gpg] https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list

sudo apt update
sudo apt install elasticsearch
```
--- Configuration
```shell
sudo nano /etc/elasticsearch/elasticsearch.yml
`
  xpack.security.enabled: false
  xpack.security.enrollment.enabled: false
  xpack.security.http.ssl.enabled: false
  xpack.security.transport.ssl.enabled: false
  http.host: 0.0.0.0
  ingest.geoip.downloader.enabled: false
`

cp -rf ./dic /etc/elasticsearch/

sudo systemctl start elasticsearch.service
```

### Installation (MacOS)

--- Installation
```shell
brew cask install elasticsearch
brew services start elasticsearch
```

## API
### Initialization (Optional)

`curl http://localhost:1337/api/autocomplete/seed` Establish Elasticsearch indexes.
<br>
`curl http://localhost:1337/api/autocomplete/migrate` Migration from MySQL Server
