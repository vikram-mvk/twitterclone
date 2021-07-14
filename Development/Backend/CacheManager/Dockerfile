FROM node:14

COPY . /app/
WORKDIR /app

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

CMD ["node", "cacheManager.js"]