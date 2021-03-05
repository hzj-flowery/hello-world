const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonHeroPower from '../../../ui/component/CommonHeroPower'

import CommonMainMenu from '../../../ui/component/CommonMainMenu'
import ViewBase from '../../ViewBase';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { handler } from '../../../utils/handler';
import { G_UserData, Colors, G_SceneManager } from '../../../init';
import { HomelandHelp } from './HomelandHelp';
import { HomelandConst } from '../../../const/HomelandConst';
import HomelandNode from './HomelandNode';
import HomelandMainNode from './HomelandMainNode';
import HomelandGuildList from './HomelandGuildList';
import UIHelper from '../../../utils/UIHelper';
import HomelandPrayNode from './HomelandPrayNode';

@ccclass
export default class HomelandFriendView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _mainNode: cc.Node = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _commonBack: CommonMainMenu = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _playerName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _playerTxt: cc.Label = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _fileNodePower: CommonHeroPower = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonFold: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
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

    _friendId: any;
    _guildListView: any;
    _mainTree: HomelandMainNode;
    _guildListSignal: any;
    _popResult: any;

    onCreate() {
        var params = G_SceneManager.getViewArgs('homelandFriend');
        this._friendId = params[0];
        this._guildListView = null;

        this.setSceneSize();
        this.updateSceneId(2001);
        this._makeBackGroundBottom();
        this._updateTreeModel();
        this._initPrayModel();
        this._commonBack.updateUI(FunctionConst.FUNC_HOMELAND_BACK);
        this._commonBack.addClickEventListenerEx(handler(this, this.onBackToMain));
        this._updatFriendName();
    }
    start() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_HOMELAND);
        this._topbarBase.setImageTitle('txt_big_homeland_01');
    }
    _updatFriendName() {
        var guildData = G_UserData.getHomeland().getGuildMemberByFriendId(this._friendId);
        if (guildData) {
            var official = guildData.getOfficer_level();
            this._playerName.node.color = (Colors.getOfficialColor(official));
            UIHelper.enableOutline(this._playerName, Colors.getOfficialColorOutline(official), 1);
            this._playerName.string = (guildData.getName());
            this._playerName['_updateRenderData'](true);
            var widthName = this._playerName.node.getContentSize().width;
            var widthTxt = this._playerTxt.node.getContentSize().width;
            var center = (widthName + widthTxt) / 2;
            this._playerName.node.x = (widthName - center);
            this._playerTxt.node.x = (widthName - center + 8);
        }
    }
    _updatePower() {
        this._fileNodePower.updateUI(HomelandHelp.getFriendAllPower(this._friendId));
        this._fileNodePower.node.x = -this._fileNodePower.getWidth() * 0.5;
    }
    _updateTreeModel() {
        var groundNode = this.getGroundNode();
        for (var i = 1; i <= HomelandConst.MAX_SUB_TREE; i++) {
            var subTree = G_UserData.getHomeland().getInviteFriendSubTree(this._friendId, i);
            var subNode = groundNode.getChildByName('subNode' + i);
            if (subNode == null) {
                subNode = cc.instantiate(this.homelandNode);
                let comp: HomelandNode = subNode.getComponent(HomelandNode);
                comp.ctor(HomelandConst.FRIEND_TREE)
                subNode.name = ('subNode' + i);
                groundNode.addChild(subNode);
                this['_subTree' + i] = comp;
            }
            if (subTree && subNode) {
                subNode.getComponent(HomelandNode).updateUI(subTree);
            }
        }
        var mainTree = G_UserData.getHomeland().getInviteFriendMainTree(this._friendId);
        var mainNode = groundNode.getChildByName('mainTree');
        if (mainNode == null && mainTree) {

            mainNode = cc.instantiate(this.homelandMainNode);
            this._mainTree = mainNode.getComponent(HomelandMainNode)
            this._mainTree.ctor(HomelandConst.FRIEND_TREE)
            groundNode.addChild(mainNode);
            mainNode.name = ('mainTree');
        }
        this._mainTree.updateUI(mainTree);
    }

    _initPrayModel () {
        var groundNode = this.getGroundNode();
        var prayNode = cc.instantiate(this.homelandPrayNode).getComponent(HomelandPrayNode);
        prayNode.ctor(HomelandConst.FRIEND_TREE, null);
        prayNode.updateRedPoint();
        groundNode.addChild(prayNode.node);
    }

    onButtonFold() {
        this._createGuildList();
    }
    _createGuildList() {
        if (this._guildListView == null) {
            var popup = cc.instantiate(this.homelandGuildList).getComponent(HomelandGuildList);
            popup.ctor(this._friendId);
            popup.node.name = ('HomelandGuildList');
            this.node.addChild(popup.node);
            this._guildListView = popup;
            this._guildListSignal = this._guildListView.signal.add(handler(this, this._onGuildListClose));
            this._popResult = null;
            this._buttonFold.node.active = (false);
        }
    }
    onEnter() {
        this._updatePower();
        this._createGuildList();
    }
    onExit() {
    }
    onBackToMain() {
        G_SceneManager.replaceScene('homeland');
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
}