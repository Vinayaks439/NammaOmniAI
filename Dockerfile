# syntax=docker/dockerfile:1

#############################
# 1. Install dependencies   #
#############################
FROM node:24.4.1-alpine3.21 AS deps
WORKDIR /app

# Copy lock & manifest files first to maximise build-cache usage
COPY package.json package-lock.json ./
RUN npm ci

#############################
# 2. Build the application  #
#############################
FROM node:24.4.1-alpine3.21 AS builder
WORKDIR /app

# Re-use previously cached node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Build the Next.js application
RUN npm run build

# Remove any build-time only packages
RUN npm prune --omit=dev

#############################
# 3. Create runtime image   #
#############################
FROM node:24.4.1-alpine3.21 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Optional: use a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy the minimal set of files required to run the app
COPY --from=builder /app/public        ./public
COPY --from=builder /app/.next         ./.next
COPY --from=builder /app/node_modules  ./node_modules
COPY --from=builder /app/package.json  ./package.json
# If you have a Next.js config file, copy it too
COPY --from=builder /app/next.config.mjs ./next.config.mjs

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]
