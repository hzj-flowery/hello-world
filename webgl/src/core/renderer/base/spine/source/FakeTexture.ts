import { Texture } from "./Texture"
export class FakeTexture extends Texture{

        
        constructor(){
            return _super !== null && _super.apply(this, arguments) || this;
        }
        public setFilters(minFilter, magFilter) { };
        public setWraps(uWrap, vWrap) { };
        public dispose() { };
       
    }
