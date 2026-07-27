FROM node:lts-bookworm-slim
WORKDIR /app
RUN apt-get update \
&& apt-get install -y --no-install-recommends curl \
&& rm -rf /var/lib/apt/lists/*
COPY package*.json ./ 
RUN npm ci
COPY . . 
EXPOSE 7000
CMD ["npm", "run", "dev"]
