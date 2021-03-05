import ViewBase from "../../ViewBase";
import { Path } from "../../../utils/Path";
import { G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChapterMapCell extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMapBG: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    private _index: number;

    public setMapIndex(index: number) {
        this._index = index;
        this.node.name = "chaptermap" + this._index;
    }

    public onCreate() {
        let size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        UIHelper.loadTexture(this._imageMapBG, Path.getChapterBG(this._index));

        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, "moving_fudaomap" + this._index);
    } 

    protected onEnter() {

    }

    protected onExit() {

    }
}