FROM node:14

COPY . /app/
WORKDIR /app

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 5000
CMD ["node", "server.js"]