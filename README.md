Get your personal token from your drone ci server: https://<URL>/account

Add your token TOKEN and your server url URL to .env

Add a USER and REPO to the .env

Ex:
TOKEN=asdlkfj1234lk
URL=https://ci.somesite.com
USER=unflores
REPO=test-stats

Run:
```
npx tsc && node dist/index.js
```
