# TS-DATA-ANALYZER

## Prerequisites

- Mac OS
  - Node.js installed (v16.14.2)

## How to set up

### Install Modules

```
npm install
```

### Build

```
npm run build
```

### Launch Web Server

```
npm run start-server
```

### Launch Frontend Server

```
npm run start-front
```

### write sample lineprotocol to influxDB

```
curl -i -XPOST "http://localhost:8086/write?db=t<dbname>" --data-binary @<lineprotocol filename>
```
