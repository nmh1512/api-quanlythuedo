# STAGE 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install --frozen-lockfile

# STAGE 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN yarn build
# Remove devDependencies
RUN yarn install --production --ignore-scripts --prefer-offline

# STAGE 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy essential files
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts ./
COPY --from=builder --chown=nestjs:nodejs /app/tsconfig.json ./

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

USER nestjs

# Port exposed by NestJS
EXPOSE 3000

# Script to run migrations, seed and start the app
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && yarn start:prod"]
