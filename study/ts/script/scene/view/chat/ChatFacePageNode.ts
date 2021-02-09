import UIHelper from "../../../utils/UIHelper";
import { table } from "../../../utils/table";
import { G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { Path } from "../../../utils/Path";

const {ccclass, property} = cc._decorator;


@ccclass
export default class ChatFacePageNode extends cc.Component{

    static FACE_INTERVAL_ST_X = 23;
    static FACE_INTERVAL_ST_Y = 214;
    static FACE_INTERVAL_W = 51;
    static FACE_INTERVAL_H = 48;
    static COL_NUM = 11;
    static ROW_NUM = 5;
    static FACE_NUM = ChatFacePageNode.COL_NUM * ChatFacePageNode.ROW_NUM;

    _faceImageList: any[];

    ctor(pageView:cc.Node) {
        this._faceImageList = [];
        var size = pageView.getContentSize();
        this.node.setContentSize(size);
        this.node.setAnchorPoint(0,0);
        for (var row = 1; row<=ChatFacePageNode.ROW_NUM; row++) {
            for (var col = 1; col<=ChatFacePageNode.COL_NUM; col++) {
                var root = new cc.Node();
                root.addComponent(cc.Sprite);
                var imageView = root.addComponent(cc.Button);
                imageView.node.setContentSize(64,64);
                //imageView.node.setAnchorPoint(0,0);
                imageView.node.setPosition(ChatFacePageNode.FACE_INTERVAL_ST_X + (col - 1) * ChatFacePageNode.FACE_INTERVAL_W, ChatFacePageNode.FACE_INTERVAL_ST_Y - (row - 1) * ChatFacePageNode.FACE_INTERVAL_H);
                UIHelper.addEventListener(this.node, imageView, 'ChatFacePageNode', '_onTouchCallBack');
                //imageView.setSwallowTouches(false);
                //imageView.setTouchEnabled(true);
                this.node.addChild(imageView.node);
                table.insert(this._faceImageList, imageView);
            }
        }
    }
    _onTouchCallBack(event, state) {
        let sender = (event as cc.Event).target as cc.Node;
        var faceId = parseInt(sender.name);
         G_SignalManager.dispatch(SignalConst.EVENT_CHAT_SELECTE_FACE, faceId);

    }
    updateUI(faceList, pageIndex) {
        var startIndex = (pageIndex - 1) * ChatFacePageNode.FACE_NUM + 1;
        for (let k=1; k <= this._faceImageList.length; k++) {
            var v = this._faceImageList[k-1];
            var index = startIndex + k - 1;
            if (faceList[index-1]) {
                v.node.active = (true);
                UIHelper.loadBtnTextureFromAtlas(v, Path.getChatFaceMiniRes(faceList[index-1]));
                v.node.name = (index).toString();
            } else {
                v.node.active = (false);
            }
        }
    }
    onEnter() {
    }
    onExit() {
    }
}
