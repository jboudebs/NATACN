// sparklis-api.ts

export interface SparklisRdfTerm {
    type: "uri" | "number" | "typedLiteral" | "plainLiteral" | "bnode" | "var";
    uri?: string;
    number?: number;
    str?: string;
    datatype?: string;
    lang?: string;
    id?: string;
    name?: string;
}

export interface SparklisDelta {
    type: "nil" | "ids" | "duplicate" | "selection";
    ids?: number[];
    map?: [number, number][];
    whole?: SparklisDelta;
    parts?: SparklisDelta[];
}

export interface SparklisResults {
    columns: string[];
    rows: (SparklisRdfTerm | null)[][];
}

export interface SparklisSearch {
    type: "TextQuery" | "WikidataSearch";
    kwds: string[];
}

export interface SparklisConstraint {
    type:
        | "True"
        | "MatchesAll"
        | "MatchesAny"
        | "IsExactly"
        | "StartsWith"
        | "EndsWith"
        | "After"
        | "Before"
        | "FromTo"
        | "HigherThan"
        | "LowerThan"
        | "Between"
        | "HasLang"
        | "HasDatatype"
        | "ExternalSearch";
    kwd?: string;
    kwdFrom?: string;
    kwdTo?: string;
    value?: string;
    lang?: string;
    datatype?: string;
    searchQuery?: SparklisSearch;
    resultTerms?: SparklisRdfTerm[];
    terms?: SparklisRdfTerm[];
}

export interface SparklisNumConv {
    targetType: "Integer" | "Decimal" | "Double";
    forgetOriginalDatatype: boolean;
}

export interface SparklisPred {
    type: "Class" | "Prop" | "SO" | "EO";
    uri?: string;
    uriS?: string;
    uriO?: string;
    uriE?: string;
}

export interface SparklisArg {
    type: "S" | "P" | "O" | "Q";
    uri?: string;
}

export interface SparklisLatLong {
    type: "WikidataGeolocation" | "LatLong";
    uriLat?: string;
    uriLong?: string;
}

export interface SparklisOrder {
    type: "ASC" | "DESC";
    conv?: SparklisNumConv;
}

export interface SparklisAggreg {
    type:
        | "COUNT_DISTINCT"
        | "LIST"
        | "SAMPLE"
        | "SUM"
        | "AVG"
        | "MAX"
        | "MIN";
    conv?: SparklisNumConv;
}

export interface SparklisSuggestion {
    type:
        | "IncrAnything"
        | "IncrThatIs"
        | "IncrSomethingThatIs"
        | "IncrTriplify"
        | "IncrSimRankIncr"
        | "IncrSimRankDecr"
        | "IncrAnd"
        | "IncrDuplicate"
        | "IncrOr"
        | "IncrChoice"
        | "IncrMaybe"
        | "IncrNot"
        | "IncrIn"
        | "IncrInWhichThereIs"
        | "IncrUnselect"
        | "IncrForeach"
        | "IncrForeachResult"
        | "IncrSelection"
        | "IncrInput"
        | "IncrTerm"
        | "IncrId"
        | "IncrPred"
        | "IncrArg"
        | "IncrTriple"
        | "IncrType"
        | "IncrRel"
        | "IncrLatLong"
        | "IncrConstr"
        | "IncrHierarchy"
        | "IncrSim"
        | "IncrOrder"
        | "IncrAggreg"
        | "IncrForeachId"
        | "IncrAggregId"
        | "IncrFuncArg"
        | "IncrName";
    value?: string;
    id?: number;
    pred?: SparklisPred;
    arg?: SparklisArg;
    uri?: string;
    latlong?: SparklisLatLong;
    constr?: SparklisConstraint;
    filterType?: "OnlyIRIs" | "OnlyLiterals" | "Mixed";
    transitiveRelInCtx?: boolean;
    argS?: SparklisArg;
    argO?: SparklisArg;
    order?: SparklisOrder;
    aggreg?: SparklisAggreg;
    name?: string;
    op?: "And" | "Or" | "NAnd" | "NOr" | "Aggreg";
    items?: SparklisSuggestion[];
    inputType?: "IRI" | "String" | "Float" | "Integer" | "Date" | "Time" | "DateTime" | "Duration";
    boolResult?: boolean;
    func?: string;
