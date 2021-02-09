import { HistoryHeroConst } from "../../../const/HistoryHeroConst";
import { SignalConst } from "../../../const/SignalConst";
import TeamConst from "../../../const/TeamConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { G_UserData, G_SignalManager, G_ResolutionManager, G_Prompt, G_EffectGfxMgr } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonPowerPrompt from "../../../ui/component/CommonPowerPrompt";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import { HistoryHeroDataHelper } from "../../../utils/data/HistoryHeroDataHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { rawget } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import ViewBase from "../../ViewBase";
import HistoryHeroAvatarItemCell from "./HistoryHeroAvatarItemCell";
import HistoryHeroBookView from "./HistoryHeroBookView";
import HistoryHeroPosItemCell from "./HistoryHeroPosItemCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HistoryHeroView extends ViewBase {
    @property({ type: cc.Sprite, visible: true })
    _imageBack: cc.Sprite = null;
    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;
    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeBookView: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeTrainRight: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _squadPanel: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _listItemSource: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _panelTop: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _panelCenter: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _panelPick: cc.Node = null;
    @property({
        type: CommonPowerPrompt,
        visible: true
    })
    _fileNodePower: CommonPowerPrompt = null;

    _isHideBook: boolean;
    _isHideDetail: boolean;
    _baseId: any;
    _heroList: {};
    _historyFormation: {};
    _curGalleryIndex: number;
    _squadIndex: number;
    _slotList: {};
    _lastTotalPower: number;
    _diffPower: number;
    _starFormationUpdate: any;
    _trainRightPositionX: any;
    _imageBackX: number;
    _nodeEffect: any;
    _showSquadNums: any;

    ctor(baseId) {
        this._initMemberVar(baseId);
    }
    _initMemberVar(baseId) {
        this._isHideBook = true;
        this._isHideDetail = true;
        this._baseId = baseId;
        this._heroList = {};
        this._historyFormation = {};
        this._curGalleryIndex = 1;
        this._squadIndex = 1;
        this._slotList = {};
        this._lastTotalPower = 0;
        this._diffPower = 0;
    }
    onCreate() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_HISTORY_HERO);
        this._initMainIcon();
        this._initBaseView();
        this._initStarListView();
        this._initSquadView();
        G_UserData.getHistoryHero().getSystemIds();
    }
    onEnter() {
        this._starFormationUpdate = G_SignalManager.add(SignalConst.EVENT_HISTORY_HERO_FORMATIONUPDATE, handler(this, this._onStarFormationUpdate));
        this._heroList = G_UserData.getHistoryHero().getHeroList();
        this._historyFormation = G_UserData.getHistoryHero().getHistoryHeroIds();
        this._updateStarListView();
        this._updateStrengthView();
    }
    onExit() {
        if (this._starFormationUpdate) {
            this._starFormationUpdate.remove();
            this._starFormationUpdate = null;
        }
        if (this._baseId != null) {
            this._baseId = null;
        }
        G_UserData.getHistoryHero().setDetailTabType(1);
    }
    _initMainIcon() {
    }
    _onButtonClick(sender) {
        var funcId = sender.getTag();
        if (funcId > 0) {
            WayFuncDataHelper.gotoModuleByFuncId(funcId);
        }
    }
    _updateStrengthView() {
        if (this._baseId != null) {
            this._detailShowHideAnimation();
        }
    }
    _bookSHowHideAnimation() {
        var position = this._isHideBook ? cc.v2(0, 0) : cc.v2(G_ResolutionManager.getDesignSize()[1] * -1.5, 0);
        var moveAction = cc.moveTo(0.3, position);
        var callAction = cc.callFunc(() => {
            this._isHideBook = !this._isHideBook;
        });
        var action = cc.sequence(cc.delayTime(0.05), moveAction, callAction);
        this._nodeBookView.runAction(action);
    }
    _detailShowHideAnimation() {
        function updateFade(rootNode, bFadeIn) {
            var callAction = cc.callFunc(function () {
            });
            var action = bFadeIn ? cc.fadeIn(0.2) : cc.fadeOut(0.2);
            var runningAction = cc.sequence(cc.delayTime(0.05), action, callAction);
            rootNode.setOpacity(bFadeIn && 0 || 255);
            rootNode.runAction(runningAction);
        }
        var position = this._isHideDetail ? cc.v2(this._trainRightPositionX - HistoryHeroConst.EQUIPVIEW_OFFSETWIDTH, 0) : cc.v2(this._trainRightPositionX, 0);
        var moveAction = cc.moveTo(0.3, position);
        var callAction = cc.callFunc(() => {
            updateFade(this._panelTop, !this._isHideDetail);
            updateFade(this._panelCenter, !this._isHideDetail);
            updateFade(this._panelPick, !this._isHideDetail);
            this._panelCenter.active = (!this._isHideDetail);
            this._squadPanel.active = (!this._isHideDetail);
            this._isHideDetail = !this._isHideDetail;
        });
        var action = this._isHideDetail && cc.sequence(cc.delayTime(0.05), callAction, moveAction) || cc.sequence(cc.delayTime(0.05), moveAction, callAction);
        this._backgroundAnimation();
        this._nodeTrainRight.runAction(action);
        this['_historyDetailView'].switchHistoryMainView(!this._isHideDetail);
        this['_historyDetailView'].updateLanternName(!this._isHideDetail);
        if (this._baseId != null) {
            var idx = G_UserData.getHistoryHero().getHisoricalHeroKeyById(this._baseId);
            if (idx >= 0) {
                this['_historyDetailView'].strengthAvatarIdx(idx);
            }
        }
    }
    _backgroundAnimation() {
        var position = this._isHideDetail && cc.v2(this._imageBackX - 130, this._imageBack.node.y) || cc.v2(this._imageBackX, this._imageBack.node.y);
        var moveAction = cc.moveTo(0.3, position);
        var callAction = cc.callFunc(function () {
        });
        var action = cc.sequence(cc.delayTime(0.05), moveAction, callAction);
        this._imageBack.node.runAction(action);
    }
    _initBaseView() {
        this._topbarBase.setImageTitle('txt_sys_com_wangzhezhizhan');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_HISTORY_HERO);
        this._topbarBase.hideBG();
        this['_bookView'] = new HistoryHeroBookView();
        this._nodeBookView.removeAllChildren();
        this._nodeBookView.addChild(this['_bookView']);
        this._nodeBookView.x = (G_ResolutionManager.getDesignSize()[1] * -1.5);
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_lidaimingjiangui_beijingtihuan');
    }
    _initStarListView() {
        cc.bind(this._listItemSource, 'CommonGalleryView');
        this._listItemSource.setTemplate(HistoryHeroAvatarItemCell);
        this._listItemSource.setCallback(handler(this, this._onStarUpdate), handler(this, this._onStarSelected));
        this._listItemSource.setCustomCallback(handler(this, this._onStarTouch));
        this._listItemSource.setCurgalleryCallback(handler(this, this._onChangeItemGallery));
    }
    _initSquadView() {
        this._showSquadNums = HistoryHeroDataHelper.getHistoryHeroPosShowNum();
        if (this._showSquadNums <= 0) {
            return;
        }
        var [slotList, unlockCount] = HistoryHeroDataHelper.getHistoricalHeroSlotList();
        this._slotList = slotList;
        this._showSquadNums = Math.min(unlockCount + 1, HistoryHeroDataHelper.MAX_SLOT_COUNT);
        var intervalGap = (this._squadPanel.getContentSize().width - HistoryHeroConst.SQUADITEM_WIDTH * this._showSquadNums) / 2 + HistoryHeroConst.SQUADITEM_WIDTH;
        var squadWidth = this._squadPanel.getContentSize().width, squadHeight = this._squadPanel.getContentSize().height;
        if (this._showSquadNums % 2 == 1) {
            var posList = [
                cc.v2(squadWidth * 0.5 - intervalGap, squadHeight * 0.5 - 20),
                cc.v2(squadWidth * 0.5, squadHeight * 0.5),
                cc.v2(squadWidth * 0.5 + intervalGap, squadHeight * 0.5 - 20)
            ];
            for (var index = 1; index != this._showSquadNums; index++) {
                this['squadView' + index] = new HistoryHeroPosItemCell(index, handler(this, this._onClickSquad));
                this['squadView' + index].setVisible(true);
                this['squadView' + index].setPosition(posList[index]);
                this['squadView' + index].updateSelectedVisible(slotList[index].isOpen);
                this['squadView' + index].updateUnlockLevel(slotList[index]['info'].level);
                this._squadPanel.addChild(this['squadView' + index]);
            }
        } else {
            var posList = [
                cc.v2(squadWidth * 0.5 - intervalGap * 1.7, squadHeight * 0.5 - 20),
                cc.v2(squadWidth * 0.5 - intervalGap * 0.6, squadHeight * 0.5),
                cc.v2(squadWidth * 0.5 + intervalGap * 0.6, squadHeight * 0.5),
                cc.v2(squadWidth * 0.5 + intervalGap * 1.7, squadHeight * 0.5 - 20)
            ];
            for (var index = 1; index != this._showSquadNums; index++) {
                this['squadView' + index] = new HistoryHeroPosItemCell(index, handler(this, this._onClickSquad));
                this['squadView' + index].setVisible(true);
                this['squadView' + index].setPosition(posList[index]);
                this['squadView' + index].updateSelectedVisible(slotList[index].isOpen);
                this['squadView' + index].updateUnlockLevel(slotList[index]['info'].level);
                this._squadPanel.addChild(this['squadView' + index]);
            }
        }
        this['squadView1'].updateSelectedVisible(true);
    }
    _onClickSquad(data) {
        if (this._heroList == null) {  //|| next(this._heroList) == null
            G_Prompt.showTip(Lang.get('historyhero_hero_nil'));
            return;
        }
        if (this._heroList[1] && this._heroList[1].getId() == 0) {
            G_Prompt.showTip(Lang.get('historyhero_hero_nil'));
            return;
        }
        if (rawget(data, 'heroId') != null) {
            this._listItemSource.setLocation(this._listItemSource.getItemPosition(data.index), 350);
        }
        for (var index = 1; index != this._showSquadNums; index++) {
            this['squadView' + index].updateSelectedVisible(index == data.index);
        }
        this._squadIndex = data.index;
    }
    _onClickReplace(data) {
        if (this._heroList == null) { //|| next(this._heroList) == null
            G_Prompt.showTip(Lang.get('historyhero_hero_nil'));
            return;
        }
        if (this._heroList[data.index] && this._heroList[data.index].getId() == 0) {
            G_Prompt.showTip(Lang.get('historyhero_hero_nil'));
            return;
        }
        this._squadIndex = data.index;
        function okCallback(id) {
            G_UserData.getHistoryHero().c2sStarEquip(id, this._squadIndex - 1);
        }
        if (data.state == TeamConst.STATE_LOCK) {
        } else {
            if (typeof (data.heroId) == 'number') {
                var curHistoryHeroData = G_UserData.getHistoryHero().getHisoricalHeroValueById(this._historyFormation[data.index]);
                var PopupChooseHistoricalItemView = new (require('PopupChooseHistoricalItemView'))(HistoryHeroConst.TAB_TYPE_HERO, curHistoryHeroData, okCallback);
                PopupChooseHistoricalItemView.open();
            }
        }
    }
    _onStarUpdate(item, itemIndex) {
        if (this._historyFormation == null || table.nums(this._historyFormation) <= 0) {
            return;
        }
        var curIndex = itemIndex + 1;
        if (this._historyFormation[curIndex] == null) {
            return;
        }
        var data = {
            cfg: this._historyFormation[curIndex] > 0 && G_UserData.getHistoryHero().getHisoricalHeroValueById(this._historyFormation[curIndex]) || null,
            index: curIndex,
            isLock: HistoryHeroDataHelper.getHistoryHeroStateWithPos(curIndex) == TeamConst.STATE_LOCK,
            unlockLevel: this._slotList[this._showSquadNums]['info'].level,
            isGallery: this._curGalleryIndex == curIndex
        };
        item.updateUI(data);
    }
    _onStarSelected(item, itemIndex) {
    }
    _onStarFormationUpdate(id, message) {
        if (message == null || rawget(message, 'id') == null) {
            for (var index = 1; index != this._showSquadNums; index++) {
                this['squadView' + index].updateUI(index);
            }
            return;
        }
        for (var index = 1; index != this._showSquadNums; index++) {
            this['squadView' + index].updateUI(index);
        }
        for (var k in message.id) {
            var v = message.id[k];
            var item = this._listItemSource.getItemByTag(k - 1);
            if (item != null) {
                var data = {
                    cfg: G_UserData.getHistoryHero().getHisoricalHeroValueById(v),
                    index: k,
                    isLock: HistoryHeroDataHelper.getHistoryHeroStateWithPos(k) == TeamConst.STATE_LOCK,
                    unlockLevel: this._slotList[this._showSquadNums]['info'].level,
                    isGallery: this._curGalleryIndex == k
                };
                item.updateUI(data);
            }
        }
        this._historyFormation = G_UserData.getHistoryHero().getHistoryHeroIds();
        var totalPower = G_UserData.getBase().getPower();
        this._fileNodePower.node.active = (true);
        this._fileNodePower.updateUI(totalPower, totalPower - this._lastTotalPower);
        this._fileNodePower.play(0, 0);
    }
    _onStarTouch(index, data) {
        this._recordTotalPower();
        if (data == null) {
            return;
        }
        if (rawget(data, 'isReplace') == true) {
            this._onClickReplace(data);
            return;
        }
        if (rawget(data, 'id') == null) {
            this._onClickSquad(data);
            return;
        }
        this._baseId = data.id;
    }
    _onChangeItemGallery(slot) {
        if (slot == null || this._curGalleryIndex == slot) {
            return;
        }
        this._curGalleryIndex = slot;
        for (var index = 1; index != table.nums(this._heroList); index++) {
            var tag = index - 1;
            var item = this._listItemSource.getItemByTag(tag);
            if (item != null) {
                item.updateNameVisible(index == slot);
            }
        }
        var item = this._listItemSource.getItemByTag(slot - 1);
        if (item != null) {
            var cellData = item.getCurCellData();
            if (cellData != null) {  //&& next(cellData) != null
                var [bSquad, idx] = G_UserData.getHistoryHero().isStarEquiped(cellData.id);
                if (bSquad) {
                    for (var i = 1; i != this._showSquadNums; i++) {
                        this['squadView' + i].updateSelectedVisible(i == idx);
                    }
                } else {
                    for (var i = 1; i != this._showSquadNums; i++) {
                        this['squadView' + i].updateSelectedVisible(i == slot);
                    }
                }
            }
        }
    }
    _updateStarListView() {
        this._historyFormation = G_UserData.getHistoryHero().getHistoryHeroIds();
        this._listItemSource.clearAll();
        this._listItemSource.resize(this._showSquadNums);
    }
    _recordTotalPower() {
        var totalPower = G_UserData.getBase().getPower();
        this._diffPower = totalPower - this._lastTotalPower;
        this._lastTotalPower = totalPower;
    }
}