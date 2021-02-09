import ViewBase from "../../ViewBase";
import { handler } from "../../../utils/handler";
import { GuildCrossWarConst } from "../../../const/GuildCrossWarConst";
import { GuildCrossWarHelper } from "./GuildCrossWarHelper";
import { G_SceneManager } from "../../../init";
import PopupGuildCrossWarSmallMap from "./PopupGuildCrossWarSmallMap";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCrossWarMiniMap extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBk: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;
    _smallMapDlg: PopupGuildCrossWarSmallMap;
    _smallMapDlgSignal: any;


    onCreate() {
        this.node.name = "GuildCrossWarMiniMap";
        // this._panelBk.addClickEventListenerEx(handler(this, this._onClickButton));
    }
    onClickButton(sender) {
        if (this._smallMapDlg == null) {
            G_SceneManager.openPopup("prefab/guildCrossWar/PopupGuildCrossWarSmallMap",(popup:PopupGuildCrossWarSmallMap)=>{
                this._smallMapDlg = popup;
                this._smallMapDlgSignal = this._smallMapDlg.signal.addOnce(handler(this, this._onPopupSmallMapDlgClose));
                popup.open();
            })
        }
    }
    _onPopupSmallMapDlgClose(event) {
        if (event == 'close') {
            this._smallMapDlg = null;
            if (this._smallMapDlgSignal) {
                this._smallMapDlgSignal.remove();
                this._smallMapDlgSignal = null;
            }
        }
    }
    onEnter() {
    }
    onExit() {
    }
    convertToSmallMapPos(pos) {
        pos.x = pos.x * GuildCrossWarConst.CAMERA_SCALE_MIN;
        pos.y = pos.y * GuildCrossWarConst.CAMERA_SCALE_MIN;
        return pos;
    }
    updateCamera(cameraX, cameraY) {
        var innerContainer = this._scrollView.content;
        innerContainer.setPosition(cameraX, cameraY);
    }
    updateSelf(selfPosX, selfPosY) {
        GuildCrossWarHelper.updateSelfNode(this._scrollView, selfPosX, selfPosY);
        if (this._smallMapDlg) {
            this._smallMapDlg.updateSelf(selfPosX, selfPosY);
        }
    }
    updateSelfGuildNumber(users) {
        if (this._smallMapDlg) {
            this._smallMapDlg.updateSelfGuildNumber(users);
        }
    }

}