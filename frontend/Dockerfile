FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p public
COPY public/ public/

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"] 