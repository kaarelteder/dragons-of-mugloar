# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
ARG VITE_API_BASE_URL=https://dragonsofmugloar.com/api/v2
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY index.html vite.config.ts ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
