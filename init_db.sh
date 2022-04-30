docker-compose -f docker-compose.db.yml up -d && \
sleep 1 && \
curl -i -XPOST 'http://localhost:8086/write?db=test' --data-binary @sampledata/lp.txt