FROM mcr.microsoft.com/playwright:v1.62.1-jammy

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV RESPECT_ROBOTS_TXT=true
ENV USER_AGENT=WebsiteAnalyzerMCP/1.0

ENTRYPOINT ["node", "dist/index.js"]
