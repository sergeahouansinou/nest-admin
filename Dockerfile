# En cas de problèmes réseau, vous pouvez configurer l'accélération par miroir : https://gist.github.com/y0ngb1n/7e8f16af3242c7815e7ca2f0833d3ea6
# FROM définit l'image de base pour la construction. L'instruction FROM doit être la première instruction du Dockerfile. Si l'image spécifiée n'existe pas, elle sera automatiquement téléchargée depuis Docker Hub.
# L'image de base est node, latest signifie la dernière version. Pour un espace minimal, choisissez lts-alpine
# Utiliser 'as' pour nommer une étape
FROM node:20-slim AS base

ARG PROJECT_DIR

ENV DB_HOST=mysql \
    APP_PORT=7001 \
    PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"


RUN corepack enable \
    && yarn global add pm2

# L'instruction WORKDIR définit le répertoire de travail pour les instructions RUN, CMD et ENTRYPOINT (par défaut /). Cette instruction peut apparaître plusieurs fois dans le Dockerfile.
# Si un chemin relatif est utilisé, il sera relatif à la valeur précédente de WORKDIR.
# Par exemple : WORKDIR /data, WORKDIR logs, RUN pwd affichera /data/logs.
# cd vers /nest-admin
WORKDIR $PROJECT_DIR
COPY ./ $PROJECT_DIR
RUN chmod +x ./wait-for-it.sh 

# set timezone
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo 'Asia/Shanghai' > /etc/timezone

# see https://pnpm.io/docker
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile 

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build


# mirror acceleration
# RUN npm config set registry https://registry.npmmirror.com
# RUN pnpm config set registry https://registry.npmmirror.com
# RUN npm config rm proxy && npm config rm https-proxy

FROM base
COPY --from=prod-deps $PROJECT_DIR/node_modules $PROJECT_DIR/node_modules
COPY --from=build $PROJECT_DIR/dist $PROJECT_DIR/dist

# EXPOSE port
EXPOSE $APP_PORT

# Commande exécutée au démarrage du conteneur, similaire à npm run start
# CMD ["pnpm", "start:prod"]
# CMD ["pm2-runtime", "ecosystem.config.js"]
ENTRYPOINT ./wait-for-it.sh $DB_HOST:$DB_PORT -- pnpm migration:run && pm2-runtime ecosystem.config.js
