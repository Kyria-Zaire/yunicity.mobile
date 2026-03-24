# MongoDB Atlas — Guide de configuration

## 1. Créer un compte

Rendez-vous sur [cloud.mongodb.com](https://cloud.mongodb.com) et créez un compte (ou connectez-vous).

## 2. Créer un cluster

- Cliquez **Build a Database**
- Sélectionnez **M0 (Free Tier)**
- Région : **eu-west-1 (Paris)** de préférence
- Nom du cluster : `yunicity-dev`

## 3. Database Access

- Allez dans **Database Access** > **Add New Database User**
- Username : `yunicity`
- Password : générez un mot de passe fort
- Rôle : **readWrite** sur la database `yunicity`

## 4. Network Access

- Allez dans **Network Access** > **Add IP Address**
- En développement : ajoutez `0.0.0.0/0` (accès depuis n'importe où)
- **En production** : restreindre à l'IP du serveur uniquement

## 5. Récupérer la connection string

- Allez dans **Database** > **Connect** > **Drivers**
- Copiez la connection string :
  ```
  mongodb+srv://yunicity:<password>@cluster.mongodb.net/yunicity?retryWrites=true&w=majority
  ```
- Remplacez `<password>` par le mot de passe créé à l'étape 3
- Collez dans votre `.env.local` → variable `MONGODB_ATLAS_URI`

## 6. Visualiser avec MongoDB Compass

- Téléchargez [MongoDB Compass](https://www.mongodb.com/products/compass)
- Pour Atlas : collez la connection string de l'étape 5
- Pour le Docker local en dev : `mongodb://yunicity:changeme_local@localhost:27018/yunicity?authSource=admin`
