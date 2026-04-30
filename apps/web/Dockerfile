FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@yunicity/web" run build
EXPOSE 3000
CMD ["pnpm", "--filter", "@yunicity/web", "start"]

