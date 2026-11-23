# Chez Soso — Restaurant & bar

Site vitrine du restaurant-bar Chez Soso, situé à Port-Gentil, au Gabon.
La page présente la carte en texte et en images, le buffet, les informations
pratiques et l'ambiance du restaurant, avec des liens directs vers le téléphone
et WhatsApp.

## Fonctionnalités

- Écran de lancement animé « Chez SoSo ».
- Section « L’expérience Chez Soso » et espacements augmentés pour une landing page plus ample.
- Menu burger dans l’en-tête regroupant Explorer, le thème et le contact.
- Présentation responsive des grillades, des plats africains, des accompagnements et des boissons.
- Menus textuels repliables pour garder l'aperçu compact, avec les visuels originaux accessibles en complément.
- Chargement progressif des plats et accompagnements avec le bouton « Afficher les suivants ».
- Panier et commande WhatsApp accessibles depuis la barre de navigation, avec message prérempli, horaires en temps réel et réservation de salle.
- Protection anti-robot Cloudflare Turnstile, vérifiée côté serveur pour les commandes et les réservations.
- Adresse à 25 Logement, horaires du lundi au samedi (12 h–21 h) et deux numéros cliquables.
- Réservation de salle et organisation d'événements.
- Mise en avant du buffet à **8 000 FCFA par personne**.
- Vidéo d'ambiance sans lecture automatique et chargée à la demande.
- Métadonnées de partage et données structurées Schema.org `Restaurant`.
- Choix entre thème clair et thème sombre, mémorisé dans le navigateur.
- Bulles décoratives animées en arrière-plan.
- Parallaxe discret sur les visuels principaux, désactivé sur mobile et avec la réduction des animations.
- Défilement automatique réversible, avec commande de pause/reprise et option compacte.
- Mascotte Soso animée qui suit le pointeur ou le doigt et ouvre une conversation WhatsApp préremplie.
- Respect de la préférence système de réduction des animations.

## Technologies

HTML5, CSS3 et JavaScript natifs, avec deux fonctions serverless Node.js pour la
configuration et la validation Turnstile. Aucun package npm n'est requis.

## Tests

```powershell
node --test .\tests\*.test.js
```

## Lancer le site

Les fichiers médias doivent rester dans le dossier `assets`.

Pour un aperçu local, ouvrez `index.html` dans un navigateur. Vous pouvez aussi
lancer un serveur HTTP local depuis le dossier du projet :

```powershell
py -m http.server 8000
```

Ouvrez ensuite <http://localhost:8000>.

La vérification anti-robot requiert les fonctions Vercel ; le serveur statique
`py -m http.server` ne les exécute pas. Pour tester en local, utilisez `vercel dev`
avec les clés de test Turnstile et `TURNSTILE_HOSTNAME=localhost`.

## Configuration anti-robot sur Vercel

Créez un widget Cloudflare Turnstile autorisé pour `chez-soso.vercel.app`, puis
ajoutez ces variables dans **Project Settings → Environment Variables** :

- `TURNSTILE_SITE_KEY` : clé publique du widget.
- `TURNSTILE_SECRET_KEY` : clé secrète, conservée uniquement côté serveur.
- `TURNSTILE_HOSTNAME` : `chez-soso.vercel.app`, sans protocole ni chemin.

Redéployez après avoir enregistré les variables. Les demandes sont refusées si
la configuration ou la vérification Turnstile est indisponible.

## Contenu du projet

```text
index.html
README.md
LICENSE
api/
  turnstile-config.js
  verify-turnstile.js
tests/
  inline-script.test.js
  verify-turnstile.test.js
assets/
  ambiance.mp4
  broche-sans-filigrane.png
  brochettes.png
  logo-chez-soso.png
  mascotte.png
  menu-boissons.png
  menu-grillades-plats-africains.png
```

## Contact

La mascotte ouvre le panier ; les commandes vérifiées et réservations ouvrent
WhatsApp au **+241 77 233 838** avec un message prérempli. Le restaurant est à **25 Logement, Port-Gentil**,
et les horaires communiqués sont **du lundi au samedi, 12 h–21 h**. La réservation
de salle et l'organisation d'événements sont possibles. Téléphones : **+241 77 233 838**
et **+241 65 353 512**.

## Licence

Ce projet est distribué sous une licence propriétaire « Tous droits réservés ».
Consultez le fichier [LICENSE](./LICENSE) avant toute utilisation.

Développé par **Services Tech IJ** pour **Chez Soso**.
