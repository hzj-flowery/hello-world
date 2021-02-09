import PopupBase from "../../../ui/PopupBase";
import CommonNormalSmallPop2 from "../../../ui/component/CommonNormalSmallPop2";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import { G_Prompt, G_UserData, G_ConfigLoader, G_SignalManager } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { handler } from "../../../utils/handler";
import { SignalConst } from "../../../const/SignalConst";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupGuildSetWechatQQ extends PopupBase {
    @property({
        type: CommonNormalSmallPop2,
        visible: true
    })
    _commonNarmalSmallPop: CommonNormalSmallPop2 = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnConfirm: CommonButtonLevel0Highlight = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _inputText: cc.Label = null;
    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkWechat: cc.Toggle = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkQQ: cc.Toggle = null;

    @property({
        type: cc.EditBox,
        visible: true
    })
    _editbox: cc.EditBox = null;

    private _checkData:any;
    private _signalSetWeChatQQ:any;
    onCreate():void{
         this._checkData = {};
         
         this._checkData.checkMode = 1;//1表示微信2表示qq
         this._checkData.account = "";//账户
         var data =  G_UserData.getGuild().getMyMemberData();
         var pos = data.getPosition();
         var config = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_PURVIEW).get(pos);
         var purview:string = config["purview"]
         var purviewIds = purview.split("|")
         if(purviewIds.indexOf("17")>=0)
         {
             this._checkData.rootLimits = 17;
         }
         else
         {
             this._checkData.rootLimits = 1;
         }


         this.updateUI();
    }
    onEnter():void{
        this._btnConfirm.setString("确认");
        this._commonNarmalSmallPop.addCloseEventListener(handler(this,this._onclose));
        this._commonNarmalSmallPop.setTitle("群号设置");
        this._signalSetWeChatQQ = G_SignalManager.add(SignalConst.EVENT_GUILD_SET_WE_QQ_ADDRESS,this._onEventSetAddress.bind(this))
        
    }
    onExit():void{
        this._signalSetWeChatQQ.remove();
        this._signalSetWeChatQQ = null;
    }

    private _onEventSetAddress(event,data):void{
        if(data.address_type==0)
        {
           G_Prompt.showTip("设置团长微信成功");
        }
        else if(data.address_type==1)
        {
            G_Prompt.showTip("军团Q群成功")
        }
    }

    _onclose():void{
        this.close();
    }

    updateUI():void{
          if(this._checkData.checkMode==1)
          {
              this._checkWechat.isChecked = true;
              this._checkQQ.isChecked = false;
          }
    }
    
    private _validWxStr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'];
    private _validQQStr = ['1','2','3','4','5','6','7','8','9','0'];
    private isValidStr(str:string,mode):boolean{
        var resultStr = [];
        if(mode==1)
        {
            resultStr = this._validWxStr;
        }
        else if(mode==2)
        {
            resultStr = this._validQQStr;
        }
        else
        {
            console.log("未知的模式,无效");
            return false;
        }
        for(var j =0;j<str.length;j++)
        {
            if(resultStr.indexOf(str[j])<0)
            return false;
        }
        return true;
    }

    onBeganEditBox():void{
        if(this._checkData.rootLimits!=17)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }

        this._editbox.textLabel.string = "";
        this._editbox.string = "";
    }

    onEndEditBox():void{
        if(this._checkData.rootLimits!=17)
        {
             return;
        }

        var str = this._editbox.string;
        if(this.isValidStr(str,this._checkData.checkMode))
        {
            this._checkData.account = str;
        }
        else
        {
            this._editbox.string = "";
            this._editbox.textLabel.string = "";
            if(this._checkData.checkMode==1)
            {
                G_Prompt.showTip("设置失败,微信号只支持数字，字母，下划线，减号哟");
            }
            else if(this._checkData.checkMode==2)
            {
                G_Prompt.showTip("设置失败,QQ群只支持数字哟");
            }
        }
        
        
    }


    onBtnCheckWechat(target:cc.Toggle): void {
        if(this._checkData.rootLimits!=17)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }

        if(target.isChecked)
        {
            //开启微信
            //关闭QQ
            this._checkData.checkMode = 1;
            this._checkQQ.uncheck();
        }
        else
        {
            //开启QQ
            //关闭微信
            this._checkQQ.isChecked = true;
            this._checkData.checkMode = 2;
        }
        //清空输入框
        this._editbox.string = "";
        this._editbox.textLabel.string = "";
    }
    onBtnCheckQQ(target:cc.Toggle): void {

        if(this._checkData.rootLimits!=17)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }
        
        
        if(target.isChecked)
        {   
           //开启QQ
           //关闭微信
           this._checkData.checkMode = 2;
           this._checkWechat.uncheck();
        }
        else
        {
            //开启微信
            //关闭QQ
            this._checkWechat.isChecked = true;
            this._checkData.checkMode = 1;
        }
        
        //清空输入框
        this._editbox.string = "";
        this._editbox.textLabel.string = "";
    }


    onBthConfirm():void{
        if(this._checkData.rootLimits!=17)
        {
             G_Prompt.showTip("没有权限不能操作哦");
             return;
        }
        if(this._editbox.textLabel.string=="")
        {
            if(this._checkData.checkMode==1)
            {
                G_Prompt.showTip("设置失败，请输入微信账号");
            }
            else if(this._checkData.checkMode==2)
            {
                G_Prompt.showTip("设置失败，请输入QQ账号");
            }
            return;
        }
        console.log(this._checkData);

        G_UserData.getGuild().c2sGuildSetAddress(this._checkData.checkMode==1?0:1,this._checkData.account)
    }

}