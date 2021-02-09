import { G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";
import { Lang } from "../../../lang/Lang";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MineNewsNode extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageChannel: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textContent: cc.Label = null;

   
   public static RICH_TEXT_MAX_WIDTH = 220;

   //    ctor(data) {
//     this._data = data;
//     var resource = {
//         file: Path.getCSB('MineNewsNode', 'mineCraft'),
//         binding: {}
//     };
// }

private _data:any;

public setInitData(data:any):void{
       this._data = data;
}
onCreate() {
    var textHeight = this._updateUI();
    var size = this._resourceNode.getContentSize();
    var height = size.height;
    if (textHeight > height) {
        height = textHeight;
    }
    this.node.setContentSize(size.width, height);
    this._imageChannel.node.y = (height + 5);
}
onEnter() {
}
onExit() {
}
_updateUI() {
    
    var PaoMaDeng = G_ConfigLoader.getConfig(ConfigNameConst.PAOMADENG);
    var cfg = PaoMaDeng.get(this._data.getSn_type());
  //assert((cfg, 'paomadeng not find id ' + (this._data.getSn_type()));
    var strValues = {};
    for (var j in this._data.getContent()) {
        var v = this._data.getContent()[j];
        strValues[v.key] = v.value;
    }
    var str = Lang.getTxt(cfg.description, strValues);
    this._textContent.node.width = MineNewsNode.RICH_TEXT_MAX_WIDTH;
    this._textContent.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
    this._textContent.string = (str);
    this._textContent["_updateRenderData"](true);
    var textHeight = this._textContent.node.getContentSize().height;
    return textHeight;
}

}