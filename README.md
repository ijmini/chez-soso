# Chez Soso — Restaurant & bar

Site vitrine du restaurant-bar Chez Soso, situé à Port-Gentil, au Gabon.
La page présente la carte, le buffet et l'ambiance du restaurant, et propose
un lien direct vers WhatsApp pour passer commande.

## Fonctionnalités

- Écran de lancement animé « Chez SoSo ».
- Présentation responsive des grillades, des plats africains, des accompagnements et des boissons.
- Menus illustrés avec les images fournies dans le projet.
- Mise en avant du buffet à **8 000 FCFA par personne**.
- Vidéo d'ambiance en lecture automatique, sans son et en boucle.
- Choix entre thème clair et thème sombre, mémorisé dans le navigateur.
- Bulles décoratives animées en arrière-plan.
- Défilement automatique réversible, avec commande de pause/reprise et option compacte.
- Mascotte Soso animée qui suit le pointeur ou le doigt et ouvre une conversation WhatsApp préremplie.
- Respect de la préférence système de réduction des animations.

## Technologies

HTML5, CSS3 et JavaScript natifs. Aucune dépendance ou étape de compilation
n'est nécessaire.

## Lancer le site

Les fichiers médias doivent rester dans leur dossier `Composants Images`.

Pour un aperçu local, ouvrez `index.html` dans un navigateur. Vous pouvez aussi
lancer un serveur HTTP local depuis le dossier du projet :

```powershell
py -m http.server 8000
```

Ouvrez ensuite <http://localhost:8000>.

## Contenu du projet

```text
index.html
README.md
LICENSE
.gitignore
Composants Images/
  BROCHE.png
  Logo chez SOSO .png
  MENU BOISSON.png
  MENU GRILLADES,PLATS AFRICAINS ET ACCOMPAGNEMENTS.png
  Scène arriere plan de la page en slow motion.mp4
```

## Contact

La mascotte et le bouton de contact ouvrent WhatsApp au **+241 77233838** avec
un message de commande prérempli.

## Licence

Ce projet est distribué sous une licence propriétaire « Tous droits réservés ».
Consultez le fichier [LICENSE](./LICENSE) avant toute utilisation.

Développé par **Services Tech IJ** pour **Chez Soso**.
