FROM node:18-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json", "tsconfig.json","./"]

RUN npm install

COPY "src" "/app/src"
# COPY ["dist", "./dist"]

RUN npm run build

# CMD ls

CMD npm run prod

EXPOSE 3000