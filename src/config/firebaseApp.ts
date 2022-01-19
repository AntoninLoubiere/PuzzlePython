import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase-config.json';

export const firebaseApp = initializeApp(firebaseConfig);
