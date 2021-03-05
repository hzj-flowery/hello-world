const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import { GuildConst } from '../../../const/GuildConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { G_ConfigLoader, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonEdit from '../../../ui/component/CommonButtonEdit';
import CommonButtonTriggle from '../../../ui/component/CommonButtonTriggle';
import PopupAlert from '../../../ui/PopupAlert';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import GuildTaskBoxNodeHelper from './GuildTaskBoxNodeHelper';
import GuildTaskItemCell from './GuildTaskItemCell';
import PopupGuildAnnouncement from './PopupGuildAnnouncement';
import PopupGuildChangeName from './PopupGuildChangeName';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import PopupGuildSetWechatQQ from './PopupGuildSetWechatQQ';


@ccclass
export default class GuildHallBaseInfoNode extends ViewBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textAnnouncement: cc.Label = null;

    @property({
        type: CommonButtonEdit,
        visible: true
    })
    _buttonModifyAnnouncement: CommonButtonEdit = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDeclaration: cc.Label = null;

    @property({
        type: CommonButtonEdit,
        visible: true
    })
    _buttonModifyDeclaration: CommonButtonEdit = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource2: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _boxNode: cc.Node = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarProgress: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLeaderName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMemberNumber: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _editName: cc.Sprite = null;

    @property({
        type: CommonButtonTriggle,
        visible: true
    })
    _buttonLogout: CommonButtonTriggle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textElderName2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textElderName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMateName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textWxQQ: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textWxQQName: cc.Label = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnSet: CommonButtonLevel0Highlight = null;

    _taskBoxHelper: GuildTaskBoxNodeHelper;
    _signalSetGuildMessage: any;
    _signalGuildBaseInfoUpdate: any;
    _signalGuildBoxReward: any;
    _signalGuildNameChange: any;
    _signalGuildGetUserGuild: any;
    _myGuild: any;
    _canDissolve: any;
    _canSetAnnouncement: any;
    _canSetDeclaration: any;
    _canModifyGuildName: any;
    _guildTaskList: any;
    private _signalSetWeChatQQ:any;

    onCreate() {
        // this._listItemSource2.setTemplate(GuildTaskItemCell);
        // this._listItemSource2.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource2.setCustomCallback(handler(this, this._onItemTouch));
        this._taskBoxHelper = new GuildTaskBoxNodeHelper(this._boxNode);
    }
    onEnter() {
        this._signalGuildBaseInfoUpdate = G_SignalManager.add(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE, handler(this, this._onEventGuildBaseInfoUpdate));
        this._signalSetGuildMessage = G_SignalManager.add(SignalConst.EVENT_GUILD_SET_MESSAGE_SUCCESS, handler(this, this._onEventSetGuildMessage));
        this._signalGuildBoxReward = G_SignalManager.add(SignalConst.EVENT_GUILD_BOX_REWARD, handler(this, this._onEventGuildBoxReward));
        this._signalGuildNameChange = G_SignalManager.add(SignalConst.EVENT_GUILD_NAME_CHANGE, handler(this, this._onEventGuildNameChange));
        this._signalGuildGetUserGuild = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(this, this._onEventGuildGetUserGuild));
        this._signalSetWeChatQQ = G_SignalManager.add(SignalConst.EVENT_GUILD_SET_WE_QQ_ADDRESS,this._onEventSetAddress.bind(this))
        this._btnSet.addClickEventListenerEx(handler(this,this.onBtnShowSetWxQQ));

        var data =  G_UserData.getGuild().getMyMemberData();
         var pos = data.getPosition();
         var config = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_PURVIEW).get(pos);
         var purview:string = config["purview"]
         var purviewIds = purview.split("|")
         if(purviewIds.indexOf("17")>=0)
         {
            this._isTuanZhang = true;
         }
         else
         {
            this._isTuanZhang = false;
         }

        this.updateWXQQUI();
    }
    private _isTuanZhang:boolean = false;
    private _isSetedWx:boolean = false;
    private _isSetedQQ:boolean = false;
    private updateWXQQUI():void{

        var adress:string = G_UserData.getGuild().getMyGuild().getAddress();
        var adress_type = G_UserData.getGuild().getMyGuild().getAddress_type();

        var str = "";
        if(adress.length>8)
        {
            str = adress.substring(0,7)+"..."
        }
        else
        {
            str = adress;
        }

        if(this._isTuanZhang)
        {
            this._btnSet.setString("设置");
        }
        else
        {
            this._btnSet.setString("复制");
        }
        if(adress=="")
        {
            this._textWxQQName.string = "团长微信:";
            this._textWxQQ.string = "暂未设置";
            this._isSetedWx = false;
            this._isSetedQQ = false;
            
        }
        else if(adress_type==0)
        {
            this._textWxQQName.string = "团长微信:";

            this._textWxQQ.string = str;
            this._isSetedWx = true;
            this._isSetedQQ = false;
            
        }
        else
        {
            this._textWxQQName.string = "军团Q群:";
            this._textWxQQ.string = str;
            this._isSetedWx = false;
            this._isSetedQQ = true;
        }
    }
    onExit() {
        this._signalGuildBaseInfoUpdate.remove();
        this._signalGuildBaseInfoUpdate = null;
        this._signalSetGuildMessage.remove();
        this._signalSetGuildMessage = null;
        this._signalGuildBoxReward.remove();
        this._signalGuildBoxReward = null;
        this._signalGuildNameChange.remove();
        this._signalGuildNameChange = null;
        this._signalGuildGetUserGuild.remove();
        this._signalGuildGetUserGuild = null;
        this._signalSetWeChatQQ.remove();
        this._signalSetWeChatQQ = null;
    }
    private _onEventSetAddress():void{
        this.updateWXQQUI();
    }
    copyContentToClipboard(content:string,tips:string):void{
        if(cc.sys.platform == cc.sys.WECHAT_GAME)
        {
                wx.setClipboardData({
                data: content,
                success: function(res) {
                  // self.setData({copyTip:true}),
                  G_Prompt.showTip(tips);
                }
              });
            
        }
        else 
		{
            var webCopyString = function(str){
                console.log('复制');
            
                var input = str + '';
                const el = document.createElement('textarea');
                el.value = input;
                el.setAttribute('readonly', '');
                el.style.contain = 'strict';
                el.style.position = 'absolute';
                el.style.left = '-9999px';
                el.style.fontSize = '12pt'; // Prevent zooming on iOS
            
                const selection = getSelection();
                var originalRange = false;
                if (selection.rangeCount > 0) {
                    originalRange = selection.getRangeAt(0);
                }
                document.body.appendChild(el);
                el.select();
                el.selectionStart = 0;
                el.selectionEnd = input.length;
            
                var success = false;
                try {
                    success = document.execCommand('copy');
                } catch (err) {}
            
                document.body.removeChild(el);
            
                if (originalRange) {
                    selection.removeAllRanges();
                    selection.addRange(originalRange);
                }
            
                return success;
            }
            if(webCopyString(content))
            {
                G_Prompt.showTip(tips); 
            }
        }

    }
    onBtnShowSetWxQQ():void{
        if(this._isTuanZhang)
        {
            G_SceneManager.showDialog("prefab/guild/PopupGuildSetWechatQQ",function(pop:PopupGuildSetWechatQQ){
               pop.open();
         })
        }
        else
        {
            var adress:string = G_UserData.getGuild().getMyGuild().getAddress();
            if(this._isSetedWx)
            {
                this.copyContentToClipboard(adress,"复制成功,快去添加团长微信叭");
            }
            else if(this._isSetedQQ)
            {
                this.copyContentToClipboard(adress,"复制成功,快去添加军团Q群叭");
            }
            else
            {
                
                G_Prompt.showTip("复制失败，快联系团长让他设置团长微信或军团Q群叭");
            }
        }
    }
    updateView() {
        G_UserData.getGuild().c2sGetGuildBase();
    }
    _updateInfo() {
        this._myGuild = G_UserData.getGuild().getMyGuild();
        // assert(this._myGuild, 'G_UserData:getGuild():getMyGuild() = nil');
        var icon = this._myGuild.getIcon();
        var iconRes = Path.getCommonIcon('guild', icon);
        var name = this._myGuild.getName();
        var level = G_UserData.getGuild().getMyGuildLevel();
        var exp = G_UserData.getGuild().getMyGuildExp();
        var needExp = GuildDataHelper.getGuildLevelUpNeedExp(level);
        var names = GuildDataHelper.getGuildLeaderNames();
        var leaderName = names.leaderName || Lang.get('guild_leader_name_default');
        var mateName = names.mateName || Lang.get('guild_leader_name_default');
        var elderName = names.elderNames && names.elderNames[1] || Lang.get('guild_leader_name_default');
        var elderName2 = names.elderNames && names.elderNames[2] || Lang.get('guild_leader_name_default');
        var memberNumber = this._myGuild.getMember_num();
        var maxMember = GuildDataHelper.getGuildMaxMember(level);
        var announcement = GuildDataHelper.getGuildAnnouncement();
        var declaration = GuildDataHelper.getGuildDeclaration(this._myGuild);
        var guildRank = this._myGuild.getGuild_rank();
        this._textName.string = (name);
        this._textLevel.string = (Lang.get('guild_hall_level', { level: level }));
        this._loadingBarProgress.progress = (exp / needExp);
        this._textProgress.string = (exp + ('/' + needExp));
        this._textLeaderName.string = (leaderName);
        this._textMateName.string = (mateName);
        this._textElderName.string = (elderName);
        this._textElderName2.string = (elderName2);
        this._textMemberNumber.string = (memberNumber + ('/' + maxMember));
        this._textAnnouncement.string = (announcement);
        this._textDeclaration.string = (declaration);
        this._textRank.string = (guildRank.toString());
        this._updateBtnState();
        this._updateList();
        this._taskBoxHelper.refreshBoxView();
    }

    update() {
        let a = this._loadingBarProgress.progress;
    }

    _updateBtnState() {
        var userMemberData = G_UserData.getGuild().getMyMemberData();
        var myPosition = userMemberData.getPosition();
        this._canDissolve = GuildDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_1);
        this._canSetAnnouncement = GuildDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_7);
        this._canSetDeclaration = GuildDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_8);
        this._canModifyGuildName = GuildDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_10);
        if (this._canDissolve) {
            this._buttonLogout.setString(Lang.get('guild_btn_dissolve'));
        } else {
            this._buttonLogout.setString(Lang.get('guild_btn_logout'));
        }
        this._buttonModifyAnnouncement.node.active = (this._canSetAnnouncement);
        this._buttonModifyDeclaration.node.active = (this._canSetDeclaration);
        this._editName.node.active = (this._canModifyGuildName);
        // this._imageNameBg.setTouchEnabled(this._canModifyGuildName);
    }

    private callbackOK() {
        G_UserData.getGuild().c2sGuildDismiss();
    }

    private callbackOK2() {
        G_UserData.getGuild().c2sGuildLeave();
    }

    _onButtonLogout() {
        if (this._canDissolve) {
            var count = G_UserData.getGuild().getGuildMemberCount();
            if (count > 1) {
                G_Prompt.showTip(Lang.get('guild_tip_can_not_dissolve'));
                return;
            }
            var content = Lang.get('guild_dissolve_hint');
            var title = Lang.get('guild_appoint_confirm_title');

            var resource = cc.resources.get("prefab/common/PopupAlert");
            var node1 = cc.instantiate(resource) as cc.Node;
            let cell = node1.getComponent(PopupAlert);
            cell.init(title, content, this.callbackOK);
            cell.openWithAction();
        } else {
            var userMemberData = G_UserData.getGuild().getMyMemberData();
            var time = userMemberData.getTime();
            if (!GuildDataHelper.checkCanQuitGuild(time)) {
                return;
            }
            var timeLimit = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.GUILD_QUIT_CD_ID).content);
            var timeStr = G_ServerTime.getDayOrHourOrMinFormat(timeLimit);
            var content = Lang.get('guild_leave_hint', { time: timeStr });
            var title = Lang.get('guild_appoint_confirm_title');

            var resource = cc.resources.get("prefab/common/PopupAlert");
            var node1 = cc.instantiate(resource) as cc.Node;
            let cell = node1.getComponent(PopupAlert);
            cell.init(title, content, this.callbackOK2);
            cell.openWithAction();
        }
    }
    onButtonModifyAnnouncement() {
        var popup: PopupGuildAnnouncement = Util.getNode('prefab/guild/PopupGuildAnnouncement', PopupGuildAnnouncement);
        popup.initData(handler(this, this._onSaveAnnouncement));
        popup.setTitle(Lang.get('guild_title_announcement'));
        popup.openWithAction();
        var content = UserDataHelper.getGuildAnnouncement();
        popup.setContent(content);
    }
    onButtonModifyDeclaration() {
        var popup: PopupGuildAnnouncement = Util.getNode('prefab/guild/PopupGuildAnnouncement', PopupGuildAnnouncement);
        popup.initData(handler(this, this._onSaveDeclaration));
        popup.setTitle(Lang.get('guild_title_declaration'));
        var content = UserDataHelper.getGuildDeclaration();
        popup.setContent(content);
        popup.openWithAction();
    }
    _onSaveAnnouncement(content) {
        G_UserData.getGuild().c2sSetGuildMessage(content, GuildConst.GUILD_MESSAGE_TYPE_1);
    }
    _onSaveDeclaration(content) {
        G_UserData.getGuild().c2sSetGuildMessage(content, GuildConst.GUILD_MESSAGE_TYPE_2);
    }
    _onEventSetGuildMessage(eventName, type) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        if (type == GuildConst.GUILD_MESSAGE_TYPE_1) {
            var content = GuildDataHelper.getGuildAnnouncement();
            this._textAnnouncement.string = (content);
            G_Prompt.showTip(Lang.get('guild_announcement_change_success'));
        } else if (type == GuildConst.GUILD_MESSAGE_TYPE_2) {
            var content = GuildDataHelper.getGuildDeclaration(null);
            this._textDeclaration.string = (content);
            G_Prompt.showTip(Lang.get('guild_declaration_change_success'));
        }
    }
    onButtonModifyName(sender) {
        if (!this._canModifyGuildName) {
            return
        }
        var callback = function (guildName) {
            G_UserData.getGuild().c2sGuildChangeName(guildName);
        };

        var popup: PopupGuildChangeName = Util.getNode('prefab/guild/PopupGuildChangeName', PopupGuildChangeName);
        popup.updateUI(Lang.get('guild_change_name_title'), Lang.get('guild_change_name_hint'), {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND,
            size: parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.GUILD_RENAME_COST)["content"])
        }, callback.bind(this));
        popup.openWithAction();
    }
    _dismissSuccess() {
        G_Prompt.showTip(Lang.get('guild_tip_dismiss_success'));
        G_SceneManager.popScene();
    }
    _updateList() {
        this._guildTaskList = G_UserData.getGuild().getMyGuild().getSortedTaskDataList();
        if (this._listItemSource2.content.childrenCount > 0) {
            for(let i = 0; i < this._listItemSource2.content.childrenCount;i++){
                if(this._guildTaskList[i]){
                    let cell = this._listItemSource2.content.children[i].getComponent(GuildTaskItemCell) as GuildTaskItemCell;
                    cell.updateUI(this._guildTaskList[i]);
                }
            }
        }
        else {
            this._listItemSource2.content.removeAllChildren();
            this._listItemSource2.content.height = 0;
            //更新任务的数据
            for (let i = 0; i < this._guildTaskList.length; i++) {
                if (this._guildTaskList[i]) {
                    var resource = cc.resources.get("prefab/guild/GuildTaskItemCell");
                    var node1 = cc.instantiate(resource) as cc.Node;
                    let cell = node1.getComponent(GuildTaskItemCell) as GuildTaskItemCell;
                    this._listItemSource2.content.addChild(cell.node);
                    cell.node.y = (i + 1) * -120;
                    cell.updateUI(this._guildTaskList[i]);
                    this._listItemSource2.content.setContentSize(this._listItemSource2.content.getContentSize().width, this._listItemSource2.content.getContentSize().height + 120);
                }
            }
            this._listItemSource2.scrollToTop();
        }
    }
    _onItemUpdate(item, index) {
        if (this._guildTaskList[index]) {
            item.updateItem(index, this._guildTaskList[index]);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(lineIndex, index) {
        var data = this._guildTaskList[index];
        if (!data) {
            return;
        }
    }
    _onEventGuildBoxReward(event, rewards) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._taskBoxHelper.refreshBoxView();
        if (rewards) {
            G_Prompt.showAwards(rewards);
        }
    }
    _onEventGuildBaseInfoUpdate(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateInfo();
    }
    _onEventGuildNameChange(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        G_Prompt.showTip(Lang.get('guild_tip_change_name_success'));
    }
    _onEventGuildGetUserGuild(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateInfo();
    }

}