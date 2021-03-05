import { G_Prompt } from "../../../init";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ViewBase from "../../ViewBase";
import PopupRecoveryPreview from "./PopupRecoveryPreview";
import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RecoveryRebornLayerBase extends ViewBase {

    @property({ type: cc.Label, visible: true })
    _textTip: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;

    protected _recoveryRebornNodes: RecoveryRebornNodeBase[];
    protected _recoveryRebornList: any[];

    protected _type: number;
    protected _popupCheckName: string;
    protected _popupCheckFromType: number;

    protected onCreate() {
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            this._recoveryRebornNodes[i].init(i, handler(this, this._onClickAdd), handler(this, this._onClickDelete));
        }
    }

    protected onEnter() {
        this._recoveryRebornList = [];
        this._updateView();
    }

    protected onExit() {
    }

    public updateScene(sceneId) {
        this.updateSceneId(sceneId);
        this.node.setAnchorPoint(0.5, 0.5);
        this.node.setPosition(0, 0);
    }

    protected _initInfo(type: number, popupCheckName: string, popupCheckFromType: number, tips: string) {
        this._type = type;
        this._popupCheckName = popupCheckName;
        this._popupCheckFromType = popupCheckFromType;
        this._textTip.string = tips;
    }

    protected _resetNode() {
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            this._recoveryRebornNodes[i].reset();
        }
        this._recoveryRebornList = [];
        this._updateView();
    }

    protected _updateView() {

    }

    protected _getDataWithIndex(index) {
        return this._recoveryRebornList[index];
    }

    protected _checkIsAdded(data) {
        if (data == null) {
            return false;
        }
        for (const k in this._recoveryRebornList) {
            if (this._recoveryRebornList[k] == data) {
                return true;
            }
        }
        return false;
    }

    protected _onClickAdd() {
    }

    protected _onClickDelete(index) {
        this._recoveryRebornList[index] = null;
    }

    protected _showRecoveryRebornPreview(tips: string) {
        var count = this._getDataCount();
        if (count <= 0) {
            G_Prompt.showTip(tips);
            return;
        }
        let data = [];
        for (let i = 0; i < this._recoveryRebornList.length; i++) {
            if (this._recoveryRebornList[i] != null) {
                data.push(this._recoveryRebornList[i]);
            }
        }
        cc.resources.load(Path.getPrefab("PopupRecoveryPreview", "recovery"), cc.Prefab, function (err, res) {
            if (err != null || res == null) {
                return;
            }
            var popupRecoveryPreview = cc.instantiate(res).getComponent(PopupRecoveryPreview);
            popupRecoveryPreview.init(data, this._type, handler(this, this._doRecoveryReborn));
            popupRecoveryPreview.openWithAction();
        }.bind(this));
    }

    protected _showPopupGetReward(awards) {
        PopupGetRewards.showRewards(awards);
    }

    protected _doRecoveryReborn() {

    }

    public insertItem(data) {
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            if (this._getDataWithIndex(i) == null) {
                this._recoveryRebornList[i] = data;
                return;
            }
        }
    }

    public deleteItem(data) {
        for (const k in this._recoveryRebornList) {
            if (this._recoveryRebornList[k] == data) {
                this._recoveryRebornList[k] = null;
                break;
            }
        }
    }

    protected _getDataCount(): number {
        let count: number = 0;
        for (const key in this._recoveryRebornList) {
            if (this._recoveryRebornList[key] != null) {
                count++;
            }
        }
        return count;
    }
}