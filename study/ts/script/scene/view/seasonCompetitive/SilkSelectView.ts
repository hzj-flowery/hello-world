import { G_ResolutionManager, G_SceneManager, G_UserData } from "../../../init";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import ListView from "../recovery/ListView";
import SeasonSilkGroupIcon from "../seasonSilk/SeasonSilkGroupIcon";
import { SeasonSilkConst } from "../../../const/SeasonSilkConst";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SilkSelectView extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageView: cc.Sprite = null;

    @property({ type: ListView, visible: true })
    _scrollView: ListView = null;
    @property({ type: cc.Prefab, visible: true })
    _seasonSilkGroupIconPrefab: cc.Prefab = null;

    private _imageArrow;
    private _silkGroupInfo: any[];
    private _isListViewOut: any[];
    private _index;
    private _dstPosition;
    private _callBack;
    public init(index, dstPosition, callback) {
        this._imageArrow = null;
        this._silkGroupInfo = [];
        this._isListViewOut = [];
        this._index = index;
        this._dstPosition = dstPosition;
        this._callBack = callback;
    }

    public onCreate() {
        this._resource.setPosition(this._dstPosition);
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onClick));
        UIHelper.setSwallowTouches(this._panelTouch, false);
        for (var index = 0; index < 6; index++) {
            this._isListViewOut[index] = false;
        }
        this._initSilkGroupView();
    }

    public open() {
        var scene = G_SceneManager.getRunningScene();
        scene.addChildToPopup(this.node);
    }

    public close() {
        this.onClose();
        this.signal.dispatch('close');
        this.node.removeFromParent();
    }

    public onEnter() {
        this._silkGroupInfo = G_UserData.getSeasonSport().getSilkGroupInfo();
        this._updateSilkGroupView();
    }

    public onExit() {
    }

    private _onGroupItemUpdate(node: cc.Node, index) {
        if (this._silkGroupInfo.length <= 0) {
            return;
        }
        let item: SeasonSilkGroupIcon = node.getComponent(SeasonSilkGroupIcon);
        var data: any = {};
        var curIndex = index + 1;
        if (this._silkGroupInfo && this._silkGroupInfo[index]) {
            data.pos = curIndex;
            data.isSelected = false;
            data.state = SeasonSilkConst.SILK_GROUP_SATE_EQUIPPED;
            if (this._silkGroupInfo[index].name != '') {
                data.name = this._silkGroupInfo[index].name;
            } else {
                data.name = Lang.get('season_silk_group_initname2') + (curIndex);
            }
            item.setCustomCallback(handler(this, this._onGroupItemTouch));
            item.updateUI(data);
        }
    }

    private _onGroupItemSelected(item, index) {
    }

    private _onGroupItemTouch(data) {
        if (this._callBack) {
            this._callBack(this._index, data);
        }
        this.close();
    }

    private _initSilkGroupView() {
        this._scrollView.setTemplate(this._seasonSilkGroupIconPrefab);
        this._scrollView.setCallback(handler(this, this._onGroupItemUpdate));
    }

    private _updateSilkGroupView() {
        var maxGroup = this._silkGroupInfo.length;
        if (maxGroup <= 0) {
            return;
        }
        this._scrollView.resize(maxGroup);
    }

    private _onClick() {
        if (this._callBack) {
            this._callBack(this._index, null);
        }
        this.close();
    }
}