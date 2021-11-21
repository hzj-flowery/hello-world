import { Texture } from "../texture/Texture";

/**
 * 材质
 */
export class Material {
    public bumpMap:Texture;
    public bumpScale:number;

    public normalMap:Texture;
    public normalMapScale:number;
    constructor(){
        this.bumpMap = null;
        this.bumpScale = 1;

        this.normalMap = null;
        this.normalMapScale = 1;
    }
   
}