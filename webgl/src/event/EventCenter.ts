/**
 * 事件处理中心
 */
class EventCell{
    id:number;
    func:Function
}
export default class EventCenter{
    constructor(){

    }
    private cells:Array<EventCell>;
    registerEvent(func:Function):void{

    }
}