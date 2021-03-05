export default class CommonNodeTag extends cc.Component{
    private _tag:any;
    public set tag(tag:any){
         this._tag = tag;
    }
    public get tag(){
        return this._tag;
    }
}