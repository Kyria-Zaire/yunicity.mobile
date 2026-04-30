FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@yunicity/admin" run build
EXPOSE 3001
CMD ["pnpm", "--filter", "@yunicity/admin", "start"]

