mongoimport -u mongo -p mongo --db data --collection tsmulti --file /docker-entrypoint-initdb.d/tsmulti.json --jsonArray && \
mongoimport -u mongo -p mongo --db data --collection histogram --file /docker-entrypoint-initdb.d/histogram.json --jsonArray && \
mongoimport -u mongo -p mongo --db data --collection scatter --file /docker-entrypoint-initdb.d/scatter.json --jsonArray && \
mongoimport -u mongo -p mongo --db data --collection taginfo --file /docker-entrypoint-initdb.d/taginfo.json --jsonArray