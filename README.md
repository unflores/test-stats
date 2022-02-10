# Test-Stats

At Coinhouse we use drone for our continuous integration. This tool gives some stats on runtimes of your tests that run on drone.io

## Getting Started

Get your personal token from your drone ci server: https://<URL>/account

Add the necessary elements to your .env file.

.env
```
TOKEN=asdlkfj1234lk
URL=https://ci.somesite.com
USER=unflores
REPO=test-stats
```

Run:
```
npx tsc && node dist/index.js
```
