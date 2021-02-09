const {ccclass, property} = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonHelp from '../../../ui/component/CommonHelp'

import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical'

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonFullScreen from '../../../ui/component/CommonFullScreen'

import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import ViewBase from '../../ViewBase';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { Colors, G_ConfigLoader, G_SignalManager, G_SceneManager, G_UserData, G_Prompt } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SignalConst } from '../../../const/SignalConst';
import { FriendConst } from '../../../const/FriendConst';
import { ReportParser } from '../../../fight/report/ReportParser';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { EnemyHelper } from './EnemyHelper';
import FriendList from './FriendList';
import FriendEnemyList from './FriendEnemyList';
import FriendEnergyList from './FriendEnergyList';
import FriendBlackList from './FriendBlackList';
import PopupEnemyLog from './PopupEnemyLog';

@ccclass
export default class FriendView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _contentNode: cc.Node = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _emptyNode: CommonEmptyListNode = null;

    @property({
        type: CommonTabGroupVertical,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupVertical = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property(cc.Prefab)
    FriendList:cc.Prefab = null;

    @property(cc.Prefab)
    FriendEnemyList:cc.Prefab = null;

    @property(cc.Prefab)
    FriendEnergyList:cc.Prefab = null;

    @property(cc.Prefab)
    FriendBlackList:cc.Prefab = null;
    
    _targetTabIndex: number = 1;
    _isPopEnemyLog: any;
    _curSelectTabIndex: number;
    _isFirstEnter: boolean;
    _tabNames: string[];
    _maxFriendNum: number;
    _getEnergyNumParameter: number;
    _signalGetFriendList: any;
    _signalApply: any;
    _signalDelFriend: any;
    _signalAddFriend: any;
    _signalGivePresent: any;
    _signalGetPresent: any;
    _signalRedPointUpdate: any;
    _signalEnemyList: any;
    _signalDeleteEnemy: any;
    _signalBattleEnemy: any;
    _friendListView: FriendList;
    _blackListView: any;
    _energyListView: any;
    _enemyListView: any;


    ctor(selectIndex, isPopEnemyLog) {
        this._targetTabIndex = selectIndex||1;
        this._isPopEnemyLog = isPopEnemyLog||false;
        this._curSelectTabIndex = -1;
        this._isFirstEnter = true;
    }
    onCreate() {
        var data = G_SceneManager.getViewArgs();
        this.ctor(data[0],data[1]);

        this.setSceneSize();
        this._topbarBase.setImageTitle('txt_sys_com_haoyou');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_PVP);
        this._tabNames = [
            Lang.get('lang_friend_tab1_name'),
            Lang.get('lang_friend_tab2_name'),
            Lang.get('lang_friend_tab3_name'),
            Lang.get('lang_friend_tab4_name')
        ];
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: this._tabNames
        };
        this._commonFullScreen.setPrefixCountColor(Colors.DARK_BG_THREE);
        this._commonFullScreen.setCountColor(Colors.NUMBER_WHITE);
        this._commonFullScreen.setCountSize(18);
        var Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);//require('app.config.parameter');
        this._maxFriendNum = parseInt(Parameter.get(127).content) || 0;
        this._getEnergyNumParameter = parseInt(Parameter.get(129).content) || 0;
        this._nodeTabRoot.recreateTabs(param);
        this._nodeTabRoot.setTabIndex(this._targetTabIndex-1);
        this._refreshRedPoint();
    }
    onEnter() {
        this._signalGetFriendList = G_SignalManager.add(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS, handler(this, this._onGetFriendList));
        this._signalApply = G_SignalManager.add(SignalConst.EVENT_CONFIRM_ADD_FRIEND_SUCCESS, handler(this, this._onApply));
        this._signalDelFriend = G_SignalManager.add(SignalConst.EVENT_DEL_FRIEND_SUCCESS, handler(this, this._onDelFriend));
        this._signalAddFriend = G_SignalManager.add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(this, this._onAddFriend));
        this._signalGivePresent = G_SignalManager.add(SignalConst.EVENT_FRIEND_PRESENT_SUCCESS, handler(this, this._onGivePresent));
        this._signalGetPresent = G_SignalManager.add(SignalConst.EVENT_GET_FRIEND_PRESENT_SUCCESS, handler(this, this._onGetPresent));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalEnemyList = G_SignalManager.add(SignalConst.EVENT_GET_ENEMY_LIST_SUCCESS, handler(this, this._onEventEnemyList));
        this._signalDeleteEnemy = G_SignalManager.add(SignalConst.EVENT_DEL_ENEMY_SUCCESS, handler(this, this._onEventDeleteEnemy));
        this._signalBattleEnemy = G_SignalManager.add(SignalConst.EVENT_ENEMY_BATTLE_SUCCESS, handler(this, this._onEventEnemyBattle));
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
        this._updateTabContent();
        if (this._isPopEnemyLog) {
            PopupEnemyLog.popupEnemyLog();
            this._isPopEnemyLog = null;
        }
    }
    _requestData() {
        if (this._curSelectTabIndex == FriendConst.ENEMY_LIST) {
            G_UserData.getEnemy().requestEnemysData();
        } else {
            G_UserData.getFriend().requestFriendData();
        }
    }
    onExit() {
        this._signalGetFriendList.remove();
        this._signalGetFriendList = null;
        this._signalApply.remove();
        this._signalApply = null;
        this._signalDelFriend.remove();
        this._signalDelFriend = null;
        this._signalAddFriend.remove();
        this._signalAddFriend = null;
        this._signalGivePresent.remove();
        this._signalGivePresent = null;
        this._signalGetPresent.remove();
        this._signalGetPresent = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalEnemyList.remove();
        this._signalEnemyList = null;
        this._signalDeleteEnemy.remove();
        this._signalDeleteEnemy = null;
        this._signalBattleEnemy.remove();
        this._signalBattleEnemy = null;
    }
    onCleanup() {
        G_UserData.getFriend().cleanDatas();
        G_UserData.getEnemy().cleanDatas();
    }
    _onTabSelect(index, sender) {
        if (this._curSelectTabIndex == index+1) {
            return;
        }
        this._curSelectTabIndex = index+1;
        this._requestData();
        var title = this._tabNames[this._curSelectTabIndex-1];
        var name = '';
        if(title.length == 2){
            name+=title[0];
            name+='   ';
            name+=title[1];
        }else{
            name = title;
        }
        this._commonFullScreen.setTitle(name);
        this._updateTabContent();
    }
    _onGetFriendList(event) {
        this._updateTabContent();
    }
    _onDelFriend(event, message) {
        this._updateTabContent();
    }
    _onAddFriend(event, message) {
        var friend_type = (message['friend_type']);
        if (friend_type) {
            if (friend_type == FriendConst.FRIEND_ADD_BLACK_TYPE) {
                this._updateTabContent();
            } else if (friend_type == FriendConst.FRIEND_ADD_FRIEND_TYPE) {
                G_Prompt.showTip(Lang.get('lang_friend_apply_success_tip'));
            }
        }
    }
    _onGivePresent(event) {
        G_Prompt.showTip(Lang.get('lang_friend_give_energy_success'));
        this._updateTabContent();
    }
    _onGetPresent(event, getNum) {
        G_Prompt.showTip(Lang.get('lang_friend_get_energy_success', { num: getNum * this._getEnergyNumParameter }));
        this._updateTabContent();
    }
    _onApply(event, message) {
        var accept = (message['accept']);
        if (accept) {
            G_Prompt.showTip(Lang.get('lang_friend_confirm_accept_success'));
        } else {
            G_Prompt.showTip(Lang.get('lang_friend_confirm_refuse_success'));
        }
    }
    _onEventEnemyList() {
        this._updateTabContent();
    }
    _onEventDeleteEnemy() {
        this._updateTabContent();
    }
    _onEventEnemyBattle(event, message) {
        if (message == null) {
            return;
        }
        function enterFightView(message) {
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseEnemyRevenge(message);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        G_SceneManager.registerGetReport(message.report, function () {
            enterFightView(message);
        });
        G_UserData.getEnemy().requestEnemysData();
    }
    _udpateFriendListView() {
        if (!this._friendListView) {
            this._friendListView = cc.instantiate(this.FriendList).getComponent(FriendList);
            this._contentNode.addChild(this._friendListView.node);
        }
        var friendData = G_UserData.getFriend().getFriendsData();
        var friendNum = friendData.length;
        if (friendNum == 0) {
            this._emptyNode.node.active = (true);
            this._emptyNode.setTipsString(Lang.get('lang_friend_empty_friend'));
        }
        this._commonFullScreen.showCount(true);
        this._commonFullScreen.setPrefixCountText(Lang.get('lang_friend_tab1_name') + ':');
        this._commonFullScreen.setCount(friendNum + ('/' + this._maxFriendNum));
        this._friendListView.updateView(friendData);
        this._commonHelp.node.active = (false);
    }
    _updateFriendBlackView() {
        if (!this._blackListView) {
            // var FriendBlackList = require('FriendBlackList');
            this._blackListView = cc.instantiate(this.FriendBlackList).getComponent(FriendBlackList);
            this._contentNode.addChild(this._blackListView.node);
        }
        var blackData = G_UserData.getFriend().getBlackData();
        if (blackData.length == 0) {
            this._emptyNode.node.active = (true);
            this._emptyNode.setTipsString(Lang.get('lang_friend_empty_black'));
        }
        this._commonFullScreen.showCount(false);
        this._blackListView.updateView(blackData);
        this._commonHelp.node.active = (false);
    }
    _updateFriendEnergyView() {
        if (!this._energyListView) {
            // var FriendEnergyList = require('FriendEnergyList');
            this._energyListView = cc.instantiate(this.FriendEnergyList).getComponent(FriendEnergyList);
            this._contentNode.addChild(this._energyListView.node);
        }
        var friendData = G_UserData.getFriend().getEnergyData();
        var curGetnum = G_UserData.getFriend().getPresentNum();
        var friendNum = friendData.length;
        if (friendData.length == 0) {
            this._emptyNode.node.active = (true);
            this._emptyNode.setTipsString(Lang.get('lang_friend_empty_energy'));
        }
        this._commonFullScreen.showCount(false);
        this._energyListView.updateView(friendData, curGetnum);
        this._commonHelp.node.active = (false);
    }
    _updateEnemyListView() {
        if (!this._enemyListView) {
            this._enemyListView = cc.instantiate(this.FriendEnemyList).getComponent(FriendEnemyList);
            this._contentNode.addChild(this._enemyListView.node);
        }
        var enemysData = G_UserData.getEnemy().getEnemysData();
        if (enemysData.length == 0) {
            this._emptyNode.node.active = (true);
            this._emptyNode.setTipsString(Lang.get('lang_friend_empty_enemy'));
        }
        this._commonFullScreen.showCount(true);
        this._commonFullScreen.setPrefixCountText(Lang.get('lang_friend_tab2_name') + ':');
        this._commonFullScreen.setCount(enemysData.length + ('/' + EnemyHelper.getMaxEnemyNum()));
        this._enemyListView.updateView();
        this._commonHelp.node.active = (true);
        this._commonHelp.updateLangName('ENEMY_REVENGE_HELP');
    }
    _updateTabContent() {
        if (this._friendListView) {
            this._friendListView.node.active = (this._curSelectTabIndex == FriendConst.FRIEND_LIST);
        }
        if (this._energyListView) {
            this._energyListView.node.active = (this._curSelectTabIndex == FriendConst.FRIEND_ENERGY);
        }
        if (this._blackListView) {
            this._blackListView.node.active = (this._curSelectTabIndex == FriendConst.FRIEND_BLACK);
        }
        if (this._enemyListView) {
            this._enemyListView.node.active = (this._curSelectTabIndex == FriendConst.ENEMY_LIST);
        }
        this._emptyNode.node.active = (false);
        if (this._curSelectTabIndex == FriendConst.FRIEND_LIST) {
            this._udpateFriendListView();
        } else if (this._curSelectTabIndex == FriendConst.FRIEND_ENERGY) {
            this._updateFriendEnergyView();
        } else if (this._curSelectTabIndex == FriendConst.FRIEND_BLACK) {
            this._updateFriendBlackView();
        } else if (this._curSelectTabIndex == FriendConst.ENEMY_LIST) {
            this._updateEnemyListView();
        }
    }
    _refreshRedPoint() {
        this._nodeTabRoot.setRedPointByTabIndex(FriendConst.FRIEND_LIST, G_UserData.getFriend().hasApplyRedPoint());
        this._nodeTabRoot.setRedPointByTabIndex(FriendConst.FRIEND_ENERGY, G_UserData.getFriend().hasGetEnergyRedPoint());
        if (this._friendListView) {
            this._friendListView.updateRedPoint();
        }
    }
    _onEventRedPointUpdate() {
        this._refreshRedPoint();
    }

}
