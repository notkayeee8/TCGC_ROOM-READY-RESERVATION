// Firebase web app configuration is public by design — it identifies the project
// and is shipped in every web bundle. Access control is enforced by Firestore rules.
export const firebaseConfig = {
  apiKey: 'AIzaSyDFzuYP99SY0U4m9duzPXpxPQBU1R74PcM',
  authDomain: 'roomready-kaye.firebaseapp.com',
  projectId: 'roomready-kaye',
  storageBucket: 'roomready-kaye.firebasestorage.app',
  messagingSenderId: '872650435003',
  appId: '1:872650435003:web:55cd2e2ef168d755d4fc9e',
}

// Admin sign-in ID aliases from the original Flutter app. The credential itself
// lives only in Firebase Auth; no password is stored in this repository.
export const ADMIN_EMAIL = 'notkayeee8@gmail.com'
export const ADMIN_ID_ALIASES = ['admin', 'admin123']
