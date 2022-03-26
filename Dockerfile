FROM node:16 AS builder

COPY . /work
WORKDIR /work

RUN npm ci && \
    npm run build && \
    rm -Rf /work/backend/node_modules && \
    rm -Rf /work/frontend/node_modules && \
    rm -Rf /work/node_modules

FROM node:16

# copy frontend build results
WORKDIR /frontend
COPY --from=builder /work/frontend/dist/ /frontend/dist/

WORKDIR /backend
# copy required for deployment environment
COPY ./backend/package*.json /backend/
RUN echo "strict-ssl=false" > /root/.npmrc && \
    echo "insecure" >> /root/.curlrc && \
    npm install --only=production

# copy backend build results
COPY --from=builder /work/backend/dist/ /backend/dist/

EXPOSE 8000

CMD [ "node", "dist/bin/index.js" ]