import { userStore } from '../store';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '../config/firebaseApp';

export const auth = getAuth(firebaseApp);
auth.onAuthStateChanged(() => {
    if (auth.currentUser) {
        userStore.set({ isLoggedIn: true, user: auth.currentUser, firebaseControlled: true });
    } else {
        userStore.set({ isLoggedIn: false, firebaseControlled: true });
    }
});
