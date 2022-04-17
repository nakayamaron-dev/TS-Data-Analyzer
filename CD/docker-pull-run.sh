#!/usr/bin/bash

PATH=/usr/local/bin:$PATH
echo $PATH

# Output the current time (for logging)
echo Start - $(date)

# Define the specific information for each environment (separated by spaces)
WEBAPP_IMAGE="docker.pkg.github.com/nakayamaron-dev/ts-data-analyzer/ts-data-analyzer:main"
echo ${WEBAPP_IMAGE}

# Move to the directory of the current script file
cd ${BASH_SOURCE%/*}

# main
cat .github-token | docker login docker.pkg.github.com -u nakayamaron-dev --password-stdin
docker pull ${WEBAPP_IMAGE}
docker-compose -f "docker-compose.cd.yml" up -d
docker system prune -f