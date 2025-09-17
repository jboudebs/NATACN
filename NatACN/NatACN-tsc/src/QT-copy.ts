import {SparklisSuggestion} from "../services/ACN/SparklisTypes";
import { ACNQT } from "../services/ACN/SparklisToACNTypes"

/**
 * Classe représentant une query transformation (morceau d'un langage intermédiaire entre le langage naturel et la requête SQL).
 */
export class QT {
    private _increment: SparklisSuggestion; //increment selon les types sparklis
    private _type: string; //orientation si c'est un IncrRel
    private _label: string; //label correspondant à l'incrément
    private _score: number; //score pour éventuellement trier une liste de QT.

    /**
     * Constructeur de la classe QT.
     * @param {QT | ACNQT} qt - L'objet QT ou une suggestion Sparklis.
     * @param {string} [label] - Le libellé associé à l'objet QT.
     */
    constructor(increment: ACNQT, type: string, label?: string, score?: number)
    constructor(qt: QT|ACNQT, label?: string) {
        if (qt instanceof QT) { //copie du QT
            this._increment = qt._increment;
            this._type = qt._type;
            this._label = qt._label;
        }
        else { //incr to QT
            this._increment = qt;
            this._label = label;
            if(typeof qt !== 'string' && qt.type === 'IncrRel')
            {
                this._type = qt.type +"-"+qt.orientation; // Assigner une valeur par défaut si orientation est undefined
            }
            else if (typeof qt !== 'string' && qt.type)
            {
                this._type = qt.type;
            }
        }
    }

    /**
     * Renvoie l'incrément de l'objet QT.
     * @returns {SparklisSuggestion} L'incrément de l'objet QT.
     */
    get increment(): SparklisSuggestion {
        return this._increment;
    }

    /**
     * Définit l'incrément de l'objet QT.
     * @param {SparklisSuggestion} value - Le nouvel incrément.
     */
    set increment(value: SparklisSuggestion) {
        this._increment = value;
    }

    /**
     * Renvoie l'orientation de l'objet QT.
     * @returns {"Fwd" | "Bwd" | undefined} L'orientation de l'objet QT.
     */
    get type(): string {
        return this._type;
    }

    /**
     * Définit l'orientation de l'objet QT.
     * @param {string} value - La nouvelle orientation.
     */
    set type(value: string) {
        this._type = value;
    }


    /**
     * Renvoie le libellé de l'objet QT.
     * @returns {string} Le libellé de l'objet QT.
     */
    get label(): string {
        return this._label;
    }

    /**
     * Définit le libellé de l'objet QT.
     * @param {string} value - Le nouveau libellé.
     */
    set label(value: string) {
        this._label = value;
    }

    /**
     * Renvoie le score de l'objet QT.
     * @returns {number} Le score de l'objet QT.
     */
    get score(): number {
        return this._score;
    }

    /**
     * Définit le score de l'objet QT.
     * @param {number} value - Le nouveau score.
     */
    set score(value: number) {
        this._score = value;
    }


    /**
     * Convertit l'objet QT en une chaîne de caractères.
     * @returns {string} La représentation de l'objet QT en tant que chaîne de caractères.
     */
    toString() {
        if (this.type) {
            return `${this.label}(${this.type})`;
        } else {
            return this.label;
        }
    }

    /**
     * Compare le score de l'objet QT avec celui d'un autre objet QT.
     * @param {QT} qt - L'objet QT à comparer.
     * @returns {number} -1 si le score de l'objet actuel est inférieur, 1 s'il est supérieur, 0 s'ils sont égaux.
     */
    compareScore(qt: QT): number {
        if (this.score < qt.score) {
            return -1;
        } else if (this.score > qt.score) {
            return 1;
        } else if (this.score === qt.score) {
            return 0;
        }
    }
}
