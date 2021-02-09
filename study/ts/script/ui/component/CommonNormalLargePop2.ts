import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonNormalLargePop2 extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_bg_all: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_2: cc.Sprite = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _button_close: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTitleDi: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_title: cc.Label = null;

   _closeCallBack:any;

    _moveNodeZorder (node) {
        if (!node) {
            return;
        }
        var container = this.node.getParent();
        node.retain();
        var worldPos = node.convertToWorldSpaceAR( cc.v2(0, 0));
        var btnNewPos = container.convertToNodeSpace( cc.v2(worldPos));
        node.removeFromParent();
        container.addChild(node);
        node.setPosition(btnNewPos);
        node.release();
    }
    addCloseEventListener (callback) {
        if (this._button_close) {
            this._button_close.node.active = (true);
            UIHelper.addEventListener(this.node, this._button_close, 'CommonNormalLargePop2', 'onBtnClose');
            this._closeCallBack = callback;
        }
    }
    setTitle (name) {
        this._text_title.fontSize = 28;
        this._text_title.string = (name);
    }
    setCloseVisible (bShow) {
        if (this._button_close) {
            this._button_close.node.active = (bShow);
        }
    }
    moveTitleToTop () {
        this._moveNodeZorder(this._imageTitleDi);
    }
    onBtnClose(){
        if(this._closeCallBack){
            this._closeCallBack();
        }
    }
}
