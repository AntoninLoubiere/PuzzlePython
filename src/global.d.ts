/// <reference types="@sveltejs/kit" />

import type { Timestamp } from 'firebase/firestore';

interface Puzzle {
    id: string;
    name: string;
    description: string;
    owner: string;
    blocks: Block[];
    creation_date: Timestamp;
}

interface Block {
    id: number;
    code: string;
    indent: number;
}

interface Results {
    name: string;
    success: boolean;
}

declare type DndEvent = import('svelte-dnd-action').DndEvent;

declare namespace svelte.JSX {
    interface HTMLAttributes<T> {
        onconsider?: (event: CustomEvent<DndEvent> & { target: EventTarget & T }) => void;
        onfinalize?: (event: CustomEvent<DndEvent> & { target: EventTarget & T }) => void;
    }
}
