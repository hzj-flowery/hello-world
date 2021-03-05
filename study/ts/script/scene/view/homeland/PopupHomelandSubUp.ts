const { ccclass, property } = cc._decorator;

import CommonCostNode from '../../../ui/component/CommonCostNode'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import PopupHomelandUpSubCell from './PopupHomelandUpSubCell';
import { HomelandHelp } from './HomelandHelp';
import { G_UserData, Colors, G_SignalManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PopupHomelandSubUp extends PopupBase {
    public static path = 'homeland/PopupHomelandSubUp';
    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSubTree: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textNodeRes: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnUp: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonCostNode,
        visible: true
    })
    _resSubItem1: CommonCostNode = null;

    @property({
        type: CommonCostNode,
        visible: true
    })
    _resSubItem2: CommonCostNode = null;

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
    _attrNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _attrNode3: cc.Node = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    popupHomelandUpSubCell: cc.Prefab = null;

    _treeData: any;
    _isFriend: any;
    _signalHomeTreeUpLevel;
    _signalRecvCurrencysInfo;
    _levelUpCell1: PopupHomelandUpSubCell;
    _levelUpCell3: PopupHomelandUpSubCell;
    ctor(treeData, isFriend) {
        this._treeData = treeData;
        this._isFriend = isFriend;
        this._isClickOtherClose = true;
    }
    onCreate() {
        this.node.name = "PopupHomelandSubUp";
        this._btnUp.addClickEventListenerEx(handler(this, this._onBtnSubUp));
        this._commonNodeBk.setTitle(Lang.get('homeland_popup_title'));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._btnUp.setString(Lang.get('homeland_lv_up_btn'));
        this._createDlgCell();
        this._nodeMax.active = (false);
        this._nodeSubTree.active = (false);
        if (this._isFriend == true) {
            this.showFriend();
        }
    }
    _createDlgCell() {
        this._levelUpCell1 = cc.instantiate(this.popupHomelandUpSubCell).getComponent(PopupHomelandUpSubCell);
        this._attrNode1.addChild(this._levelUpCell1.node);
        this._levelUpCell3 = cc.instantiate(this.popupHomelandUpSubCell).getComponent(PopupHomelandUpSubCell);
        this._attrNode3.addChild(this._levelUpCell3.node);
        this._levelUpCell3.node.active = (false);
        this._textRankMax.node.active = (false);
    }
    onBtnCancel() {
        this.close();
    }
    _getSubCfg() {
        var [subData1, subData2] = HomelandHelp.getSubTreeCfg(this._treeData);
        return [
            subData1,
            subData2
        ];
    }
    _updateUI() {
        var [subData1, subData2] = this._getSubCfg();
        var isMax = this.updateSubTree();
        if (isMax == false) {
            this._updateSubCostInfo(subData1, subData2);
        }
    }
    _updateSubTreeCondition(subData1, subData2) {
        var limitList = [];
        var rootNode = this._nodeSubTree.getChildByName('FileNode_level3');
        rootNode.active = (false);
        if (subData2.limit_tree_level > 0) {
            limitList.push({
                type: 0,
                level: subData2.limit_tree_level
            });
        }
        for (var i = 1; i <= 2; i++) {
            var rootNode = this._nodeSubTree.getChildByName('FileNode_level' + i);
            rootNode.active = (false);
            var subType = subData2['adorn_type_' + i];
            var subLevel = subData2['adorn_level_' + i];
            if (subType && subType > 0 && subLevel && subLevel > 0) {
                limitList.push({
                    type: subType,
                    level: subLevel
                });
            }
        }
        var  updateSubTreeLimit = function(rootNode, value) {
            var descName = '';
            var levelOk = false;
            if (value.type == 0) {
                var mainTree = G_UserData.getHomeland().getMainTreeCfg(value.level);
                descName = mainTree.name + ' : ';
                var mainTreeLevel = G_UserData.getHomeland().getMainTreeLevel();
                levelOk = mainTreeLevel >= value.level;
            } else {
                var subCfg = G_UserData.getHomeland().getSubTreeCfg(value.type, value.level);
                var subLevel = G_UserData.getHomeland().getSubTreeLevel(value.type);
                levelOk = subLevel >= value.level;
                descName = subCfg.name + ' :';
            }
            rootNode.active = (true);
            var node = rootNode.getChildByName('Panel_attr');
            var textName = node.getChildByName('Text_name');
            var textLevel = node.getChildByName('Text_value');
            var button = node.getChildByName('Button_go_level');
            var desc = Lang.get('homeland_sub_tree_desc', { num: value.level });
            if (value.type == 0) {
                desc = Lang.get('homeland_main_tree_desc', { num: value.level });
            }
            var color = Colors.DARK_BG_GREEN;
            button.active = (!levelOk);
            if (levelOk == false) {
                if (value.type == 0) {
                    desc = Lang.get('homeland_main_tree_desc_no', { num: value.level });
                } else {
                    desc = Lang.get('homeland_sub_tree_desc_no', { num: value.level });
                }
                color = Colors.DARK_BG_RED;
                UIHelper.addEventListener(this.node, button.getComponent(cc.Button) || button.addComponent(cc.Button), 'PopupHomelandSubUp', 'goSubTree', value);
            }
            textName.getComponent(cc.Label).string = (descName);
            textLevel.getComponent(cc.Label).string =(desc);
            textLevel.color = (color);
        }.bind(this);
        for (var j in limitList) {
            var value = limitList[j];
            var rootNode = this._nodeSubTree.getChildByName('FileNode_level' + (parseFloat(j) + 1));
            updateSubTreeLimit(rootNode, value);
        }
    }

    goSubTree(evetn, value) {
        G_SignalManager.dispatch(SignalConst.EVENT_HOME_LAND_OPEN_DLG, value.type);
        this.close();
    }
    _updateSubCostInfo(subData1, subData2) {
        var costList = [];
        for (var i = 1; i <= 2; i++) {
            var type = subData1['type_' + i];
            var value = subData1['value_' + i];
            var size = subData1['size_' + i];
            if (type > 0 && value > 0) {
                costList.push({
                    type: type,
                    value: value,
                    size: size
                });
            }
            this['_resSubItem' + i].node.active = (false);
        }
        for (var j in costList) {
            var value = costList[j];
            var costNode = this['_resSubItem' + (parseFloat(j) + 1)];
            costNode.updateView(value);
            costNode.node.active = (true);
        }
        this._updateSubTreeCondition(subData1, subData2);
    }
    _showMax() {
        this._nodeMaxAttr.active = (false);
        this._textRankMax.node.active = (false);
        this._nodeMax.active = (true);
        var [subData1, subData2] = this._getSubCfg();
        this._levelUpCell1.node.active = (false);
        this._levelUpCell3.node.active = (true);
        this._levelUpCell3.updateUI(subData1, subData2);
        if (subData2 == null) {
            this._textRankMax.node.active = (true);
            this._levelUpCell3.moveAttrToMid();
        } else {
            this._nodeMaxAttr.active = (true);
        }
    }
    showFriend() {
        this._showMax();
        this._textRankMax.node.active = (false);
        this._nodeSubTree.active = (false);
    }
    updateSubTree() {
        var [subData1, subData2] = this._getSubCfg();
        this._nodeMax.active = (false);
        this._nodeSubTree.active = (false);
        if (subData2 == null) {
            this._showMax();
            return true;
        }
        if (subData1 && subData2) {
            this._nodeSubTree.active = (true);
            this._levelUpCell1.node.active = (true);
            this._levelUpCell3.node.active = (false);
            this._levelUpCell1.updateUI(subData1, subData2);
        }
        return false;
    }
    onEnter() {
        this._signalHomeTreeUpLevel = G_SignalManager.add(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, handler(this, this._onEventHomeTreeUpLevel));
        this._signalRecvCurrencysInfo = G_SignalManager.add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(this, this._updateData));
        this._updateUI();
    }
    onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    }
    onExit() {
        this._signalHomeTreeUpLevel.remove();
        this._signalHomeTreeUpLevel = null;
        this._signalRecvCurrencysInfo.remove();
        this._signalRecvCurrencysInfo = null;
    }
    _onBtnSubUp() {
        var retValue = HomelandHelp.checkSubTreeUp(this._treeData);
        if (retValue) {
            G_UserData.getHomeland().c2sHomeTreeUpLevel(this._treeData.treeId);
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