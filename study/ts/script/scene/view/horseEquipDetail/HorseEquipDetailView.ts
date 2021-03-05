const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import { G_UserData, G_SignalManager, G_SceneManager } from '../../../init';
import ViewBase from '../../ViewBase';
import HorseConst from '../../../const/HorseConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Lang } from '../../../lang/Lang';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import CommonHorseEquipAvatar from '../../../ui/component/CommonHorseEquipAvatar';
import HorseEquipDetailBaseView from './HorseEquipDetailBaseView';
import { Path } from '../../../utils/Path';
import PopupHorseEquipInfo from '../../../ui/popup/PopupHorseEquipInfo';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class HorseEquipDetailView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDetailView: cc.Node = null;

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
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonUnload: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonReplace: CommonButtonLevel1Normal = null;

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
    @property({
        type: cc.Prefab,
        visible: true
    })
    _commonHorseEquipAvatarPrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _horseEquipDetailBaseViewPrefab: cc.Prefab = null;

    private _equipData;
    private _equipId;
    private _horseId;
    private _rangeType;
    private _allHorseEquipList;
    private _pageAvatars;
    private _selectedPos;
    private _maxCount;

    private _singleHorseEquipAddSuccess;

    onCreate() {
        this.setSceneSize();
        let [equipData, rangeType] = G_SceneManager.getViewArgs();
        G_UserData.getHorseEquipment().setCurEquipmentId(equipData.getId());
        this._equipData = equipData;
        this._equipId = equipData.getId();
        this._horseId = equipData.getHorse_id();
        this._rangeType = rangeType || HorseConst.HORSE_EQUIP_RANGE_TYPE_1;
        this._allHorseEquipList = [];

        this._pageAvatars = [];
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_horse');

        this._buttonUnload.setString(Lang.get('horse_detail_btn_unload'));
        this._buttonReplace.setString(Lang.get('horse_detail_btn_replace'));
        this._buttonUnload.addClickEventListenerEx(handler(this, this._onButtonUnloadClicked));
        this._buttonReplace.addClickEventListenerEx(handler(this, this._onButtonReplaceClicked));

        UIHelper.addEventListener(this.node, this._buttonLeft, 'HorseEquipDetailView', 'onButtonLeftClicked');
        UIHelper.addEventListener(this.node, this._buttonRight, 'HorseEquipDetailView', 'onButtonRightClicked');
    }

    onEnter() {
        this._singleHorseEquipAddSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_EQUIP_ADD_SUCCESS, handler(this, this._horseEquipAddSuccess));
        this._initHorseEquipList();
        this._updatePageView();
        this._updateArrowBtn();
        this._updateInfo();
    }

    onExit() {
        this._singleHorseEquipAddSuccess.remove();
        this._singleHorseEquipAddSuccess = null;
    }

    _initHorseEquipList() {
        if (this._rangeType == HorseConst.HORSE_EQUIP_RANGE_TYPE_1) {
            this._allHorseEquipList = G_UserData.getHorseEquipment().getListDataBySort();
        } else if (this._rangeType == HorseConst.HORSE_EQUIP_RANGE_TYPE_2) {
            this._allHorseEquipList = G_UserData.getHorseEquipment().getEquipedEquipListWithHorseId(this._horseId);
        }
        this._selectedPos = 1;
        for (let i in this._allHorseEquipList) {
            var equipUnitData = this._allHorseEquipList[i];
            if (equipUnitData.getId() == this._equipId) {
                this._selectedPos = parseInt(i) + 1;
            }
        }
        this._maxCount = this._allHorseEquipList.length;
    }

    _createPageItem(width, height, i): [cc.Node, CommonHorseEquipAvatar] {
        var unitData = this._allHorseEquipList[i];
        var baseId = unitData.getBase_id();
        var widget = new cc.Node();
        widget.setContentSize(width, height);
        var avatar = cc.instantiate(this._commonHorseEquipAvatarPrefab).getComponent(CommonHorseEquipAvatar);
        avatar.updateUI(baseId);
        avatar.showShadow(false);
        // var size = widget.getContentSize();
        // avatar.node.setPosition(size.width / 2, 0);
        widget.addChild(avatar.node);
        return [
            widget,
            avatar
        ];
    }

    _updatePageView() {
        this._pageView.removeAllPages();
        this._pageAvatars = [];
        var viewSize = this._pageView.node.getContentSize();
        this._pageView.content.setContentSize(viewSize.width * this._maxCount, viewSize.height);
        for (var i = 0; i < this._maxCount; i++) {
            var [item, avatar] = this._createPageItem(viewSize.width, viewSize.height, i);
            this._pageView.addPage(item);
            this._pageAvatars.push(avatar);
        }
        // this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._pageView.scrollToPage(this._selectedPos - 1, 0);
    }

    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._maxCount);
    }

    _updateInfo() {
        var equipmentData = G_UserData.getHorseEquipment();
        var curEquipmentId = equipmentData.getCurEquipmentId();
        var curEquipData = equipmentData.getHorseEquipWithEquipId(curEquipmentId);
        this._buttonUnload.setVisible(false);
        this._buttonReplace.setVisible(false);
        this._nodeDetailView.removeAllChildren();
        var horseDetail = cc.instantiate(this._horseEquipDetailBaseViewPrefab).getComponent(HorseEquipDetailBaseView);
        horseDetail.ctor(curEquipData, this._rangeType);
        this._nodeDetailView.addChild(horseDetail.node);
        this._checkRedPoint();
    }

    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curEquipData = this._allHorseEquipList[this._selectedPos - 1];
        G_UserData.getHorseEquipment().setCurEquipmentId(curEquipData.getId());
        this._updateArrowBtn();
        this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._updateInfo();
    }

    onButtonRightClicked() {
        if (this._selectedPos >= this._maxCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curEquipData = this._allHorseEquipList[this._selectedPos - 1];
        G_UserData.getHorseEquipment().setCurEquipmentId(curEquipData.getId());
        this._updateArrowBtn();
        this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._updateInfo();
    }

    _onButtonReplaceClicked() {
        let showHorseEquipReplace = () => {
            G_SceneManager.popScene();
            var scene = G_SceneManager.getTopScene();
            var view = scene.getSceneView();
            var viewName = view.getName();
            if (viewName == 'HorseDetailView' || viewName == 'HorseTrainView') {
                var equipData = this._allHorseEquipList[this._selectedPos - 1];
                view.popupHorseEquipReplace(equipData.getConfig().type);
            }
        }
        let callback = (backType) => {
            if (backType) {
                if (backType == 'change') {
                    showHorseEquipReplace();
                } else if (backType == 'put_off') {
                    this._onButtonUnloadClicked();
                }
            }
        }
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupHorseEquipInfo"), (popupHorseEquipInfo: PopupHorseEquipInfo) => {
            popupHorseEquipInfo.init(callback);
            popupHorseEquipInfo.updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, this._equipData.getBase_id());
            popupHorseEquipInfo.openWithAction();
        })
    }

    _onButtonUnloadClicked() {
        var curEquipData = this._allHorseEquipList[this._selectedPos - 1];
        var curHorseId = curEquipData.getHorse_id();
        G_UserData.getHorseEquipment().c2sEquipWarHorseEquipment(curHorseId, curEquipData.getConfig().type, 0);
    }

    _horseEquipAddSuccess(event, equipPos) {
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        var sceneName = scene.getName();
        var view = scene.getSceneView();
        if (view) {
            var viewName = view.getName();
            if (viewName == 'HorseTrainView' || viewName == 'HorseDetailView') {
                view.updateHorseEquipDifPrompt();
                return;
            }
        }
    }

    _checkRedPoint() {
        if (this._equipData.getHorse_id() == 0) {
            this._buttonReplace.showRedPoint(false);
            return;
        }
        var equipBaseId = this._equipData.getBase_id();
        var isBetter = G_UserData.getHorseEquipment().isHaveBetterHorseEquip(equipBaseId);
        this._buttonReplace.showRedPoint(isBetter);
    }
    onPageViewEvent(pageView, eventType, customEventData) {
        if (eventType == cc.PageView.EventType.PAGE_TURNING && pageView == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            if (targetPos != this._selectedPos) {
                this._selectedPos = targetPos;
                var curEquipId = this._allHorseEquipList[this._selectedPos - 1].getId();
                G_UserData.getHorseEquipment().setCurEquipmentId(curEquipId);
                this._updateArrowBtn();
                this._updateInfo();
            }
        }
    }
}