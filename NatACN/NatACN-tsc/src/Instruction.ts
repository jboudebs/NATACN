import { Constraint } from "./Constraint";

export type NLPWord =
{
    word: string;
    type : string;
    pos_tag: string;
    start_char: number
    end_char: number;
    lemma: string;
    synset:string[]
}

/**
 * The `Instruction` class is a TypeScript class designed to represent natural language processing (NLP) entities. It includes properties and methods for handling various aspects of NLP data.
 */

export class Instruction {
    private _string: string; //The word itself.
    private _type: string; //The type of the word, ex: NE
    private _pos_tag: string; //The part-of-speech tag of the word.
    private _start_char: number; //The starting character position of the word.
    private _end_char: number; //The ending character position of the word.
    private _lemma: string; //The lemma of the word.
    private _synset: string[]; //An array of synonyms associated with the word.
    private _constr: Constraint;

    /**
     * Creates an instance of the Instruction class.
     *
     * @param {string | Instruction | NLPWord} kw - The input data for creating the instruction.
     */
    constructor(kw: string | Instruction | NLPWord ) {
        if (typeof kw === 'string') {
            this._string = kw.replaceAll('\'s', '').replaceAll('\'', '').replaceAll('"', '');
        }
        else if (kw instanceof Instruction) {
            this._type = 'NE';
            this._string = kw._string;
        }
        else {
            this._type = kw.type && 'NE';
            this._string = kw.word.replace('"', '').replace(/'s$/, '');
            this._pos_tag = kw.pos_tag;
            this._start_char = kw.start_char;
            this._end_char = kw.end_char;
            this._lemma = kw.lemma;
            this._synset = kw.synset;
        }

    }

    /**
     * Checks if the instruction is a named entity (NE).
     *
     * @returns {boolean} - True if the instruction is a named entity, false otherwise.
     */
    public isNE(): boolean {
        return this._type === 'NE';
    }

    /**
     * Creates a deep copy of the instruction.
     *
     * @param {Instruction} kw - The instruction to copy.
     * @returns {Instruction} - A deep copy of the instruction.
     */
    public static copy(kw: Instruction): Instruction {
        return Object.assign(Object.create(Object.getPrototypeOf(kw)), JSON.parse(JSON.stringify(kw)));
    }

    /**
     * Sets the string content of the instruction.
     *
     * @param {string} kw - The new string content.
     */
    set string(kw: string) {
        this._string = kw;
    }

    /**
     * Sets the constraint for the instruction.
     *
     * @param {*} constr - The constraint to set.
     */
    set constr(constr: any) {
        this._constr = constr;
    }

    /**
     * Gets the constraint of the instruction.
     *
     * @returns {*} - The constraint of the instruction.
     */
    get constr(): any {
        return this._constr;
    }

    /**
     * Gets the string representation of the instruction.
     *
     * @returns {string} - The string representation of the instruction.
     */
    public toString(): string {
        return this._string;
    }

    /**
     * Gets the type of the instruction.
     *
     * @returns {string} - The type of the instruction.
     */
    public getType(): string {
        return this._type;
    }

    /**
     * Sets the type of the instruction.
     *
     * @param {string} type - The new type for the instruction.
     */
    public set type(type: string) {
        this._type = type;
    }

    /**
     * Gets the lemma of the instruction.
     *
     * @returns {string} - The lemma of the instruction.
     */
    public getLemma(): string {
        return this._lemma;
    }

    /**
     * Gets the synsets associated with the instruction.
     * TODO : await NLPToolsParameters.getSynonyms(this._string); si vide ?
     *
     * @returns {string[]} - An array of synsets associated with the instruction.
     */
    public get synset(): string[]{
        return this._synset;
    }

    /**
     * Sets the synsets for the instruction.
     *
     * @param {string[]} synset - An array of synsets to set.
     */
    public set synset(synset: string[]) {
        this._synset = synset;
    }
}
