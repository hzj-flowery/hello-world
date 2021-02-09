import { G_UserData } from "../../../init";
import { MineCraftData } from "../../../data/MineCraftData";
import { Path } from "../../../utils/Path";
import CommonUI from "../../../ui/component/CommonUI";
import ViewBase from "../../ViewBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MineGetMoneyIcon extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageGetMoney: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCount: cc.Label = null;

   private _progressRing:cc.ProgressBar;

//    ctor() {
//     this._progressRing = null;
//     var resource = {
//         file: Path.getCSB('MineGetMoneyIcon', 'mineCraft'),
//         binding: {
//             _imageGetMoney: {
//                 events: [{
//                         event: 'touch',
//                         method: '_onGetMoneyClick'
//                     }]
//             }
//         }
//     };
// }
onLoad() {
    var action1 = cc.moveBy(0.5, new cc.Vec2(0, 15));
    var action2 = cc.moveBy(0.5, new cc.Vec2(0, -15));
    var action = cc.sequence(action1, action2);
    var repeatAct = cc.repeatForever(action);
    this.node.runAction(repeatAct);
    this._createProgress();
}
updateUI(moneyCount) {
    this._textCount.string = (moneyCount);
}
updateTimer(percent) {
    if (percent >= 100) {
        return;
    }
    if (!this._progressRing) {
        return;
    }
    this._progressRing.progress = (percent);
}
private onGetMoneyClick() {
    G_UserData.getMineCraftData().c2sGetMineMoney();
}
_createProgress() {
    var pic = Path.getMineImage('img_mine_shouhuo03');
    var node = new cc.Node();
    this._progressRing = node.addComponent(cc.ProgressBar);
    var node1 = new cc.Node();
    var sp = node1.addComponent(cc.Sprite);
    sp.node.addComponent(CommonUI).loadTexture(pic);
    this._progressRing.barSprite = sp;
    this._imageGetMoney.node.addChild(this._progressRing.node);
    var imgSize = this._imageGetMoney.node.getContentSize();
    this._progressRing.node.setPosition(new cc.Vec2(imgSize.width / 2, imgSize.height / 2));
}

}