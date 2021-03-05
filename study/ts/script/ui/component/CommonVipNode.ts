import { Colors } from "../../init";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonVipNode extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_vip: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_vip_1: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_vip_2: cc.Label = null;

    ctor() {
        
    }
    // onLoad(){
    //     this._text_vip_1.node.color = Colors.BRIGHT_BG_GREEN;
    //     this._text_vip_2.node.color = Colors.BRIGHT_BG_GREEN;
    // }
    setString(vip) {
        var num = parseInt(vip);
        if (num < 10) {
            this._text_vip_1.node.active = (true);
            this._text_vip_2.node.active = (false);
            this._text_vip_1.string = (num.toString());
        } else {
            this._text_vip_1.node.active = (true);
            this._text_vip_2.node.active = (true);
            this._text_vip_1.string = ((Math.floor(num / 10)).toString());
            this._text_vip_2.string = ((num % 10).toString());
        }
    }
    alignCenter() {
    }

}
