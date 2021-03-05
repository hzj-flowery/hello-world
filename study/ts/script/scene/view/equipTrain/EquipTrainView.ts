const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import { G_UserData, G_SignalManager, G_SceneManager, G_WaitingMask, G_ResolutionManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import ListCellTabIcon from '../recovery/ListCellTabIcon';
import { EquipTrainHelper } from '../equipTrain/EquipTrainHelper';
import ResourceLoader from '../../../utils/resource/ResourceLoader';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { FunctionConst } from '../../../const/FunctionConst';
import EquipConst from '../../../const/EquipConst';
import ViewBase from '../../ViewBase';

@ccclass
export default class EquipTrainView extends ViewBase {

    private static JADE_ARROW_X_OFFSET = 220;
    private static JADE_ARROW_X_SCALE = 195;

    private static layerViews = [
        'EquipTrainStrengthenLayer',
        'EquipTrainRefineLayer',
        'EquipTrainJadeLayer',
        'EquipTrainLimitLayer'
    ]

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _scrollViewTab: cc.Node = null;

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
        type: ListCellTabIcon,
        visible: true
    })
    _nodeTabIcon0: ListCellTabIcon = null;
    @property({
        type: ListCellTabIcon,
        visible: true
    })
    _nodeTabIcon1: ListCellTabIcon = null;
    @property({
        type: ListCellTabIcon,
        visible: true
    })
    _nodeTabIcon2: ListCellTabIcon = null;
    @property({
        type: ListCellTabIcon,
        visible: true
    })
    _nodeTabIcon3: ListCellTabIcon = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _equipTrainStrengthenLayerPrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _equipTrainRefineLayerPrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _equipTrainJadeLayerPrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _equipTrainLimitLayerPrefab: cc.Prefab = null;

    _selectTabIndex = EquipConst.EQUIP_TRAIN_STRENGTHEN;
    _rangeType = EquipConst.EQUIP_RANGE_TYPE_1;
    _isJumpWhenBack;
    _allEquipIds = [];

    _subLayers = [];
    _leftArrowPosX;
    _rightArrowPosX;

    _signalUpdateLimitUpRedPoint;
    _signalUpdateEquipmentNums;
    _signalEquipTrainChangeView;

    _selectedPos;
    _equipCount;

    _equipId;
    _trainType;

    _curLayerView;

    _layerViewPrefabs: cc.Prefab[];

    init() {
        var params = G_SceneManager.getViewArgs('equipTrain');
        this._equipId = params[0];
        this._selectTabIndex = params[1] || EquipConst.EQUIP_TRAIN_STRENGTHEN;;
        this._rangeType = params[2] || EquipConst.EQUIP_RANGE_TYPE_1;
        if (params.length > 3) {
            this._isJumpWhenBack = params[3];
        }

        G_UserData.getEquipment().setCurEquipId(this._equipId);
        this._allEquipIds = [];
    }

    onCreate() {
        this._layerViewPrefabs = [this._equipTrainStrengthenLayerPrefab, this._equipTrainRefineLayerPrefab,
        this._equipTrainJadeLayerPrefab, this._equipTrainLimitLayerPrefab];
        this.init();
        this.setSceneSize();
        this._subLayers = [];
        this._leftArrowPosX = this._buttonLeft.node.x;
        this._rightArrowPosX = this._buttonRight.node.x;
        this._initTab();
    }

    start() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_zhuangbei');
        if (this._isJumpWhenBack) {
            this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
        }
    }

    onEnter() {
        this._updateAllEquipIds(this._equipId);
        this._updateView();
        this._updateTabIcons();
        this._updateLimitUpRedPoint();
        // 抛出新手事件出新手事件
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "EquipTrainView");
        }, 0);
        this._signalUpdateLimitUpRedPoint = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._updateLimitUpRedPoint));
        this._signalUpdateEquipmentNums = G_SignalManager.add(SignalConst.EVENT_UPDATE_EQUIPMENT_NUMS, handler(this, this._updateEquipmentNums));
        this._signalEquipTrainChangeView = G_SignalManager.add(SignalConst.EVENT_EQUIP_TRAIN_CHANGE_VIEW, handler(this, this._onEventChangeView));
    }
    _updateAllEquipIds(equipId) {
        if (this._rangeType == EquipConst.EQUIP_RANGE_TYPE_1) {
            this._allEquipIds = G_UserData.getEquipment().getListDataBySort();
        } else if (this._rangeType == EquipConst.EQUIP_RANGE_TYPE_2) {
            var unit = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
            var pos = unit.getPos();
            if (pos) {
                this._allEquipIds = G_UserData.getBattleResource().getEquipIdsWithPos(pos);
            }
        }
        this._selectedPos = 0;
        for (var i in this._allEquipIds) {
            var id = this._allEquipIds[i];
            if (id == equipId) {
                this._selectedPos = parseFloat(i);
            }
        }
        this._equipCount = this._allEquipIds.length;
    }
    _updateEquipmentNums() {
        var equipId = G_UserData.getEquipment().getCurEquipId();
        this._updateAllEquipIds(equipId);
    }
    _onEventChangeView(id, index) {
        this._onClickTabIcon(index);
    }
    onExit() {
        this._signalUpdateLimitUpRedPoint.remove();
        this._signalUpdateLimitUpRedPoint = null;
        this._signalUpdateEquipmentNums.remove();
        this._signalUpdateEquipmentNums = null;
        this._signalEquipTrainChangeView.remove();
        this._signalEquipTrainChangeView = null;
    }
    _initTab() {
        this._updateTrainTab();
    }
    _onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this._updateTabIcons();
        this._updateView();
    }
    _updateTabIcons() {
        var tabData = EquipTrainHelper.getShowEquipTrainTab();
        var flag = false;
        for (var i = 0; i < tabData.length; i++) {
            this['_nodeTabIcon' + i].setSelected(tabData[i] == this._selectTabIndex);
            flag = flag || tabData[i] == this._selectTabIndex;
        }
        if (!flag) {
            this._selectTabIndex = tabData[0];
            this._nodeTabIcon0.setSelected(true);
            this._updateView();
        }
    }
    _updateView() {
        var viewIdx = this._selectTabIndex - 1;
        var layer = this._subLayers[viewIdx];
        if (layer == null) {
            this.getLayerView(viewIdx, handler(this, this._updateView))
            return;
        }
        for (var k in this._subLayers) {
            var subLayer = this._subLayers[k];
            subLayer.node.active = false;
        }
        if (layer) {
            layer.node.active = true;
            layer.updateInfo();
        }
        this._curLayerView = layer;
        this.updateArrowBtn();
    }

    getLayerView(index, cb) {
        var layer = this._subLayers[index];
        if (layer) {
            return layer;
        } else {
            var layerName = EquipTrainView.layerViews[index];
            let layerPrefab = this._layerViewPrefabs[index];
            var node: cc.Node = cc.instantiate(layerPrefab);
            var layerComp = node.getComponent(EquipTrainView.layerViews[index]);
            layerComp._parentView = this;
            this._subLayers[index] = layerComp;
            this._panelContent.addChild(node);
            cb();
            // ResourceLoader.loadPrefab('equipment/' + layerName, handler(this, (prefab) => {
            //     var node: cc.Node = cc.instantiate(prefab);
            //     var layerComp = node.getComponent(EquipTrainView.layerViews[index]);
            //     layerComp._parentView = this;
            //     this._subLayers[index] = layerComp;
            //     this._panelContent.addChild(node);
            //     cb();
            // }));
            return null;
        }
    }
    _setCallback() {
        G_UserData.getTeamCache().setShowEquipTrainFlag(true);
        G_SceneManager.popSceneByTimes(2);
    }
    updateArrowBtn() {
        var isShow = this._selectedPos >= 1;
        var isShow2 = this._selectedPos < this._equipCount - 1;
        if (this._selectTabIndex == EquipConst.EQUIP_TRAIN_LIMIT) {
            isShow = false;
            isShow2 = false;
        }
        this._buttonLeft.node.active = isShow;
        this._buttonRight.node.active = isShow2;
        if (this._selectTabIndex == EquipConst.EQUIP_TRAIN_JADE) {
            this._buttonLeft.node.x = (this._leftArrowPosX + EquipTrainView.JADE_ARROW_X_OFFSET - EquipTrainView.JADE_ARROW_X_SCALE);
            this._buttonRight.node.x = (this._rightArrowPosX + EquipTrainView.JADE_ARROW_X_OFFSET + EquipTrainView.JADE_ARROW_X_SCALE);
        } else {
            this._buttonLeft.node.x = (this._leftArrowPosX);
            this._buttonRight.node.x = (this._rightArrowPosX);
        }
    }
    _updateTrainTab() {
        var tabData = EquipTrainHelper.getShowEquipTrainTab();
        if (tabData.length < 1) {
            return;
        }
        // this._scrollViewTab.removeAllChildren();
        for (var index = 0; index < EquipConst.EQUIP_TRAIN_MAX_TAB; index++) {
            var tabIcon = this['_nodeTabIcon' + index];
            (this['_nodeTabIcon' + index].node.active = false);
        }
        var y = 0;
        for (var index = 0; index < tabData.length; index++) {
            var tabIcon = this['_nodeTabIcon' + index];
            tabIcon.node.active = true;
            tabIcon.init(handler(this, this._onClickTabIcon));
            tabIcon.setTxtListPrex('equipment_train_tab_icon_');
            tabIcon.setFuncionConstPrex('FUNC_EQUIP_TRAIN_TYPE');
            tabIcon.updateUI(index == tabData.length - 1, index, tabData[index], tabData.length - 1);
            y -= tabIcon.node.height + 9;
            tabIcon.node.y = y;
            // this['_nodeTabIcon' + index] = new ListCellTabIcon(handler(this, this._onClickTabIcon));
            // this['_nodeTabIcon' + index].setTxtListPrex('equipment_train_tab_icon_');
            // this['_nodeTabIcon' + index].setFuncionConstPrex('FUNC_EQUIP_TRAIN_TYPE');
            // this['_nodeTabIcon' + index].updateUI(index == tabData.length, index, tabData[index], tabData.length);
            // this._scrollViewTab.pushBackCustomItem(this['_nodeTabIcon' + index]);
        }
    }
    onButtonLeftClicked() {
        if (this._selectedPos <= 0) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        this.changeUpdate();
    }
    onButtonRightClicked() {
        if (this._selectedPos >= this._equipCount - 1) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        this.changeUpdate();
    }
    changeUpdate() {
        var curEquipId = this._allEquipIds[this._selectedPos];
        G_UserData.getEquipment().setCurEquipId(curEquipId);
        this._updateTrainTab();
        this._updateTabIcons();
        this._updateLimitUpRedPoint();
        this.updateArrowBtn();
        this._curLayerView && this._curLayerView.updateInfo();
    }
    getAllEquipIds() {
        return this._allEquipIds;
    }
    getEquipCount() {
        return this._equipCount;
    }
    setSelectedPos(pos) {
        this._selectedPos = pos;
    }
    getSelectedPos() {
        return this._selectedPos;
    }
    setArrowBtnEnable(enable) {
        this._buttonLeft.enabled = (enable);
        this._buttonRight.enabled = (enable);
    }
    _updateLimitUpRedPoint() {
        for (var index = 0; index < EquipConst.EQUIP_TRAIN_MAX_TAB; index++) {
            if (this['_nodeTabIcon' + index]) {
                if (this['_nodeTabIcon' + index].getTag() == EquipConst.EQUIP_TRAIN_LIMIT) {
                    var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4)[0];
                    var isRed = EquipTrainHelper.isNeedRedPoint() && isOpen;
                    this['_nodeTabIcon' + index].showRedPoint(isRed);
                } else if (this['_nodeTabIcon' + index].getTag() == EquipConst.EQUIP_TRAIN_JADE) {
                    var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0];
                    var isRed = EquipTrainHelper.needJadeRedPoint(G_UserData.getEquipment().getCurEquipId()) && isOpen;
                    this['_nodeTabIcon' + index].showRedPoint(isRed);
                }
            }
        }
    }

}