



export default class Ref{
        constructor(){
            this._referenceCount = 1;
        }
        protected _referenceCount:number = 0;
        public retain():void{
            this._referenceCount++;
        }
        public reduceReference():void{
            this._referenceCount--;
        }
        
        onEnable():void{

        }
        protected onEnter():void{

        }
        protected onEixt():void{

        }
}