const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import PopupHomelandUpMainCell from './PopupHomelandUpMainCell';
import { G_UserData, Colors, G_SignalManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { HomelandHelp } from './HomelandHelp';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PopupHomelandMainUp extends PopupBase {
    public static path = 'homeland/PopupHomelandMainUp';
    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMainTree: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageEmpty: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textNodeRes: cc.Node = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resItem1: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnUp: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevelDesc: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _attrNode1: cc.Node = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnGetAward: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMax: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRankMax: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMaxAttr: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _attrNode3: cc.Node = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnMaxGetAward: CommonButtonLevel1Normal = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    popupHomelandUpMainCell: cc.Prefab = null;

    _treeData: any;
    _isFriend: any;
    _signalHomeTreeUpLevel;
    _signalHomeTreeHarvest;
    _signalRecvCurrencysInfo;

    _levelUpCell1: PopupHomelandUpMainCell;
    _levelUpCell3: PopupHomelandUpMainCell;

    ctor(treeData, isFriend) {
        this._treeData = treeData;
        this._isFriend = isFriend;
        this._isClickOtherClose = true;
    }
    onCreate() {
        this._btnGetAward.addClickEventListenerEx(handler(this, this._onBtnGetAward));
        this._btnMaxGetAward.addClickEventListenerEx(handler(this, this._onBtnGetAward));
        this._btnUp.addClickEventListenerEx(handler(this, this._onBtnMainUp));

        this._commonNodeBk.setTitle(Lang.get('homeland_popup_title'));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._btnUp.setString(Lang.get('homeland_main_lv_up_btn'));
        this._btnGetAward.setString(Lang.get('homeland_main_get_award_btn'));
        this._btnMaxGetAward.setString(Lang.get('homeland_main_get_award_btn'));
        this._btnMaxGetAward.node.active = (false);
        this._createDlgCell();
        this._nodeMax.active = (false);
        this._nodeMainTree.active = (false);
        this._updateUI();
        if (this._isFriend == true) {
            this.showFriend();
        }
    }
    _createDlgCell() {
        this._levelUpCell1 = cc.instantiate(this.popupHomelandUpMainCell).getComponent(PopupHomelandUpMainCell);
        this._attrNode1.addChild(this._levelUpCell1.node);
        this._levelUpCell3 = cc.instantiate(this.popupHomelandUpMainCell).getComponent(PopupHomelandUpMainCell);
        this._attrNode3.addChild(this._levelUpCell3.node);
        this._levelUpCell3.node.active = (false);
        this._textRankMax.node.active = (false);
    }
    onBtnCancel() {
        this.close();
    }
    _updateUI() {
        var [mainData1, mainData2] = this._getMainCfg();
        var isMax = this.updateMainTree();
        if (isMax == false) {
            this._updateMainCostInfo(mainData1, mainData2);
        }
        this._btnGetAward.node.active = (false);
        this._btnMaxGetAward.node.active = (false);
        this._imageEmpty.node.active = (true);
        this._btnGetAward.setEnabled(!G_UserData.getHomeland().isTreeAwardTake());
        this._btnGetAward.showRedPoint(!G_UserData.getHomeland().isTreeAwardTake());
        if (mainData1.output_efficiency > 0) {
            this._imageEmpty.node.active = (false);
            if (mainData2 == null) {
                this._btnMaxGetAward.node.active = (true);
                this._btnMaxGetAward.showRedPoint(!G_UserData.getHomeland().isTreeAwardTake());
            } else {
                this._btnGetAward.node.active = (true);
            }
        }
        this._btnMaxGetAward.setEnabled(!G_UserData.getHomeland().isTreeAwardTake());
    }
    updateSubTree(rootNode, value) {
        var subCfg = G_UserData.getHomeland().getSubTreeCfg(value.type, value.level);
        var mainTreeLevel = G_UserData.getHomeland().getMainTreeLevel();
        var levelOk = false;
        var subLevel = G_UserData.getHomeland().getSubTreeLevel(value.type);
        levelOk = subLevel >= value.level;
        rootNode.active = (true);
        var node = rootNode.getChildByName('Panel_attr');
        var textName = node.getChildByName('Text_name');
        var textLevel = node.getChildByName('Text_value');
        var button = node.getChildByName('Button_go_level');
        var desc = Lang.get('homeland_sub_tree_desc', { num: value.level });
        var color = Colors.DARK_BG_GREEN;

        button.active = (!levelOk);
        if (levelOk == false) {
            desc = Lang.get('homeland_sub_tree_desc_no', { num: value.level });
            color = Colors.DARK_BG_RED;
            UIHelper.addEventListener(this.node, button.getComponent(cc.Button) || button.addComponent(cc.Button), 'PopupHomelandMainUp', 'goSubTree', value);
        }
        textName.getComponent(cc.Label).string = (subCfg.name + ' : ');
        textLevel.getComponent(cc.Label).string = (desc);
        textLevel.color = (color);
    }

    goSubTree(evetn,value) {
        G_SignalManager.dispatch(SignalConst.EVENT_HOME_LAND_OPEN_DLG, value.type);
        this.close();
    }
    _updateSubTreeCondition(mainData1, mainData2) {
        var limitList = [];
        for (var i = 1; i <= 2; i++) {
            var rootNode = this._nodeMainTree.getChildByName('FileNode_level' + i);
            rootNode.active = (false);
            var subType = mainData2['adorn_type_' + i];
            var subLevel = mainData2['adorn_level_' + i];
            if (subType && subType > 0 && subLevel && subLevel > 0) {
                limitList.push({
                    type: subType,
                    level: subLevel
                });
            }
        }
        for (var j in limitList) {
            var value = limitList[j];
            var rootNode = this._nodeMainTree.getChildByName('FileNode_level' + (parseFloat(j) + 1));
            this.updateSubTree(rootNode, value);
        }
    }
    _updateMainCostInfo(mainData1, mainData2) {
        var costList = [];
        var type = mainData1['type'];
        var value = mainData1['value'];
        var size = mainData1['size'];
        if (type > 0) {
            costList.push({
                type: type,
                value: value,
                size: size
            });
        }
        this['_resItem1'].node.active = (false);
        function addButtonCall() {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE);
        }
        for (var i in costList) {
            var value = costList[i];
            var itemCount = UserDataHelper.getNumByTypeAndValue(value.type, value.value);
            var costNode = this['_resItem' + (parseFloat(i) + 1)];
            costNode.updateUI(value.type, value.value);
            costNode.setCount(value.size);
            costNode.showResName(true, '消耗元宝 : ');
            costNode.setTextColorToATypeColor(itemCount >= value.size);
            if (value.size > 0) {
                costNode.node.active = (true);
            }
        }
        this._textLevelDesc.string = (mainData1.up_text_1);
        this._updateSubTreeCondition(mainData1, mainData2);
    }
    _getMainCfg() {
        var [mainData1, mainData2] = HomelandHelp.getMainTreeCfg(this._treeData);
        return [
            mainData1,
            mainData2
        ];
    }
    _showMax() {
        this._nodeMaxAttr.active = (false);
        this._textRankMax.node.active = (false);
        this._nodeMainTree.active = (false);
        this._nodeMax.active = (true);
        var [mainData1, mainData2] = this._getMainCfg();
        this._levelUpCell1.node.active = (false);
        this._levelUpCell3.node.active = (true);
        this._levelUpCell3.updateUI(mainData1, mainData2);
        if (mainData2 == null) {
            this._textRankMax.node.active = (true);
            this._levelUpCell3.moveAttrToMid();
            this._btnMaxGetAward.node.active = (true);
        } else {
            this._nodeMaxAttr.active = (true);
        }
    }
    showFriend() {
        this._showMax();
        this._textRankMax.node.active = (false);
        this._btnMaxGetAward.node.active = (false);
    }
    updateMainTree() {
        var [mainData1, mainData2] = this._getMainCfg();
        this._nodeMax.active = (false);
        this._nodeMainTree.active = (false);
        if (mainData2 == null) {
            this._showMax();
            return true;
        }
        if (mainData1 && mainData2) {
            this._levelUpCell1.node.active = (true);
            this._levelUpCell3.node.active = (false);
            this._levelUpCell1.updateUI(mainData1, mainData2);
            this._nodeMainTree.active = (true);
        }
        return false;
    }
    onEnter() {
        this._signalHomeTreeUpLevel = G_SignalManager.add(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, handler(this, this._onEventHomeTreeUpLevel));
        this._signalHomeTreeHarvest = G_SignalManager.add(SignalConst.EVENT_HOME_TREE_HARVEST_SUCCESS, handler(this, this._onEventHomeTreeHarvest));
        this._signalRecvCurrencysInfo = G_SignalManager.add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(this, this._updateData));
    }
    onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupHomelandMainUp");
    }
    onExit() {
        this._signalHomeTreeUpLevel.remove();
        this._signalHomeTreeUpLevel = null;
        this._signalRecvCurrencysInfo.remove();
        this._signalRecvCurrencysInfo = null;
        this._signalHomeTreeHarvest.remove();
        this._signalHomeTreeHarvest = null;
    }
    _onEventHomeTreeHarvest(id, message) {
        this._btnGetAward.setEnabled(!G_UserData.getHomeland().isTreeAwardTake());
        this._btnGetAward.showRedPoint(!G_UserData.getHomeland().isTreeAwardTake());
        this._btnMaxGetAward.setEnabled(!G_UserData.getHomeland().isTreeAwardTake());
        this._btnMaxGetAward.showRedPoint(!G_UserData.getHomeland().isTreeAwardTake());
    }
    _onBtnGetAward() {
        if (G_UserData.getHomeland().isTreeAwardTake() == false) {
            G_UserData.getHomeland().c2sHomeTreeHarvest();
        }
    }
    _onBtnMainUp() {
        var retValue = HomelandHelp.checkMainTreeUp(this._treeData, true);
        if (retValue) {
            G_UserData.getHomeland().c2sHomeTreeUpLevel(0);
        }
    }
    _onEventHomeTreeUpLevel(id, message) {
        if (this._isFriend == true) {
            return;
        }
        this.close();
    }
    _updateData() {
        if (this._isFriend == true) {
            return;
        }
        this._updateUI();
    }

}