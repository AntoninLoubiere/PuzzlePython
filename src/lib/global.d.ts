/// <reference types="@sveltejs/kit" />

interface Puzzle {
    id: string;
    name: string;
    description: string;
    owner: string;
    blocks: Block[];
    falseBlocks: Block[];
    creation_date: import('firebase/firestore').Timestamp;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface HTMLAttributes<T> {
        onconsider?: (event: CustomEvent<DndEvent> & { target: EventTarget & T }) => void;
        onfinalize?: (event: CustomEvent<DndEvent> & { target: EventTarget & T }) => void;
    }
}
