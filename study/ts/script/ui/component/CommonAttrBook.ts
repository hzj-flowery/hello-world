const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonAttrBook extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textValue: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

}