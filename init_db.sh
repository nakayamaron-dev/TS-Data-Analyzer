docker-compose -f docker-compose.db.yml up -d && \
sleep 1 && \
bash write_sampledata_influx.sh