import CommonNormalSmallPop from "./CommonNormalSmallPop";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonNormalSmallPop2 extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_bg_all: cc.Sprite = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _button_close: cc.Button = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_title: cc.Label = null;

   private _callBack:any;

onload(){
    this._text_title.fontSize -= 2;
    this._moveNodeZorder(this._button_close.node);
}
_moveNodeZorder(node:cc.Node) {
    if (!node) {
        return;
    }
    var container = this.node.getParent();
    var worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));
    var btnNewPos = container.convertToNodeSpace(cc.v2(worldPos));
    node.removeFromParent();
    container.addChild(node);
    node.setPosition(btnNewPos);
}
addCloseEventListener(callback) {
    this._callBack = callback;
    if (this._button_close) {
        this._button_close.node.active = (true);
        var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = "CommonNormalSmallPop2";// 这个是代码文件名
            clickEventHandler.handler = "_onTouchCallBack";
            this._button_close.clickEvents.push(clickEventHandler);
    }
}
private _onTouchCallBack(){
        if(this._callBack)
        this._callBack();
}
setTitle(name) {
    this._text_title.string = (name);
}
setCloseVisible(bShow) {
    if (this._button_close) {
        this._button_close.node.active = (bShow);
    }
}
moveTitleToTop() {
    this._moveNodeZorder(this._image_bg_all.node);
}


}