import { readable, writable } from 'svelte/store';
import type { UserInfo } from 'firebase/auth';
import { randomString } from './utils';
import { browser } from '$app/env';

export const userStore = writable<{
    isLoggedIn: boolean;
    user?: UserInfo;
    firebaseControlled: boolean;
}>({
    isLoggedIn: false,
    firebaseControlled: false
});

function getUserKey(): string {
    if (!browser) return;
    const storage = localStorage.getItem('userKey');
    if (storage) {
        return storage;
    }
    const key = randomString(32);
    localStorage.setItem('userKey', key);
    return key;
}

function createWritableLocalStorage(key: string, startValue: string) {
    const w = writable(browser ? localStorage.getItem(key) || startValue : startValue);
    if (browser) w.subscribe((v) => localStorage.setItem(key, v));
    return w;
}

const userKey = getUserKey();
export const userId = readable(userKey, (set) => {
    userStore.subscribe((u) => {
        if (u.isLoggedIn) {
            set(u.user.uid);
        } else {
            set(userKey);
        }
    });
});
export const anonymousUserName = createWritableLocalStorage('anonymousUserName', '');
