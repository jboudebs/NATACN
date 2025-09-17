import { SparklisConstr, SparklisSearch } from "./SparklisTypes";

/**
 * Classe représentant un objet ACN (Abstract Constraint Network).
 * Factory
 */
export class ACN {
    /**
     * Fonction représentant le point d'accès de l'ACN.
     * @returns {string} - Le point d'accès de l'ACN.
     */
    endpoint: () => string;

    /**
     * Fonction externe de recherche de contraintes de l'ACN.
     * @param {SparklisSearch} search - La recherche Sparklis.
     * @returns {Promise<SparklisConstr>} - Une promesse de contrainte Sparklis.
     */
    externalSearchConstr: (search: SparklisSearch) => Promise<SparklisConstr>;
}

/**
 * Classe représentant une contrainte.
 */
export class Constraint {
    /**
     * L'ACN avec lequel on travaille
     * @private
     */
    private _acn: ACN;

    /**
     * Constructeur de la classe Constraint.
     * @param {ACN} acn - L'objet ACN associé à la contrainte.
     */
    constructor(acn: ACN) {
        this._acn = acn;
    }

    /**
     * Fonction de création de contrainte.
     * @param {string} word - Le mot pour lequel créer la contrainte.
     * @returns {SparklisConstr | Promise<SparklisConstr>} - Une contrainte Sparklis ou une promesse de contrainte Sparklis.
     */
    public create(word: string): SparklisConstr | Promise<SparklisConstr> {
        // Aiguillage du bon type de contrainte correspondant au endpoint
        if (this._acn.endpoint().includes('wikidata')) {
            return WikidataConstraint(this._acn, word);
        } else {
            return DefaultConstraint(word);
        }
    }
}

/**
 * Fonction de contrainte Wikidata.
 * @param {ACN} acn - L'objet ACN.
 * @param {string} word - Le mot pour lequel créer la contrainte.
 * @returns {Promise<SparklisConstr>} - Une promesse de contrainte Sparklis.
 */
export function WikidataConstraint(acn: ACN, word: string): Promise<SparklisConstr> {
    try {
        const constr = acn.externalSearchConstr({
            type: "WikidataSearch",
            kwds: (typeof word === 'string') ? [word] : word
        });
        return constr;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

/**
 * Fonction de contrainte par défaut.
 * @param {string | string[]} word - Le mot ou les mots pour lesquels créer la contrainte.
 * @returns {SparklisConstr} - Une contrainte Sparklis.
 */
export function DefaultConstraint(word: string | string[]): SparklisConstr {
    return { type: "MatchesAny", kwds: (typeof word === 'string') ? [word] : word };
}
