const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'
import { G_SceneManager, G_UserData, G_SignalManager, G_ResolutionManager } from '../../../init';
import TreasureConst from '../../../const/TreasureConst';
import { handler } from '../../../utils/handler';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Lang } from '../../../lang/Lang';
import ViewBase from '../../ViewBase';
import { SignalConst } from '../../../const/SignalConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import UIHelper from '../../../utils/UIHelper';
import CommonTreasureAvatar from '../../../ui/component/CommonTreasureAvatar';
import TreasureDetailBaseView from './TreasureDetailBaseView';

@ccclass
export default class TreasureDetailView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTreasureDetailView: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMid: cc.Node = null;

    @property({
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonReplace: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonUnload: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonLeft: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonRight: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property(cc.Prefab)
    commonTreasureAvatar: cc.Prefab = null;

    @property(cc.Prefab)
    detailBaseView: cc.Prefab = null;

    _rangeType;
    _allTreasureIds: any[];

    _signalTreasureRemoveSuccess;

    _selectedPos: number;
    _maxCount;

    _treasureData;

    _btnReplaceShowRP;

    ctor(treasureId, rangeType) {
        G_UserData.getTreasure().setCurTreasureId(treasureId);
        this._rangeType = rangeType || TreasureConst.TREASURE_RANGE_TYPE_1;
        this._allTreasureIds = [];
        UIHelper.addEventListener(this.node, this._buttonLeft, 'TreasureDetailView', '_onButtonLeftClicked');
        UIHelper.addEventListener(this.node, this._buttonRight, 'TreasureDetailView', '_onButtonRightClicked');
        UIHelper.addEventListener(this.node, this._buttonReplace._button, 'TreasureDetailView', '_onButtonReplaceClicked');
        UIHelper.addEventListener(this.node, this._buttonUnload._button, 'TreasureDetailView', '_onButtonUnloadClicked');
    }
    onCreate() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        var params = G_SceneManager.getViewArgs('treasureDetail');
        this.ctor(params[0], params[1]);
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_baowu');
        //this._pageView.setScrollDuration(0.3);
        //this._pageView.bounceDuration = 0.3;
        UIHelper.addPageEvent(this.node, this._pageView, 'TreasureDetailView', '_onPageViewEvent');
        this._buttonReplace.setString(Lang.get('treasure_detail_btn_replace'));
        this._buttonUnload.setString(Lang.get('treasure_detail_btn_unload'));
    }
    onEnter() {
        this._signalTreasureRemoveSuccess = G_SignalManager.add(SignalConst.EVENT_TREASURE_REMOVE_SUCCESS, handler(this, this._treasureRemoveSuccess));
        var treasureId = G_UserData.getTreasure().getCurTreasureId();
        if (this._rangeType == TreasureConst.TREASURE_RANGE_TYPE_1) {
            this._allTreasureIds = G_UserData.getTreasure().getRangeDataBySort();
        } else if (this._rangeType == TreasureConst.TREASURE_RANGE_TYPE_2) {
            var unit = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
            var pos = unit.getPos();
            if (pos) {
                this._allTreasureIds = G_UserData.getBattleResource().getTreasureIdsWithPos(pos);
            }
        }
        this._selectedPos = 1;
        var curTreasureId = G_UserData.getTreasure().getCurTreasureId();
        for (var i = 0; i < this._allTreasureIds.length; i++) {
            var id = this._allTreasureIds[i];
            if (id == curTreasureId) {
                this._selectedPos = i + 1;
            }
        }
        this._maxCount = this._allTreasureIds.length;
        this._updatePageView();
        this._updateArrowBtn();
        this._updateInfo();
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        }, 0);
    }
    onExit() {
        this._signalTreasureRemoveSuccess.remove();
        this._signalTreasureRemoveSuccess = null;
    }
    _createPageItem(width, height, i) {
        var treasureId = this._allTreasureIds[i - 1];
        var unitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        var baseId = unitData.getBase_id();
        var widget = new cc.Node();
        widget.setContentSize(width, height);
        var avatar = cc.instantiate(this.commonTreasureAvatar).getComponent(CommonTreasureAvatar);
        avatar.showShadow(false);
        avatar.updateUI(baseId);
        widget.addChild(avatar.node);
        return widget;
    }
    _updatePageView() {
        this._pageView.removeAllPages();
        var viewSize = this._pageView.node.getContentSize();
        this._pageView.content.setContentSize(viewSize.width * this._maxCount, viewSize.height);
        for (var i = 1; i <= this._maxCount; i++) {
            var item = this._createPageItem(viewSize.width, viewSize.height, i);
            this._pageView.addPage(item);
        }
        this._pageView.scrollToPage(this._selectedPos - 1, 0);

    }
    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._maxCount);
    }
    _updateInfo() {
        var treasureId = G_UserData.getTreasure().getCurTreasureId();
        this._treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        this._buttonReplace.setVisible(this._treasureData.isInBattle());
        this._buttonUnload.setVisible(this._treasureData.isInBattle());
        this._nodeTreasureDetailView.removeAllChildren();
        var treasureDetail = cc.instantiate(this.detailBaseView).getComponent(TreasureDetailBaseView);
        treasureDetail.ctor(this._treasureData, this._rangeType);
        this._nodeTreasureDetailView.addChild(treasureDetail.node);
        this._checkRedPoint();
    }
    _onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curTreasureId = this._allTreasureIds[this._selectedPos - 1];
        G_UserData.getTreasure().setCurTreasureId(curTreasureId);
        this._updateArrowBtn();
        this._pageView.scrollToPage(this._selectedPos - 1, 0);
        this._updateInfo();
    }
    _onButtonRightClicked() {
        if (this._selectedPos >= this._maxCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curTreasureId = this._allTreasureIds[this._selectedPos - 1];
        G_UserData.getTreasure().setCurTreasureId(curTreasureId);
        this._updateArrowBtn();
        this._pageView.scrollToPage(this._selectedPos - 1, 0);
        this._updateInfo();
    }
    _onButtonReplaceClicked() {
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        if (scene.getName() == 'team') {
            var view = scene.getSceneView();
            view.setNeedPopupTreasureReplace(this._btnReplaceShowRP);
        }
    }
    _onButtonUnloadClicked() {
        var pos = this._treasureData.getPos();
        var slot = this._treasureData.getSlot();
        G_UserData.getTreasure().c2sRemoveTreasure(pos, slot);
    }
    _treasureRemoveSuccess(eventName, slot) {
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        if (scene.getName() == 'team') {
            var view = scene.getSceneView();
            view.setNeedTreasureRemovePrompt(true);
        }
    }
    _checkRedPoint() {
        var pos = this._treasureData.getPos();
        var slot = this._treasureData.getSlot();
        var param = {
            pos: pos,
            slot: slot
        };
        var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, 'slotRP', param);
        this._buttonReplace.showRedPoint(reach);
        this._btnReplaceShowRP = reach;
    }
    _onPageViewEvent(sender, event, customEventData) {
        if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            if (targetPos != this._selectedPos) {
                this._selectedPos = targetPos;
                var curTreasureId = this._allTreasureIds[this._selectedPos - 1];
                G_UserData.getTreasure().setCurTreasureId(curTreasureId);
                this._updateArrowBtn();
                this._updateInfo();
            }
        }
    }
}
