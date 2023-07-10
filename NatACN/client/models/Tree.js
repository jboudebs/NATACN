import { isEqual } from "./Utils.js";


class Noeud {
	constructor(valeur, profondeur, largeur, parent) {
		this.valeur = valeur;
		this.child = [];
		this.profondeur = profondeur;
		this.largeur = largeur;
		this.parent = parent;
	}
	
	nbChild()
	{
		if(this._nbchild)
		{
			return this._nbchild
		}
		else
		{
			this._nbChild = this.child.length
			return this.nbChild();
		}
	}
	
	addPathFromNode(path) {
		let currentNode = this;
		
		for (const value of path) {
			let childNode = currentNode.child.find((child) => child.valeur.toString() === value.toString());
			
			if (!childNode) {
				childNode = new Noeud(value);
				childNode.profondeur = currentNode.profondeur + 1;
				currentNode.child.push(childNode);
			}
			
			currentNode = childNode;
		}
		
		if (currentNode.largeur === 0) {
			currentNode.largeur = currentNode.child.length;
		}
	}
	
	
	addChild(valeur) {
		const nouvelEnfant = new Noeud(valeur);
		nouvelEnfant.parent = this;
		this.child.push(nouvelEnfant);
		return nouvelEnfant;
	}
	
	supprimerEnfant(enfant) {
		const index = this.child.indexOf(enfant);
		if (index !== -1) {
			enfant.parent = null;
			this.child.splice(index, 1);
		}
	}
	
	get() {
		return this.valeur;
	}
	
	getParent() {
		return this.parent;
	}
	
	isLeaf()
	{
		return this.getEnfants().length === 0
	}
	
	getEnfants() {
		return this.child;
	}
	
	estFeuille() {
		return this.child.length === 0;
	}
	toString() {
		let output = ""
		let indentation = '  '.repeat(this.profondeur);
		if(this.valeur)
		{
			output = `${indentation}${this.valeur.toString()}[${this.profondeur}, ${this.largeur}]\n`;
			
		}
		
		for (const enfant of this.child) {
			output += enfant.toString();
		}
		
		return output;
	}
	async parcourirEtAppliquer(f) {
		const nouvelArbre = new Noeud(await f(this.valeur), this.profondeur, this.largeur, this.parent); // Crée un nouveau nœud avec la valeur modifiée
		for (const enfant of this.child) {
			const nouvelEnfant = await enfant.parcourirEtAppliquer(f); // Récursivement parcourt et crée les nœuds des child
			nouvelArbre.child.push(nouvelEnfant); // Ajoute le nouvel enfant au nouvel arbre
		}
		
		return nouvelArbre; // Retourne le nouvel arbre avec la structure mise à jour
	}
}


class Tree
{
	constructor(type, liste) {
		 this.type = type;
		 this.racine = liste?new Noeud("ROOT", 0, 0, null):undefined;
		 if(liste instanceof Array && liste[0] instanceof Array)
		 {
			 this.racine = this.construireArbre(liste);
		 }
	}
	
	isEmpty()
	{
		return this.racine;
	}
	
	nbChild()
	{
		this.racine.nbChild()
	}
	
	construireArbre(listes, type) {
		let racine = new Noeud(listes[0][0]);
		
		for (let i = 0; i < listes.length; i++) {
			this._ajouterSousListe(racine, listes[i], 0);
			
		}
		racine.valeur = 'ROOT'
		return racine;
	}
	_ajouterSousListe(noeud, sousListe, profondeur) {
		if (sousListe.length === 0) {
			return;
		}
		
		const valeur = this.type(sousListe[0]);
		const dernierNoeud = noeud.child[noeud.child.length - 1];
		profondeur++
		
		if (dernierNoeud && isEqual(dernierNoeud.valeur, valeur)) {
			this._ajouterSousListe(dernierNoeud, sousListe.slice(1), profondeur);
		} else {
			const nouveauNoeud = new Noeud(valeur, profondeur,noeud.child.length+1, );
			noeud.child.push(nouveauNoeud);
			this._ajouterSousListe(nouveauNoeud, sousListe.slice(1), profondeur);
		}
	}
	
	async parcourirEtAppliquer(tree, f) {
		 console.log(tree)
		this.racine = await tree.racine.parcourirEtAppliquer(f); // Récursivement parcourt et crée les nœuds des child
	}
	
	
	
	ajouterSousListe(noeud, sousListe, profondeur, largeur, type) {
		const valeur = sousListe[0];
		let enfantTrouve = false;
		let enfantCorrespondant;
		
		for (const enfant of noeud.child) {
			if (enfant.valeur === valeur) {
				enfantTrouve = true;
				enfantCorrespondant = enfant;
				break;
			}
		}
		
		if (!enfantTrouve) {
			enfantCorrespondant = new Noeud(type(valeur), profondeur, largeur, noeud);
			noeud.child.push(enfantCorrespondant);
		}
		
		if (sousListe.length > 1) {
			const reste = sousListe.slice(1);
			this.ajouterSousListe(enfantCorrespondant, reste, profondeur + 1, ++largeur, type);
		}
	}
	
	parcoursEnProfondeurListe() {
	    let noeud = this.racine;
		const liste = [];
		const stack = [];
		
		stack.push(noeud);
		
		while (stack.length > 0) {
			const noeudCourant = stack.pop();
			liste.push(noeudCourant);
			
			for (let i = noeudCourant.child.length - 1; i >= 0; i--) {
				stack.push(noeudCourant.child[i]);
			}
		}
		
		return liste;
	}
	
	toString()
	{
		return this.racine.toString()
	}
	
	*traverserEnProfondeur() {
		let noeud = this.racine
		yield noeud;

		for (const enfant of noeud.child) {
			yield* this.traverserEnProfondeur(enfant);
		}
	}
	
	
	createIterator() {
		this.iterateur = this.traverserEnProfondeur();
	}
	
	hasNext() {
		if (!this.iterateur) {
			return false;
		}
		let iterateur2 = Object.assign({}, this.iterateur, { next: () => prochain });
		return true;
		const prochain = this.iterateur.next();
		if (!prochain.done) {
			this.iterateur = iterateur2;
			return true;
		}
		
		return false;
	}
	
	next() {
		if (!this.iterateur) {
			this.createIterator();
		}
		
		const prochain = this.iterateur.next();
		return prochain.value//.valeur;
	}
	
	/**
	 * is n1 back from n2 ? and how much
	 * @param n1
	 * @param n2
	 * @returns {int} 0 false
	 */
	static isBack(n1, n2)
	{
		if(n1.profondeur <= n2.profondeur)
		{
			return n2.profondeur - n1.profondeur + 1
		}
		else
		{
			return 0;
		}
	}
}



export { Noeud, Tree };
export default { Noeud, Tree };