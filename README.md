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
STAGE_NAMES_REGEX=some_stage|another_stage # There are many stages for a build, you can group multiple testing stages together to get their times
```

Run:
```
npx tsc && node dist/index.js
```
