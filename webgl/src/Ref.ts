

class Component{

}

export default class Ref{
        constructor(){
            this._referenceCount = 1;
        }
        protected _referenceCount:number = 0;
        public addReferenceCount():void{
            this._referenceCount++;
        }
        public reduceReferenceCount():void{
            this._referenceCount--;
        }
}