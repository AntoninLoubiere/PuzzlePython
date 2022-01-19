import { firebaseApp } from '../config/firebaseApp';
import {
    collection,
    type FirestoreDataConverter,
    getDocs,
    getFirestore,
    query,
    where,
    getDoc,
    doc,
    Timestamp,
    setDoc,
    deleteDoc,
    DocumentReference,
    orderBy,
    writeBatch,
    limit
} from 'firebase/firestore';
import type { Puzzle, Results } from '../global';

const db = getFirestore(firebaseApp);

const puzzleConverter: FirestoreDataConverter<Puzzle> = {
    toFirestore: (puzzle: Puzzle) => {
        return {
            owner: puzzle.owner,
            name: puzzle.name,
            blocks: puzzle.blocks.map((b) => {
                return { code: b.code, indent: b.indent };
            }),
            creation_date: puzzle.creation_date,
            description: puzzle.description
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        let blocks = [];
        if (Array.isArray(data.blocks)) {
            blocks = data.blocks.map((b, i) => {
                return {
                    id: i,
                    code: b.code,
                    indent: b.indent
                };
            });
        }

        return {
            id: snapshot.id,
            name: data.name,
            description: data.description,
            owner: data.owner,
            blocks: blocks,
            creation_date: data.creation_date
        };
    }
};

const puzzleRef = collection(db, 'puzzles').withConverter(puzzleConverter);

export async function loadPuzzles(uid: string): Promise<Puzzle[]> {
    const puzzleQuery = query(puzzleRef, where('owner', '==', uid), orderBy('name'));
    const snapshot = await getDocs(puzzleQuery);
    const puzzles: Puzzle[] = [];
    snapshot.forEach((d) => puzzles.push(d.data()));
    return puzzles;
}

export async function getPuzzle(id: string): Promise<Puzzle> {
    if (id) {
        const docSnap = await getDoc(doc(puzzleRef, id));
        if (docSnap.exists()) {
            return docSnap.data();
        }
    }
    return null;
}

export function createNewEmpty(useUid: string): Puzzle {
    return {
        id: doc(puzzleRef).id,
        name: 'Puzzle',
        description: '',
        owner: useUid,
        blocks: [],
        creation_date: Timestamp.fromDate(new Date())
    };
}

export async function savePuzzle(puzzle: Puzzle): Promise<void> {
    return setDoc(doc(puzzleRef, puzzle.id), puzzle);
}

export async function removePuzzle(puzzle: Puzzle): Promise<void> {
    return deleteAllResults(puzzle).then(() => deleteDoc(doc(puzzleRef, puzzle.id)));
}

function resultDoc(puzzleId: string, userId: string): DocumentReference {
    return doc(collection(doc(puzzleRef, puzzleId), 'results'), userId);
}

export async function getPuzzleResults(puzzleId: string, userId: string): Promise<Results> {
    if (puzzleId && userId) {
        const docSnap = await getDoc(resultDoc(puzzleId, userId));
        if (docSnap.exists()) {
            return docSnap.data() as Results;
        }
    }
    return null;
}

export async function getAllPuzzleResults(puzzleId: string): Promise<Results[]> {
    const resultsQuery = query(collection(doc(puzzleRef, puzzleId), 'results'), orderBy('name'));
    const snapshot = await getDocs(resultsQuery);
    const results: Results[] = [];
    snapshot.forEach((r) => results.push(r.data() as Results));
    return results;
}

export async function setPuzzleResults(
    puzzleId: string,
    userId: string,
    data: Results
): Promise<void> {
    return setDoc(resultDoc(puzzleId, userId), data);
}

export async function deleteAllResults(puzzle: Puzzle): Promise<void> {
    const queryResults = query(collection(doc(puzzleRef, puzzle.id), 'results'), limit(500));
    let batchSize: number;
    do {
        const snapshot = await getDocs(queryResults);
        batchSize = snapshot.size;

        if (batchSize <= 0) {
            break;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
    } while (batchSize >= 500);
}
