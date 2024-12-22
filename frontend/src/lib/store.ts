
import { writable, type Writable } from "svelte/store";
import { getCookie } from "./utils/cookies";

class Store {
    constructor(
        public isLoggedIn: Writable<boolean> = writable(typeof window !== 'undefined' ? getCookie('auth') === 'true' : false), // UI Only - Fetch requests will fail anyways without http-only cookie
        // public notificationsEnabled: Writable<boolean> = writable(typeof window !== 'undefined' ? localStorage.getItem('notificationsEnabled') !== 'false' : true),
        public isPlaying: Writable<boolean> = writable(false),
        public musicid: Writable<string> = writable('uxf1FUU8mk0'),
        public musicvol: Writable<number> = writable(50),
    ) { }
}

const store = new Store();

export default store;
