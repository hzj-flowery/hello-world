const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { GuildConst } from '../../../const/GuildConst';
import { SignalConst } from '../../../const/SignalConst';
import { G_Prompt, G_SceneManager, G_SignalManager, G_UserData, Colors, G_ConfigLoader } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal';
import CommonNormalLargePop3 from '../../../ui/component/CommonNormalLargePop3';
import PopupBase from '../../../ui/PopupBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import GuildCheckApplicationCell from './GuildCheckApplicationCell';
import UIHelper from '../../../utils/UIHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';


@ccclass
export default class PopupGuildCheckApplication extends PopupBase {

    @property({
        type: CommonNormalLargePop3,
        visible: true
    })
    _panelBg: CommonNormalLargePop3 = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonRefuseAll: CommonButtonLevel0Normal = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAdd: cc.Label = null;


    @property({
        type: cc.Label,
        visible: true
    })
    _textSub: cc.Label = null;


    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;


    @property({
        type: cc.Toggle,
        visible: true
    })
    _check1: cc.Toggle = null;
    @property({
        type: cc.Toggle,
        visible: true
    })
    _check2: cc.Toggle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFight: cc.Label = null;

    @property({
        type: cc.EditBox,
        visible: true
    })
    _editbox: cc.EditBox = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _btnAdd: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _btnSub: cc.Node = null;


    _signalGuildGetApplication: any;
    _signalGuildCheckApplication: any;
    _signalGuildSetAutoJion:any
    _curCount: any;
    _maxCount: any;
    _guildApplicationList: any;

    private _checkData: any;
    onCreate() {

        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        // this._panelBg.setTitle(Lang.get('guild_check_application_pop_title'));
        this._panelBg.setTitle("军团审核");
        this._textTip.string = (Lang.get('guild_tip_no_application'));
        // this._listItemSource.setTemplate(GuildCheckApplicationCell);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
        this._buttonRefuseAll.setString(Lang.get('guild_btn_refuse_all'));
        
        var data =  G_UserData.getGuild().getMyMemberData();
        var pos = data.getPosition();
        var config = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_PURVIEW).get(pos);
        this._checkData = {
            checkMode: 1,//1表示自动 2表示手动
            rootLimits:16,//权限大于等于16才可以操作
            fight: 0
        };
       
        
        var purview:string = config["purview"]
	    var purviewIds = purview.split("|")
        if(purviewIds.indexOf("16")>=0)
        {
            this._checkData.rootLimits = 16;
        }
        else
        {
            this._checkData.rootLimits = 1;
        }
        
        UIHelper.enableOutline(this._textSub,new cc.Color(147,65,21));
        UIHelper.enableOutline(this._textAdd,new cc.Color(147,65,21));
    }
    onEnter() {
        this._signalGuildGetApplication = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_APPLICATION, handler(this, this._onEventGuildGetApplication));
        this._signalGuildCheckApplication = G_SignalManager.add(SignalConst.EVENT_GUILD_CHECK_APPLICATION_SUCCESS, handler(this, this._onEventGuildCheckApplicationSuccess));
        this._signalGuildSetAutoJion = G_SignalManager.add(SignalConst.EVENT_GUILD_SET_AUTO_JION,handler(this,this._onEventGuildSetJion))
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
        this.updateView();

        this.initFightSet();

        this._btnAdd.on(cc.Node.EventType.TOUCH_START,this.onTouchAddStart,this);
        this._btnAdd.on(cc.Node.EventType.TOUCH_END,this.onTouchAddEnd,this);
        this._btnAdd.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchAddEnd,this);
        this._btnSub.on(cc.Node.EventType.TOUCH_START,this.onTouchSubStart,this);
        this._btnSub.on(cc.Node.EventType.TOUCH_END,this.onTouchSubEnd,this);
        this._btnSub.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchSubEnd,this);
    }
    onExit() {
        this._signalGuildGetApplication.remove();
        this._signalGuildGetApplication = null;
        this._signalGuildCheckApplication.remove();
        this._signalGuildCheckApplication = null;
        this._signalGuildSetAutoJion.remove();
        this._signalGuildSetAutoJion = null;
        this._btnAdd.off(cc.Node.EventType.TOUCH_START,this.onTouchAddStart,this);
        this._btnAdd.off(cc.Node.EventType.TOUCH_END,this.onTouchAddEnd,this);
        this._btnAdd.off(cc.Node.EventType.TOUCH_CANCEL,this.onTouchAddEnd,this);
        this._btnSub.off(cc.Node.EventType.TOUCH_START,this.onTouchSubStart,this);
        this._btnSub.off(cc.Node.EventType.TOUCH_END,this.onTouchSubEnd,this);
        this._btnSub.off(cc.Node.EventType.TOUCH_CANCEL,this.onTouchSubEnd,this);
        if(this._addHandler)
        {
            this.unschedule(this._addHandler);
            this._addHandler = null
        }
        if(this._subHandler)
        {
            this.unschedule(this._subHandler);
            this._subHandler = null;
        }
    }

    private _addHandler:any;
    private _subHandler:any;
    onTouchAddStart():void{
        this.onBtnAdd();
        if(this._addHandler)
        {
            this.unschedule(this._addHandler);
            this._addHandler = null
        }
        this._addHandler = handler(this,this.onBtnAdd)
        this.schedule(this._addHandler,0.1);
    }
    onTouchSubStart():void{
        this.onBtnSub();
        if(this._subHandler)
        {
            this.unschedule(this._subHandler);
            this._subHandler = null;
        }
        this._subHandler = handler(this,this.onBtnSub)
        this.schedule(this._subHandler,0.1);
    }
    onTouchAddEnd():void{
        if(this._addHandler)
        {
            this.unschedule(this._addHandler);
            this._addHandler = null
        }
    }
    onTouchSubEnd():void{
        if(this._subHandler)
        {
            this.unschedule(this._subHandler);
            this._subHandler = null;
        }
    }
    updateView() {
        G_UserData.getGuild().c2sGetGuildApplication();
       
    }
    _updateInfo() {
        this._updateList();
        var myGuild = G_UserData.getGuild().getMyGuild();
        var level = G_UserData.getGuild().getMyGuildLevel();
        var power = myGuild.getAuto_jion_power();
        var auto = !myGuild.isAuto_jion();
        this._checkData.checkMode = auto==true?1:2;
        var fi = parseInt(power)/10000;
        this._checkData.fight = Math.floor(fi);



        this.initFightSet();
    }
    _updateList() {
        this._guildApplicationList = G_UserData.getGuild().getGuildApplicationListBySort();
        if (this._guildApplicationList.length == 0) {
            this._listItemSource.node.active = (false);
            this._textTip.node.active = (true);
        } else {
            this._textTip.node.active = (false);
            this._listItemSource.node.active = (true);

            this._listItemSource.content.removeAllChildren();
            this._listItemSource.content.height = 0;

            for (let i = 0; i < this._guildApplicationList.length; i++) {
                if (this._guildApplicationList[i]) {
                    var resource = cc.resources.get("prefab/guild/GuildCheckApplicationCell");
                    var node1 = cc.instantiate(resource) as cc.Node;
                    let cell = node1.getComponent(GuildCheckApplicationCell) as GuildCheckApplicationCell;
                    this._listItemSource.content.addChild(cell.node);
                    cell.setCustomCallback(handler(this, this._onItemTouch))
                    cell.setIdx(i);
                    cell.updateData(this._guildApplicationList[i]);
                    cell.node.y = (i + 1) * -90;
                    this._listItemSource.content.setContentSize(this._listItemSource.content.getContentSize().width, this._listItemSource.content.getContentSize().height + 90);
                }
            }
            this._listItemSource.scrollToTop();
        }
    }
    _onItemUpdate(item, index) {
        if (this._guildApplicationList[index]) {
            item.update(this._guildApplicationList[index]);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, type) {
        var data = this._guildApplicationList[index];
        var id = data.getUid();
        if (type == GuildConst.GUILD_CHECK_APPLICATION_OP1) {
            var isGuildWarRunning = G_UserData.getLimitTimeActivity().isActivityOpen(FunctionConst.FUNC_GUILD_WAR);
            if (isGuildWarRunning) {
                G_Prompt.showTip(Lang.get('guild_tip_approval_forbid_when_guildwar'));
                return;
            }
            if (this._curCount >= this._maxCount) {
                G_Prompt.showTip(Lang.get('guild_tip_member_count_max'));
                return;
            }
        }
        G_UserData.getGuild().c2sGuildCheckApplication(id, type);
    }
    _onEventGuildSetJion(event,data):void{
          G_Prompt.showTip("军团审核设置成功");
    }
    _onEventGuildCheckApplicationSuccess(eventName, op, applicationId) {
        G_Prompt.showTip(Lang.get('guild_tip_application_op_' + (op.toString())));
        G_UserData.getGuild().deleteApplicationDataWithId(applicationId);
        this.updateView();
    }
    _onEventGuildGetApplication(eventName) {
        this._updateInfo();
    }
    _onClickClose() {
        this.close();
    }
    _onButtonRefuseAll(render) {
        var count = G_UserData.getGuild().getGuildMemberCount();
        if (count <= 0) {
            return;
        }
        G_UserData.getGuild().c2sGuildCheckApplication(0, GuildConst.GUILD_CHECK_APPLICATION_OP2);
    }

    onBtnAdd(): void {
        if(this._checkData.rootLimits!=16)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }
        this._checkData.fight++;
        if (this._checkData.fight < 0) {
            this._checkData.fight = 0;
        }
        this._editbox.string = this._checkData.fight ;
    }

    onBeganEditBox():void{
        if(this._checkData.rootLimits!=16)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }

        this._editbox.textLabel.string = "";
        this._editbox.string = "";
    }

    onInsertEditBox():void{
        
    }

    onEndEditBox():void{
        if(this._checkData.rootLimits!=16)
        {
             return;
        }

        var str = this._editbox.string;
        str = str.replace("万","");
        var setN= Math.floor(parseInt(str));
        console.log("输入的数据------",str);
        if(setN<0||str=="")
        {
            //不满足输入的条件
        }
        else
        {
            this._checkData.fight = setN;
        }
        this._editbox.string = this._checkData.fight;
    }

    private initFightSet():void{
        this._editbox.textLabel.string = this._checkData.fight;
        this._editbox.string = ""; 

        if(this._checkData.checkMode==1)
        {
            //默认开启自动
            this._check1.isChecked = true;
            this._check2.isChecked = false;
        }
        else
        {
            this._check1.isChecked = false;
            this._check2.isChecked = true;
        }
        this.onEndEditBox();
    }

    onBtnSub(): void {

        if(this._checkData.rootLimits!=16)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }

        this._checkData.fight--;
        if (this._checkData.fight < 0) {
            this._checkData.fight = 0;
        }
        this._editbox.string = this._checkData.fight;
    }

    onBtnCheckManul(target:cc.Toggle): void {

        if(this._checkData.rootLimits!=16)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }

        if(target.isChecked)
        {
            //开启手动
            this._checkData.checkMode = 2;
            //关闭自动
            this._check1.uncheck();
        }
        else
        {
            this._check1.isChecked = true;
            this._checkData.checkMode = 1;
        }
    }
    onBtnCheckAuto(target:cc.Toggle): void {

        if(this._checkData.rootLimits!=16)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }

        if(target.isChecked)
        {   
           //开启自动
           this._checkData.checkMode = 1;
           this._check2.uncheck();
        }
        else
        {
            this._check2.isChecked = true;
            this._checkData.checkMode = 2;
        }
    }
    onBthConfirm():void{
        if(this._checkData.rootLimits!=16)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }
        console.log(this._checkData);
        G_UserData.getGuild().c2sGuildSetAutoJion(this._checkData.fight*10000,this._checkData.checkMode==1?0:1);
    }

}