const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonHelpBig from '../../../ui/component/CommonHelpBig'

import CommonMainMenu from '../../../ui/component/CommonMainMenu'

import CommonHeroPower from '../../../ui/component/CommonHeroPower'

import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import { G_UserData, G_SignalManager, G_ResolutionManager, G_Prompt, G_EffectGfxMgr, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Path } from '../../../utils/Path';
import { FunctionConst } from '../../../const/FunctionConst';
import { handler } from '../../../utils/handler';
import { HomelandConst } from '../../../const/HomelandConst';
import HomelandNode from './HomelandNode';
import HomelandMainNode from './HomelandMainNode';
import HomelandGuildList from './HomelandGuildList';
import UIConst from '../../../const/UIConst';
import { Lang } from '../../../lang/Lang';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import ViewBase from '../../ViewBase';
import { HomelandHelp } from './HomelandHelp';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import PopupHomelandUpResult from './PopupHomelandUpResult';
import PopupHomelandMaterial from './PopupHomelandMaterial';
import HomelandPrayNode from './HomelandPrayNode';
import PopupHomelandPray from './PopupHomelandPray';
import PopupHomelandPrayHandbook from './PopupHomelandPrayHandbook';

@ccclass
export default class HomelandView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonFold: cc.Button = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _fileNodePower: CommonHeroPower = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _commonShop: CommonMainMenu = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _commonHelp: CommonHelpBig = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _commonPreview: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _commonHandbook: CommonMainMenu = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePrayMoving: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelScreen: cc.Node = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    homelandNode: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    homelandMainNode: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    homelandGuildList: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    homelandPrayNode: cc.Prefab = null;

    _guildListView: any;
    _guildListSignal: any;
    _popResult: any;
    _popResultSignal: any;
    _signalHomeTreeUpLevel;
    _signalHomeTreeHarvest;
    _signalRecvRoleInfo;
    _signalOpenHomelandDlg;
    _recordAttr;
    _lastTotalPower: number;
    _mainTree;
    _openTreeList: any;
    static signal;
    _signalBlessSuccess: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _prayNode: HomelandPrayNode;


    public static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            HomelandView.signal.remove();
            HomelandView.signal = null;
            callBack();
        }
        var inGuild = G_UserData.getGuild().isInGuild();
        if (inGuild) {
            G_UserData.getGuild().c2sQueryGuildMall();
        }
        G_UserData.getHomeland().c2sGetHomeTree();
        HomelandView.signal = G_SignalManager.add(SignalConst.EVENT_GET_HOME_TREE_SUCCESS, onMsgCallBack);
    }
    onCreate() {
        this.setSceneSize();
        this.updateSceneId(2001);
        this._makeBackGroundBottom();
        this._updateTreeModel();
        this._initPrayModel();
        this._commonShop.updateUI(FunctionConst.FUNC_PET_SHOP);
        this._commonShop.addClickEventListenerEx(handler(this, this._onButtonClick));
        this._commonHelp.updateUI(FunctionConst.FUNC_HOMELAND);
        this._commonPreview.updateUI(FunctionConst.FUNC_HOMELAND_PREVIEW);
        this._commonPreview.addClickEventListenerEx(handler(this, this._onButtonPreviewClick));
        this._commonHandbook.updateUI(FunctionConst.FUNC_HOMELAND_HANDBOOK);
        this._commonHandbook.addClickEventListenerEx(handler(this, this._onButtonHandbookClick));
    }
    start() {
        this._topbarBase.setImageTitle('txt_big_homeland_01');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_HOMELAND);
    }

    _updateTreeModel() {
        var groundNode = this.getGroundNode();
        for (var i = 1; i <= HomelandConst.MAX_SUB_TREE; i++) {
            var subTree = G_UserData.getHomeland().getSubTree(i);
            var subNode = groundNode.getChildByName('subNode' + i);
            if (subNode == null) {
                subNode = cc.instantiate(this.homelandNode);
                let comp: HomelandNode = subNode.getComponent(HomelandNode);
                comp.ctor(HomelandConst.SELF_TREE)
                subNode.name = ('subNode' + i);
                groundNode.addChild(subNode);
                this['_subTree' + i] = comp;
            }
            if (subTree && subNode) {
                subNode.getComponent(HomelandNode).updateUI(subTree);
            }
        }
        var mainTree = G_UserData.getHomeland().getMainTree();
        var mainNode = groundNode.getChildByName('mainTree');
        if (mainNode == null && mainTree) {
            mainNode = cc.instantiate(this.homelandMainNode);
            this._mainTree = mainNode.getComponent(HomelandMainNode)
            this._mainTree.ctor(HomelandConst.SELF_TREE, mainTree)
            groundNode.addChild(mainNode);
            mainNode.name = ('mainTree');
        }
        this._mainTree.updateUI(mainTree);
    }
    _initPrayModel() {
        var groundNode = this.getGroundNode();
        this._prayNode = cc.instantiate(this.homelandPrayNode).getComponent(HomelandPrayNode);
        this._prayNode.ctor(HomelandConst.SELF_TREE, handler(this, this._onClickPray));
        groundNode.addChild(this._prayNode.node, 10000);
        this._prayNode.updateRedPoint();
        this._panelScreen.active = (false);
    }
    _onClickPray() {
        var eventFunction = function (event) {
            if (event == 'finish') {
                G_SceneManager.openPopup('prefab/homeland/PopupHomelandPray', (p: PopupHomelandPray) => {
                    p.open();
                })
                this._panelScreen.active = (false);
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodePrayMoving, 'moving_shenshu_lianhuadengfashe', null, eventFunction, false);
        this._panelScreen.active = (true);
    }
    onButtonFold() {
        if (this._guildListView) {
            return;
        }
        var popup = cc.instantiate(this.homelandGuildList).getComponent(HomelandGuildList);
        popup.ctor(G_UserData.getBase().getId());
        this.node.addChild(popup.node);
        this._guildListView = popup;
        this._guildListSignal = this._guildListView.signal.add(handler(this, this._onGuildListClose));
        this._popResult = null;
        this._popResultSignal = null;
        this._buttonFold.node.active = (false);
    }
    _onGuildListClose(event) {
        if (event == 'close') {
            this._buttonFold.node.active = (true);
            this._guildListView = null;
            if (this._guildListSignal) {
                this._guildListSignal.remove();
                this._guildListSignal = null;
            }
        }
    }
    onEnter() {
        this._signalHomeTreeUpLevel = G_SignalManager.add(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, handler(this, this._onEventHomeTreeUpLevel));
        this._signalHomeTreeHarvest = G_SignalManager.add(SignalConst.EVENT_HOME_TREE_HARVEST_SUCCESS, handler(this, this._onEventHomeTreeHarvest));
        this._signalRecvRoleInfo = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._onEventRecvRoleInfo));
        this._signalOpenHomelandDlg = G_SignalManager.add(SignalConst.EVENT_HOME_LAND_OPEN_DLG, handler(this, this._onEventOpenDlg));
        this._signalBlessSuccess = G_SignalManager.add(SignalConst.EVENT_HOME_TREE_BLESS_SUCCESS, handler(this, this._onEventBlessSuccess));
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_HOMELAND']);
        this._lastTotalPower = G_UserData.getBase().getPower();
        this._updatePower();
        G_UserData.getAttr().recordPower();
        this._panelTouch.active = (false);
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    }
    onExit() {
        this._signalHomeTreeUpLevel.remove();
        this._signalHomeTreeUpLevel = null;
        this._signalHomeTreeHarvest.remove();
        this._signalHomeTreeHarvest = null;
        this._signalRecvRoleInfo.remove();
        this._signalRecvRoleInfo = null;
        this._signalOpenHomelandDlg.remove();
        this._signalOpenHomelandDlg = null;
        this._signalBlessSuccess.remove();
        this._signalBlessSuccess = null;
    }
    _onEventRecvRoleInfo() {
        G_UserData.getAttr().recordPower();
    }
    _updatePower() {
        this._fileNodePower.updateUI(HomelandHelp.getAllPower());
        this._fileNodePower.node.x = -this._fileNodePower.getWidth() * 0.5;
    }
    onClickIcon(sender) {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RUNNING_BET);
    }
    _addBaseAttrPromptSummary(summary, typeList) {
        var attrAllList = {};
        var allPower = 0;
        for (var i in typeList) {
            var value = typeList[i];
            var [attrList, power] = HomelandHelp.getSubTreeAttrList(value);
            for (var k in attrList) {
                var attrValue = attrList[k];
                AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value);
            }
            allPower = allPower + power;
        }
        var paramPower = {
            content: HomelandHelp.getPromptPower(allPower),
            anchorPoint: cc.v2(0, 0.5),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR },
            finishCallback: function () {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'HomelandView Summary');
            }
        };
        summary.push(paramPower);
        for (var key in attrAllList) {
            var value = attrAllList[key];
            var param = {
                content: HomelandHelp.getPromptContent(key, value),
                anchorPoint: cc.v2(0, 0.5),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
            };
            summary.push(param);
        }
        return summary;
    }
    _playOpenSubTreeSummary(typeList) {
        var summary = [];
        var openTreeName = '';
        for (var i in typeList) {
            var typeValue = typeList[i];
            var [cfgData] = HomelandHelp.getSelfSubTreeCfg(typeValue);
            openTreeName = openTreeName + cfgData.name;
            if (i != (typeList.length - 1).toString()) {
                openTreeName = openTreeName + ', ';
            }
        }
        var content1 = Lang.get('homeland_open_tree_desc', { name: openTreeName });
        summary.push({ content: content1 });
        this._addBaseAttrPromptSummary(summary, typeList);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary();
    }
    _playAttrSummary(type) {
        var summary = [];
        var [cfgData] = HomelandHelp.getSelfSubTreeCfg(type);
        var content1 = Lang.get('homeland_level_up_desc', {
            name: cfgData.name,
            num: cfgData.level
        });
        summary.push({ content: content1 });
        this._addBaseAttrPromptSummary(summary, [type]);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary();
    }
    _onEventHomeTreeHarvest(id, message) {
        var awards = message['awards'];
        if (awards) {
            G_Prompt.showAwards(awards);
        }
        if (this._mainTree) {
            var mainTree = G_UserData.getHomeland().getMainTree();
            this._mainTree.updateUI(mainTree);
        }
    }
    _onPopupResultClose(event) {
        if (event == 'close') {
            this._popResult = null;
            if (this._popResultSignal) {
                this._popResultSignal.remove();
                this._popResultSignal = null;
            }
            var callfuncTimes = 0;
            let effectFinish = function () {
                if (callfuncTimes == 0) {
                    this._playOpenSubTreeSummary(this._openTreeList);
                    this._updateTreeModel();
                    this._updatePower();
                    callfuncTimes = callfuncTimes + 1;
                }
            }.bind(this);

            if (this._openTreeList && this._openTreeList.length > 0) {
                for (var i in this._openTreeList) {
                    var value = this._openTreeList[i];
                    var treeNode = this['_subTree' + value];
                    if (treeNode) {
                        treeNode.playOpenEffect(effectFinish);
                    }
                }
            } else {
                this._updateTreeModel();
                this._updatePower();
            }
        }
    }
    _onEventHomeTreeUpLevel(id, message) {
        var treeId = message['id'];
        if (treeId == null) {
            return;
        }
        if (treeId == 0) {
            let effectFinish = function () {
                if (this._popResult == null) {
                    PopupHomelandUpResult.getIns(PopupHomelandUpResult, function (p: PopupHomelandUpResult) {
                        p.ctor(this._lastTotalPower);
                        p.open();
                        this._lastTotalPower = G_UserData.getBase().getPower();
                        this._popResult = p;
                        this._popResultSignal = this._popResult.signal.add(handler(this, this._onPopupResultClose));
                    }.bind(this))
                }
                this._panelTouch.active = (false);
            }.bind(this);
            var open_trees = message['open_trees'];
            if (open_trees) {
                this._openTreeList = open_trees;
            }
            this._panelTouch.active = (true);
            this._mainTree.playLvUpEffect(effectFinish);
        } else {
            let effectFinish = function () {
                this._updateTreeModel();
                this._playAttrSummary(treeId);
                this._updatePower();
                this._lastTotalPower = G_UserData.getBase().getPower();
            }.bind(this);
            var treeNode = this['_subTree' + treeId];
            if (treeNode) {
                treeNode.playLvUpEffect(effectFinish);
            }
        }
    }
    _onButtonPreviewClick(sender) {
        PopupHomelandMaterial.getIns(PopupHomelandMaterial, (p: PopupHomelandMaterial) => {
            p.openWithAction();
        })
    }
    _onButtonHandbookClick() {
        G_SceneManager.openPopup('prefab/homeland/PopupHomelandPrayHandbook', (p: PopupHomelandPrayHandbook) => {
            p.open();
        });
    }
    _onButtonClick(sender) {
        //   var funcId = sender.getTag();
        // if (funcId > 0) {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_PET_SHOP);
        //  }
    }
    _onEventOpenDlg(id, dlgType) {
        if (dlgType == null) {
            return;
        }
        if (dlgType == 0) {
            this._mainTree.onBtnAdd();
        } else if (dlgType > 0) {
            var subTree = this['_subTree' + dlgType];
            if (subTree && subTree.isSubTreeOpen()) {
                subTree.onBtnAdd();
            } else {
                var treeCfg = subTree.getTreeCfg();
                G_Prompt.showTip(Lang.get('homeland_main_open_limit', {
                    level: treeCfg.limit_tree_level,
                    name: treeCfg.name
                }));
            }
        }
    }

    _onEventBlessSuccess() {
        this._prayNode.updateRedPoint();
    }
}