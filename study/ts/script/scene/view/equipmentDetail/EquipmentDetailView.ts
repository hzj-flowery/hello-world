const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { G_SignalManager, G_UserData, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Path } from '../../../utils/Path';
import EquipDetailBaseView from './EquipDetailBaseView';
import { FunctionConst } from '../../../const/FunctionConst';
import { EquipmentData } from '../../../data/EquipmentData';
import CommonEquipAvatar from '../../../ui/component/CommonEquipAvatar';
import EquipConst from '../../../const/EquipConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import ViewBase from '../../ViewBase';

@ccclass
export default class EquipmentDetailView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEquipDetailView: cc.Node = null;

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
        type: cc.Node,
        visible: true
    })
    _pageView: cc.Node = null;

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
    _buttonRight: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonLeft: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    @property({
        type: CommonEquipAvatar,
        visible: true
    })
    _equipAvatar: CommonEquipAvatar = null;
    @property({
        type: EquipDetailBaseView,
        visible: true
    })
    _equipDetailBaseView: EquipDetailBaseView = null;

    equipmentData: EquipmentData;
    _signalEquipClearSuccess;
    _rangeType: any;
    _allEquipIds: any[];
    _selectedPos: number;
    _equipCount: number;

    _equipId: number;
    _equipData: any;
    _btnReplaceShowRP: any;

    onCreate() {
        this.setSceneSize();
        // this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_zhuangbei');
        // this._pageView.setScrollDuration(0.3);
        // this._pageView.addEventListener(handler(this, this._onPageViewEvent));
        // this._pageView.addTouchEventListener(handler(this, this._onPageTouch));
        this._buttonReplace.setString(Lang.get('equipment_detail_btn_replace'));
        this._buttonUnload.setString(Lang.get('equipment_detail_btn_unload'));
        this._buttonReplace.addClickEventListenerEx(handler(this, this._onButtonReplaceClicked));
        this._buttonUnload.addClickEventListenerEx(handler(this, this._onButtonUnloadClicked));

        this._equipAvatar.showShadow(false);
    }
    onEnter() {
        var params = G_SceneManager.getViewArgs('equipmentDetail');
        this._equipId = params[0];
        this._rangeType = params.length > 1 ? params[1] : EquipConst.EQUIP_RANGE_TYPE_1;
        this.equipmentData = G_UserData.getEquipment();
        this.equipmentData.setCurEquipId(this._equipId);
        this._signalEquipClearSuccess = G_SignalManager.add(SignalConst.EVENT_EQUIP_CLEAR_SUCCESS, handler(this, this._equipClearSuccess));
        if (this._rangeType == EquipConst.EQUIP_RANGE_TYPE_1) {
            this._allEquipIds = this.equipmentData.getListDataBySort();
        } else if (this._rangeType == EquipConst.EQUIP_RANGE_TYPE_2) {
            var unit = this.equipmentData.getEquipmentDataWithId(this._equipId);
            var pos = unit.getPos();
            if (pos) {
                this._allEquipIds = G_UserData.getBattleResource().getEquipIdsWithPos(pos);
            }
        }
        this._selectedPos = 0;
        for (var i in this._allEquipIds) {
            var id = this._allEquipIds[i];
            if (id == this._equipId.toString()) {
                this._selectedPos = parseFloat(i);
            }
        }
        this._equipCount = this._allEquipIds.length;
        this._updateCurEquipView();

        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'EquipmentDetailView');
        }, 0);
    }

    protected onExit() {
        this._signalEquipClearSuccess.remove();
        this._signalEquipClearSuccess = null;
    }

    _updateCurEquipView() {
        this._updatePageView();
        this._updateArrowBtn();
        this.updateInfo();
    }
    _createPageItem(width, height, i) {
        // var equipId = this._allEquipIds[i];
        // var unitData = this.equipmentData.getEquipmentDataWithId(this._equipId);
        // var equipBaseId = unitData.getBase_id();
        // var widget = ccui.Widget.create();
        // widget.setContentSize(width, height);
        // var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonEquipAvatar', 'common'));
        // avatar.showShadow(false);
        // avatar.updateUI(equipBaseId);
        // var size = widget.getContentSize();
        // avatar.setPosition(cc.v2(size.width * 0.54, size.height / 2));
        // widget.addChild(avatar);
        // return widget;
        // this._equipAvatar.updateUI(equipBaseId);
    }
    _updatePageView() {
        // this._pageView.removeAllPages();
        //   var viewSize = this._pageView.getContentSize();
        //   for (var i = 0; i < this._equipCount; i++) {
        //  var item = this._createPageItem(viewSize.width, viewSize.height, i);
        //  this._pageView.addPage(item);
        //   }
        // this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        var unitData = this.equipmentData.getEquipmentDataWithId(this._equipId);
        var equipBaseId = unitData.getBase_id();
        this._equipAvatar.updateUI(equipBaseId);
    }
    updateInfo() {
        this._equipData = this.equipmentData.getEquipmentDataWithId(this._equipId);
        this._buttonReplace.node.active = (this._equipData.isInBattle());
        this._buttonUnload.node.active = (this._equipData.isInBattle());
        this._equipDetailBaseView.setEquipData(this._equipData, this._rangeType);
        // var equipDetail = new EquipDetailBaseView(this._equipData, this._rangeType);
        // this._nodeEquipDetailView.addChild(equipDetail);
        this._checkRedPoint();
    }
    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 0);
        this._buttonRight.node.active = (this._selectedPos < this._equipCount - 1);
    }
    onButtonLeftClicked() {
        if (this._selectedPos <= 0) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        this._equipId = this._allEquipIds[this._selectedPos];
        this.equipmentData.setCurEquipId(this._equipId);
        //   this._updateArrowBtn();
        //   this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        //  this.updateInfo();
        this._updateCurEquipView();
    }
    onButtonRightClicked() {
        if (this._selectedPos >= this._equipCount - 1) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        this._equipId = this._allEquipIds[this._selectedPos];
        this.equipmentData.setCurEquipId(this._equipId);
        //  this._updateArrowBtn();
        //  this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        // this.updateInfo();
        this._updateCurEquipView();
    }
    _onButtonReplaceClicked() {
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        if (scene.getName() == 'team') {
            var view = scene.getSceneView();
            view.setNeedPopupEquipReplace(this._btnReplaceShowRP);
        }
    }
    _onButtonUnloadClicked() {
        var pos = this._equipData.getPos();
        var slot = this._equipData.getSlot();
        this.equipmentData.c2sClearFightEquipment(pos, slot);
    }
    _equipClearSuccess(eventName, slot) {
        G_SceneManager.popScene();
        var scene = G_SceneManager.getTopScene();
        if (scene.getName() == 'team') {
            var view = scene.getSceneView();
            view.setNeedEquipClearPrompt(true);
        }
    }
    _checkRedPoint() {
        var pos = this._equipData.getPos();
        var slot = this._equipData.getSlot();
        var param = {
            pos: pos,
            slot: slot
        };
        var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, 'slotRP', param);
        this._buttonReplace.showRedPoint(reach);
        this._btnReplaceShowRP = reach;
    }
    _onPageViewEvent(sender, event) {
        // if (event == ccui.PageViewEventType.turning && sender == this._pageView) {
        //     var targetPos = this._pageView.getCurrentPageIndex() + 1;
        //     if (targetPos != this._selectedPos) {
        //         this._selectedPos = targetPos;
        //         var curEquipId = this._allEquipIds[this._selectedPos];
        //         this.equipmentData.setCurEquipId(curEquipId);
        //         this._updateArrowBtn();
        //         this.updateInfo();
        //     }
        // }
    }

}