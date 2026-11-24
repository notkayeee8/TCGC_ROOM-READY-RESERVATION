# RoomReady Web

React + Vite port of the RoomReady Flutter classroom-reservation app. Uses the
new `roomready-kaye` Firebase project for Authentication, Cloud Firestore, and
Hosting, and is published through GitHub Pages from this repository's `main`
branch.

## Local development

```powershell
cd web-react
npm install
npm run dev
```

## Production build

```powershell
npm run build
npm run preview
```

## Firebase

- Project ID: `roomready-kaye`
- Web config lives in `src/firebaseConfig.js` (public by design).
- Authorization is enforced by `firestore.rules`; the UI only hides controls.
- Admin ID aliases `admin` and `admin123` map to the designated admin email.
  The password exists only in Firebase Auth, never in source code.
- Deploy rules/providers with the current Firebase CLI:

```powershell
npx -y firebase-tools@latest deploy --only auth,firestore:rules --project roomready-kaye
```

## Deployment

`main` pushes that touch `web-react/` trigger `.github/workflows/pages.yml` at
the repository root. The Vite base path is `/TCGC_ROOM-READY-RESERVATION/`, so
the live URL is:

https://notkayeee8.github.io/TCGC_ROOM-READY-RESERVATION/
