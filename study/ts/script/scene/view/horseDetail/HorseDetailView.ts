const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import { G_UserData, G_SceneManager, G_SignalManager } from '../../../init';
import HorseConst from '../../../const/HorseConst';
import { handler } from '../../../utils/handler';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Lang } from '../../../lang/Lang';
import { SignalConst } from '../../../const/SignalConst';
import CommonHorseAvatar from '../../../ui/component/CommonHorseAvatar';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import HorseDetailEquipNode from './HorseDetailEquipNode';
import HorseDetailBaseView from './HorseDetailBaseView';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { Path } from '../../../utils/Path';
import PopupChooseHorseEquip from '../../../ui/popup/PopupChooseHorseEquip';
import { PopupChooseHorseEquipHelper } from '../../../ui/popup/PopupChooseHorseEquipHelper';
import ViewBase from '../../ViewBase';

@ccclass
export default class HorseDetailView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _nodeDetailView: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelMid: cc.Node = null;

    @property({ type: cc.PageView, visible: true })
    _pageView: cc.PageView = null;

    @property({ type: CommonButtonLevel1Highlight, visible: true })
    _buttonUnload: CommonButtonLevel1Highlight = null;

    @property({ type: CommonButtonLevel1Normal, visible: true })
    _buttonReplace: CommonButtonLevel1Normal = null;

    @property({ type: cc.Node, visible: true })
    _nodeEquip: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _buttonLeft: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _buttonRight: cc.Button = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;

    @property({ type: cc.Prefab, visible: true })
    _commonHorseAvatarPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseDetailEquipNodePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseDetailBaseViewPrefab: cc.Prefab = null;

    private _canRefreshAttr;
    private _rangeType;
    private _allHorseIds;
    private _recordAttr;
    private _pageAvatars;

    private _signalHorseRemoveSuccess;
    private _selectedPos;
    private _maxCount;
    private _pageItems;
    private _horseData;
    private _btnReplaceShowRP;

    private _horseEquipItem: HorseDetailEquipNode;
    private _horseDetail: HorseDetailBaseView;

    onCreate() {
        this.setSceneSize();
        let [horseId, rangeType] = G_SceneManager.getViewArgs();
        G_UserData.getHorse().setCurHorseId(horseId);
        this._canRefreshAttr = true;
        this._rangeType = rangeType || HorseConst.HORSE_RANGE_TYPE_1;
        this._allHorseIds = [];
        this._recordAttr = G_UserData.getAttr().createRecordData(horseId);

        this._pageAvatars = [];
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_horse');

        this._buttonUnload.setString(Lang.get('horse_detail_btn_unload'));
        this._buttonReplace.setString(Lang.get('horse_detail_btn_replace'));
        this._buttonReplace.addClickEventListenerEx(handler(this, this._onButtonReplaceClicked));
        this._buttonUnload.addClickEventListenerEx(handler(this, this._onButtonUnloadClicked));
    }

    onEnter() {
        this._signalHorseRemoveSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_CLEAR_SUCCESS, handler(this, this._horseRemoveSuccess));
        var curHorseId = G_UserData.getHorse().getCurHorseId();
        if (this._rangeType == HorseConst.HORSE_RANGE_TYPE_1) {
            this._allHorseIds = G_UserData.getHorse().getRangeDataBySort();
        } else if (this._rangeType == HorseConst.HORSE_RANGE_TYPE_2) {
            var unit = G_UserData.getHorse().getUnitDataWithId(curHorseId);
            var pos = unit.getPos();
            if (pos) {
                this._allHorseIds = G_UserData.getBattleResource().getHorseIdsWithPos(pos);
            }
        }
        this._selectedPos = 0;
        for (let i in this._allHorseIds) {
            var id = this._allHorseIds[i];
            if (id == curHorseId) {
                this._selectedPos = parseInt(i) + 1;
            }
        }
        this._maxCount = this._allHorseIds.length;
        this._initPageView();
        this._updateArrowBtn();
        this._updateInfo();
    }

    onExit() {
        this._signalHorseRemoveSuccess.remove();
        this._signalHorseRemoveSuccess = null;
    }

    _initPageView() {
        this._pageItems = [];
        this._pageView.removeAllPages();
        var viewSize = this._pageView.node.getContentSize();
        this._pageView.content.setContentSize(viewSize.width * this._maxCount, viewSize.height);
        for (var i = 1; i <= this._maxCount; i++) {
            var widget = this._createPageItem(viewSize.width, viewSize.height);
            this._pageView.addPage(widget);
            this._pageItems.push(widget);
        }
        this._updatePageItem();
        // this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._pageView.scrollToPage(this._selectedPos - 1, 0);
    }

    _createPageItem(width, height): cc.Node {
        var widget = new cc.Node();
        widget.setContentSize(width, height);
        return widget;
    }

    _updatePageItem() {
        var index = this._selectedPos;
        for (var i = index - 1; i <= index + 1; i++) {
            var widget: cc.Node = this._pageItems[i - 1];
            if (widget) {
                var count = widget.childrenCount;
                if (count == 0) {
                    var horseId = this._allHorseIds[i - 1];
                    var unitData = G_UserData.getHorse().getUnitDataWithId(horseId);
                    var baseId = unitData.getBase_id();
                    var avatar = cc.instantiate(this._commonHorseAvatarPrefab).getComponent(CommonHorseAvatar);
                    avatar.updateUI(baseId);
                    avatar.showShadow(false);
                    avatar.showEffect(true);
                    // var size = widget.getContentSize();
                    avatar.node.setPosition(49, -120);
                    widget.addChild(avatar.node);
                }
            }
        }
    }

    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._maxCount);
    }

    _updateInfo() {
        var horseId = G_UserData.getHorse().getCurHorseId();
        this._horseData = G_UserData.getHorse().getUnitDataWithId(horseId);
        this._buttonUnload.setVisible(this._horseData.isInBattle());
        this._buttonReplace.setVisible(this._horseData.isInBattle());
        if (this._canRefreshAttr) {
            var attrInfo = HorseDataHelper.getHorseAttrInfo(this._horseData);
            this._recordAttr.updateData(attrInfo);
        }
        this._nodeEquip.removeAllChildren();
        this._horseEquipItem = cc.instantiate(this._horseDetailEquipNodePrefab).getComponent(HorseDetailEquipNode);
        this._nodeEquip.addChild(this._horseEquipItem.node);
        this._nodeDetailView.removeAllChildren();
        this._horseDetail = cc.instantiate(this._horseDetailBaseViewPrefab).getComponent(HorseDetailBaseView);
        this._horseDetail.ctor(this._horseData, this._rangeType, this._recordAttr, this._horseEquipItem);
        this._nodeDetailView.addChild(this._horseDetail.node);
        this._checkRedPoint();
        var avatar = this._pageAvatars[this._selectedPos - 1];
        if (avatar) {
            avatar.playAnimationOnce('win');
            HorseDataHelper.playVoiceWithId(this._horseData.getBase_id());
        }
    }

    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curHorseId = this._allHorseIds[this._selectedPos - 1];
        G_UserData.getHorse().setCurHorseId(curHorseId);
        this._updateArrowBtn();
        this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._updateInfo();
        this._updatePageItem();
    }

    onButtonRightClicked() {
        if (this._selectedPos >= this._maxCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curHorseId = this._allHorseIds[this._selectedPos - 1];
        G_UserData.getHorse().setCurHorseId(curHorseId);
        this._updateArrowBtn();
        this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._updateInfo();
        this._updatePageItem();
    }

    _onButtonReplaceClicked() {
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        if (scene.getName() == 'team') {
            var view = scene.getSceneView();
            view.setNeedPopupHorseReplace(this._btnReplaceShowRP);
        }
    }

    _onButtonUnloadClicked() {
        var pos = this._horseData.getPos();
        G_UserData.getHorse().c2sWarHorseUnFit(pos);
    }

    _horseRemoveSuccess(eventName, slot) {
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        if (scene.getName() == 'team') {
            var view = scene.getSceneView();
            view.setNeedHorseRemovePrompt(true);
        }
    }

    _checkRedPoint() {
        var pos = this._horseData.getPos();
        var slot = this._horseData.getSlot();
        if (pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var heroBaseId = heroUnitData.getBase_id();
            var param = {
                pos: pos,
                slot: slot,
                heroBaseId: heroBaseId,
                notCheckEquip: true
            };
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, 'slotRP', param);
            this._buttonReplace.showRedPoint(reach);
            this._btnReplaceShowRP = reach;
        }
    }

    onPageViewEvent(pageView, eventType, customEventData) {
        if (eventType == cc.PageView.EventType.PAGE_TURNING && pageView == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            if (targetPos != this._selectedPos) {
                this._selectedPos = targetPos;
                var curHorseId = this._allHorseIds[this._selectedPos - 1];
                G_UserData.getHorse().setCurHorseId(curHorseId);
                this._updateArrowBtn();
                this._updateInfo();
                this._updatePageItem();
            }
        }
    }

    popupHorseEquipReplace(equipPos) {
        var curHorseId = G_UserData.getHorse().getCurHorseId();
        var [totalList, noWearList] = G_UserData.getHorseEquipment().getReplaceEquipmentListWithSlot(equipPos, curHorseId);
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupChooseHorseEquip"), (popup: PopupChooseHorseEquip) => {
            var callBack = function (equipId) {
                var horseId = curHorseId;
                G_UserData.getHorseEquipment().c2sEquipWarHorseEquipment(horseId, equipPos, equipId);
            };
            popup.setTitle(Lang.get('horse_equip_wear_title'));
            popup.updateUI(PopupChooseHorseEquipHelper.FROM_TYPE2, callBack, totalList, null, noWearList, equipPos);
            popup.openWithAction();
        });
    }

    updateHorseEquipDifPrompt() {
        this._canRefreshAttr = false;
        var actions = [];
        actions.push(cc.delayTime(0.2));
        actions.push(cc.callFunc(() => {
            this._canRefreshAttr = true;
            var attrInfo = HorseDataHelper.getHorseAttrInfo(this._horseData);
            this._recordAttr.updateData(attrInfo);
            this._horseDetail.updateHorseEquipDifPrompt();
        }));
        this.node.runAction(cc.sequence(actions));
    }
}