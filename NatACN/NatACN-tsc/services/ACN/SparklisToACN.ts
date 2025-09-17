import {Sparklis, SparklisPlace} from "./SparklisTypes";
import {ACNPlace} from "./SparklisToACNTypes";
import {sleep} from "../../src/Utils/Utils.js";

// @ts-ignore
declare const sparklis: Sparklis;

export class SparklisSerialisation{

    async init(): Promise<void>{
        let sparklis_exists = false;

        // Attendre que la variable soit créée
        while (!sparklis_exists)
        {
            await sleep(250);
            console.log("nope");
            sparklis_exists = this._sparklisExists();
        }

        // Attendre que la place initiale ait chargé
        while (sparklis.currentPlace().hasPartialResults())
        {
            await sleep(250);
            console.log("nope !");
            sparklis_exists = this._sparklisExists();
        }

        console.log("Sparklis activé");
    }

    async asyncComportement(): Promise<void>{
        await new Promise(async resolve=>{
            await sparklis.currentPlace().onEvaluated(()=>resolve(sparklis.currentPlace().results()));});
    }

    async render(place: ACNPlace):Promise<void>{
        await this.asyncComportement();
        sparklis.setCurrentPlace(place as SparklisPlace)
    }

    endpoint():string{
        return sparklis.endpoint();
    }

    async getPlace(): Promise<ACNPlace>{
        return sparklis.currentPlace()
    }
    private _sparklisExists():boolean
    {
        return typeof sparklis !== "undefined";
    }

    async setEndpoint(uri):Promise<void>{
        sparklis.changeEndpoint(uri);
        await this.asyncComportement();
    }


}