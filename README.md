# nest-admin

![](https://img.shields.io/github/commit-activity/m/buqiyuan/nest-admin) ![](https://img.shields.io/github/license/buqiyuan/nest-admin) ![](https://img.shields.io/github/repo-size/buqiyuan/nest-admin) ![](https://img.shields.io/github/languages/top/buqiyuan/nest-admin)

**Un système de gestion des autorisations simple et efficace avec séparation front-end/back-end, développé avec NestJs + TypeScript + TypeORM + Redis + MySql + Vue3 + Ant Design Vue. Nous espérons que ce projet pourra vous aider dans votre parcours full-stack.**

- Adresse du projet front-end : [Lien](https://github.com/buqiyuan/vue3-antdv-admin)

## Adresse de démonstration

<ul>
  <li>
    <details>
      <summary>
        <a href="https://vue3-antdv-admin.pages.dev/" target="_blank">
        https://vue3-antdv-admin.pages.dev/
        </a>（accès national）
      </summary>
      Lecture seule, vous pouvez prévisualiser l'effet initial complet du projet
    </details>
  </li>
  <li>
    <details>
      <summary>
        <a href="https://vue3-antd-admin.vercel.app/" target="_blank">
        https://vue3-antd-admin.vercel.app/
        </a>（accès international）
      </summary>
      <ul>
        <li>
        Les opérations CRUD sont libres, les données que vous voyez peuvent donc avoir été modifiées par d'autres utilisateurs et ne reflètent pas l'état initial du projet. La base de données est réinitialisée chaque jour à 4h30 du matin.
        </li>
        <li>Étant donné que les ressources serveur à l'étranger sont gratuites, la stabilité n'est pas garantie et un VPN peut être nécessaire pour y accéder.</li>
      </ul>
    </details>
  </li>
  <li>
   <a href="https://nest-admin.buqiyuan.top/api-docs/" target="_blank">
      Documentation Swagger
   </a>
  </li>
</ul>

## Préparation avant le démarrage du projet

- Fichier SQL : [/deploy/sql/nest_admin.sql](https://github.com/buqiyuan/nest-admin/tree/main/deploy/sql/nest_admin.sql) pour l'initialisation de la base de données
- Configuration du projet, par exemple : configurer les connexions mysql et redis
  - Configuration commune : [.env](https://github.com/buqiyuan/nest-admin/blob/main/.env)
  - Environnement de développement : [.env.development](https://github.com/buqiyuan/nest-admin/blob/main/.env.development)
  - Environnement de production : [.env.production](https://github.com/buqiyuan/nest-admin/blob/main/.env.production)

## Prérequis

- `nodejs` `20`+
- `docker` `20.x`+, dont la version de `docker compose` doit être `2.17.0`+
- `mysql` `8.x`+
- Utiliser le gestionnaire de paquets [`pnpm`](https://pnpm.io/zh/) pour installer les dépendances du projet

Identifiants de l'environnement de démonstration :

|   Compte    |  Mot de passe  |    Autorisation    |
| :-------: | :----: | :--------: |
| admin | a123456 | Super administrateur |

> Le mot de passe initial de tous les nouveaux utilisateurs est a123456

Identifiants de déploiement local :

|   Compte    |  Mot de passe  |    Autorisation    |
| :-------: | :----: | :--------: |
| admin | a123456 | Super administrateur |

## Démarrage rapide

Après un démarrage réussi, accédez via <http://localhost:7001/api-docs/>.

```bash
pnpm docker:up
# or
docker compose --env-file .env --env-file .env.production up -d --no-build
```

Arrêter et supprimer tous les conteneurs

```bash
pnpm docker:down
# or
docker compose --env-file .env --env-file .env.production down
```

Supprimer les images

```bash
pnpm docker:rmi
# or
docker rmi buqiyuan/nest-admin-server:stable
```

Voir la sortie des journaux en temps réel

```bash
pnpm docker:logs
# or
docker compose --env-file .env --env-file .env.production logs -f

```

## Développement local

- Obtenir le code du projet

```bash
git clone https://github.com/buqiyuan/nest-admin
```

- [Optionnel] Si vous êtes débutant et ne savez pas encore comment configurer `mysql/redis`, vous pouvez utiliser `Docker` pour démarrer les services nécessaires au développement local, par exemple :

```bash
# Démarrer le service MySql
docker compose --env-file .env --env-file .env.development run -d --service-ports mysql
# Démarrer le service Redis
docker compose --env-file .env --env-file .env.development run -d --service-ports redis
```

- Installer les dépendances

```bash
cd nest-admin

pnpm install

```

- Exécuter
  Après un démarrage réussi, accédez via <http://localhost:7001/api-docs/>.

```bash
pnpm dev
```

- Compiler

```bash
pnpm build
```

## Migration de la base de données

1. Mettre à jour la base de données (ou initialiser les données)

```bash
pnpm migration:run
```

2. Générer une migration

```bash
pnpm migration:generate
```

3. Revenir à la dernière mise à jour

```bash
pnpm migration:revert
```

Pour plus de détails, veuillez consulter la [documentation officielle](https://typeorm.io/migrations)

> [!TIP]
> Si vos `classes d'entité` ou votre `configuration de base de données` ont été mises à jour, veuillez exécuter `npm run build` avant d'effectuer les opérations de migration de base de données.

## Captures d'écran du système

![](https://s1.ax1x.com/2021/12/11/oTi1nf.png)

![](https://s1.ax1x.com/2021/12/11/oTithj.png)

![](https://s1.ax1x.com/2021/12/11/oTirHU.png)

![](https://s1.ax1x.com/2021/12/11/oTia3n.png)

### Bienvenue pour les Star et PR

**Si ce projet vous a été utile, n'hésitez pas à lui donner une Star. Les PR pour de meilleures implémentations sont les bienvenues.**

### Remerciements

- [sf-nest-admin](https://github.com/hackycy/sf-nest-admin)

### LICENSE

[MIT](LICENSE)
