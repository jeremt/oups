import {browser} from '$app/environment';
import {getContext, setContext} from 'svelte';

export interface ConnectedUser {
    type: 'connected';
    //
    id: number;
    name: string;
    email: string;
    admin?: boolean;
    avatar_url: string;
}

interface AnonUser {
    type: 'anon';
    //
    id: number;
}

export type User = ConnectedUser | AnonUser;

class UserContext {
    #value: User;

    set value(newValue: User) {
        this.#value = newValue;
        if (browser) {
            if (newValue) {
                localStorage.setItem('user', JSON.stringify(newValue));
            } else {
                localStorage.removeItem('user');
            }
        }
    }
    get value() {
        return this.#value;
    }

    constructor() {
        /**
         * We use a specific id (-1) to prevent fouc by
         * checking if the user has been loaded from local storage already.
         */
        let initialUser: User = {type: 'anon', id: -1};

        if (browser) {
            const cachedUser = localStorage.getItem('user');
            initialUser = cachedUser ? JSON.parse(cachedUser) : initialUser;
        }
        this.#value = initialUser;
    }
}

const userSymbol = Symbol('user');
export function setUser() {
    const ctx = new UserContext();

    setContext(userSymbol, ctx);
}

export function getUser() {
    return getContext<UserContext>(userSymbol);
}
