FROM node:18-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

COPY ["dist", "./dist"]

# RUN npm run build

CMD ls

# RUN npm run prod
