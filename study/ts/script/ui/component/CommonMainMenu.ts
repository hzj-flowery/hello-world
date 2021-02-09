import { ConfigNameConst } from "../../const/ConfigNameConst";
import EffectGfxSingle from "../../effect/EffectGfxSingle";
import { Colors, G_ConfigLoader, G_ConfigManager, G_EffectGfxMgr, G_ServerTime } from "../../init";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import CommonUI from "./CommonUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonMainMenu extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _nodeRoot: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffectB: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _button: cc.Button = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffectA: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _desc: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _textImage: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _redPoint: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _runningImage: cc.Sprite = null;
    
    @property({ type: cc.Sprite, visible: true })
    ImageBg: cc.Sprite = null;
    

    

    private _funcId: number;
    private _buttonMoving: EffectGfxSingle;
    private _clickCallback: Function;
    private _customLabel: cc.Label;
    private _customLabelBg:cc.Sprite;
    private _countDownEndTime: number;
    private _leftTimeLabel: cc.Label;
    private _leftTimeLabelBg:cc.Sprite;
    private _countText: cc.Label;
    private _countTextBg: cc.Node;
    private _isRegisterListener:boolean;
    private _bHideBtnImage:boolean;
    onLoad(){
        this._button.node.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.RAW;
        this._textImage.sizeMode = cc.Sprite.SizeMode.RAW;
        this.showRunningImage(false);
        this._isRegisterListener = false;
        if(this.ImageBg==null)
        {
            var bgNode = this._nodeRoot.getChildByName("ImageBg");
            if(bgNode)this.ImageBg = bgNode.getComponent(cc.Sprite);
        }
       
    }

    public getRedPoint(): cc.Node {
        return this._redPoint.node;
    }
    showRunningImage(isShow) {
        if(this._runningImage==null||this._runningImage.node==null)
        {
            console.log("异常---");
            return;
        }
        this._runningImage.node.active = (isShow);
        UIHelper.loadTexture(this._runningImage,Path.getTextMain('txt_main_ing'));
    }
    showFinishedImage(isShow) {
        if(this._runningImage==null||this._runningImage.node==null)
        {
            console.log("异常---");
            return;
        }
        this._runningImage.node.active = (isShow);
        UIHelper.loadTexture(this._runningImage,Path.getTextMain('txt_main_end'));
    }
    showInTeamImage(isShow) {
        if(this._runningImage==null||this._runningImage.node==null)
        {
            console.log("异常---");
            return;
        }
        this._runningImage.node.active = (isShow);
        UIHelper.loadTexture(this._runningImage,Path.getTextMain('txt_main_team'));
    }

    public playBtnMoving() {
        var funcInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(this._funcId);
        if (funcInfo.effect_s != '' && !this._buttonMoving) {
            this._button.node.stopAllActions();
            this._button.node.setPosition(0, 0);
            this._button.node.setScale(1);
            //this.stopBtnMoving();
            this._buttonMoving = G_EffectGfxMgr.applySingleGfx(this._button.node, funcInfo.effect_s);
        }
    }

    public stopBtnMoving() {
        if (this._buttonMoving) {
            this._buttonMoving.stop();
            this._buttonMoving = null;
        }
    }

    public getFuncId() {
        return this._funcId;
    }

    private _iconPath:string;
    updateUI(functionId, customIcon?, customIconTxt?) {
        var funcInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(functionId);
        this._desc.string = (funcInfo.name);
        var iconPath;
        if (!customIcon) {
            iconPath = Path.getCommonIcon('main', funcInfo.icon);
        } else {
            iconPath = customIcon;
        }
        this._iconPath = iconPath;
        UIHelper.loadTexture(this._button.node.getComponent(cc.Sprite), iconPath);
        this._button.node.name = ('commonMain' + functionId);
        var iconTextPath;
        if (customIconTxt) {
            iconTextPath = Path.getTextMain(customIconTxt);
        } else if (funcInfo.icon_txt && funcInfo.icon_txt != '') {
            iconTextPath = Path.getTextMain(funcInfo.icon_txt);
        }
        if (iconTextPath) {
            if (!G_ConfigManager.checkCanRecharge() && funcInfo.forbidIos > 0) {
                this._desc.node.active = (false);
            }else {
                this._textImage.node.addComponent(CommonUI).loadTexture(iconTextPath);
                this._textImage.node.active = (true);
                this._desc.node.active = (false);
            }
       
        } else {
            this._textImage.node.active = (false);
            this._desc.node.active = (true);
        }
        this._funcId = functionId;
        this._redPoint.node.active = (false);
        this.playFuncGfx();
    }


    public stopFuncGfx() {
        this._nodeEffectA.removeAllChildren();
        this._nodeEffectB.removeAllChildren();
        if (this._bHideBtnImage) {
            this._button.node.opacity =  (255);
            UIHelper.loadTexture(this._button.node.getComponent(cc.Sprite), this._iconPath);
        }
    }

    public playFuncGfx(info?, bHideBtnImage?) {
        var funcInfo =  info || G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(this._funcId);

        if (funcInfo.effect_a != '') {
            this._nodeEffectA.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._nodeEffectA, funcInfo.effect_a);
        }
        if (funcInfo.effect_b != '') {
            this._nodeEffectB.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._nodeEffectB, funcInfo.effect_b);
        }

        if (funcInfo.xy_1 != '') {
            var vector = (funcInfo.xy_1 as string).split('|');
            if (vector.length == 2) {
                this._nodeEffectA.setPosition(parseFloat(vector[0]), parseFloat(vector[1]));
            }
        }
        if (funcInfo.xy_2 != '') {
            var vector = (funcInfo.xy_2 as string).split('|');
            if (vector.length == 2) {
                this._nodeEffectB.setPosition(parseFloat(vector[0]), parseFloat(vector[1]));
            }
        }
        if (bHideBtnImage) {
            this._bHideBtnImage = true;
            this._button.node.opacity = (0);
        }
    }

    public setIconAndString(icon, string) {
        this._desc.string = (string);
        var iconPath = Path.getCommonIcon('main', icon);
        UIHelper.loadTexture(this._button.node.getComponent(cc.Sprite), iconPath);
        this._redPoint.node.active = (false);
    }

    public loadCustomIcon(iconPath) {
        UIHelper.loadTexture(this._button.node.getComponent(cc.Sprite), iconPath);
    }

    public addClickEventListenerEx(callback) {

        if (!this._isRegisterListener) {
            this._clickCallback = callback;
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = "CommonMainMenu";
            clickEventHandler.handler = "_onClick";
            this._button.clickEvents = [];
            this._button.clickEvents.push(clickEventHandler);
        }
    }

    private _onClick(sender: cc.Event.EventTouch) {
        if (this._clickCallback) {
            this._clickCallback(sender.target, this._funcId);
        }
    }

    public setString(s) {
        this._desc.string = (s);
    }

    public showRedPoint(v) {
        if (v) {
            this.showImageTip(false, '');
        }
        this._redPoint.node.active = (v);
    }

    public showImageTip(show, texture) {
        if (this._redPoint.node.active) {
            show = false;
        }
        if (show) {
            var imgTip = this._nodeRoot.getChildByName('image_tip');
            if (!imgTip) {
                imgTip = UIHelper.createImage({ texture: texture });
                imgTip.name = ('image_tip');
                this._nodeRoot.addChild(imgTip);
                imgTip.setPosition(30, 30);
            }
            imgTip.active = (true);
        } else {
            var imgTip = this._nodeRoot.getChildByName('image_tip');
            if (imgTip) {
                imgTip.active = (false);
            }
        }
    }

    public setEnabled(e) {
        this._button.interactable = (e);
        this._desc.node.color = (e && Colors.COLOR_POPUP_SPECIAL_NOTE || Colors.COLOR_BUTTON_LITTLE_GRAY);
        UIHelper.enableOutline(this._desc, e && Colors.COLOR_SCENE_OUTLINE || Colors.COLOR_BUTTON_LITTLE_GRAY_OUTLINE, 2);
    }

    public setWidth(width) {
        var height = this._button.node.getContentSize().height;
        this._button.node.setContentSize(width, height);
    }

    public setButtonTag(tag) {
        // this._button.setTag(tag);
    }

    public getButton() {
        return this._button;
    }

    public flipButton(needFlip) {
        needFlip = needFlip || false;
        // var scaleX = Math.abs(this._button.node.scaleX);

        // if (needFlip) {
        //     this._button.node.scaleX = (-scaleX);
        // } else {
        //     this._button.node.scaleX = (scaleX);
        // }
        this._button.node.setScale(needFlip ? -1 : 1, 1);
    }

    public removeCustomLabel() {
        if (this._customLabel) {
            this._customLabel.node.destroy();
            this._customLabel = null;
            this._customLabelBg.node.destroy();
            this._customLabelBg = null;
        }
    }

    public addCustomLabel(str:string, fontSize, pos, color, outlineColor,outlineSize) {
        // this.removeCustomLabel();
        if (this._customLabel == null) {
           
            this._customLabelBg = this._createLabelBgImageHelp(pos).getComponent(cc.Sprite);
            if (str == null || str.length == 0) {
                this._customLabelBg.node.active = (false);
            }
            this._nodeRoot.addChild(this._customLabelBg.node);
            this._customLabel = this._createLabelHelp(str, fontSize, pos, color, outlineColor,outlineSize).getComponent(cc.Label);
            this._nodeRoot.addChild(this._customLabel.node);
        }
        else {
            this._customLabel.string = str;
            this._customLabel.fontSize = fontSize;
            this._customLabel.node.position = pos;
            this._customLabel.node.color = color;
            UIHelper.enableOutline(this._customLabel, outlineColor);
        }
        this.moveLetterToRight();
        
    }
    private _createLabelBgImageHelp(pos) {
        return UIHelper.createImage({
            texture: Path.getUICommon('img_com_icon_txtbg01'),
            position: pos
        });
    }
    public _createLabelHelp(str, fontSize, pos, color, outlineColor?,outlineSize?) {
        return UIHelper.createLabel({
            text: str,
            fontSize: fontSize,
            color: color,
            outlineColor: outlineColor,
            outlineSize: outlineSize,
            position: pos
        });
    }

    public openCountDown(endTime, endCallback, isShowDay) {
        var currTime = G_ServerTime.getTime();
        if (currTime >= endTime) {
            if (endCallback) {
                endCallback(this);
            }
            return;
        }
        this.stopCountDown();
        this._countDownEndTime = endTime;
        var strInitTime = G_ServerTime.getLeftSecondsString(this._countDownEndTime, '00:00:00');
        if (isShowDay) {
            strInitTime = G_ServerTime.getLeftDHMSFormatEx(this._countDownEndTime);
        }
        if(!this._leftTimeLabelBg)
        {
            this._leftTimeLabelBg = this._createLabelBgImageHelp(cc.v2(0, -30-14)).getComponent(cc.Sprite);
            this._nodeRoot.addChild(this._leftTimeLabelBg.node);
        }
        if(!this._leftTimeLabel)
        {
            this._leftTimeLabel = this._createLabelHelp(strInitTime, 18, cc.v2(0, -30-14), new cc.Color(0, 255, 0), Colors.strokeBlack,1).getComponent(cc.Label);
             this._nodeRoot.addChild(this._leftTimeLabel.node);
        }
        var delay = cc.delayTime(0.5);
        var sequence = cc.sequence(delay, cc.callFunc(function () {
            if (!this._leftTimeLabel) {
                return;
            }
            var currTime = G_ServerTime.getTime();
            if (currTime <= this._countDownEndTime) {
                var strTime = G_ServerTime.getLeftSecondsString(this._countDownEndTime, '00:00:00');
                if (isShowDay) {
                    strTime = G_ServerTime.getLeftDHMSFormatEx(this._countDownEndTime);
                }
                this._leftTimeLabel.string = (strTime);
            } else {
                this.stopCountDown();
                if (endCallback) {
                    endCallback(this);
                }
            }
        }.bind(this)));
        var action = cc.repeatForever(sequence);
        this._leftTimeLabel.node.runAction(action);
    }

    public stopCountDown() {
        if (this._leftTimeLabel) {
            this._leftTimeLabelBg.node.destroy();
            this._leftTimeLabelBg = null;
            this._leftTimeLabel.node.destroy();
            this._leftTimeLabel = null;
        }
    }

    public moveLetterToRight() {
        this._textImage.node.x = (4);
        this._redPoint.node.x = (49);
        this._textImage.node. y =(-22);
        this._redPoint.node.setPosition(30, 25);
        this.ImageBg.node.active = (true);
    }

    public addCountText(count) {
        if (!count) {
            return;
        }
        if (!this._countText) {
            var bgImage = UIHelper.createImage({ texture: Path.getCommonImage('img_redpoint02') });
            this._nodeRoot.addChild(bgImage);
            bgImage.setPosition(this._redPoint.node.getPosition());
            var size = bgImage.getContentSize();
            this._countTextBg = bgImage;
            this._countText = this._createLabelHelp(count, 20, cc.v2(0, 0), Colors.DARK_BG_ONE).getComponent(cc.Label);
            bgImage.addChild(this._countText.node);
        } else {
            this._countText.string = (count);
        }
    }

    public setCountTextVisible(trueOrFalse) {
        if (this._countTextBg) {
            this._countTextBg.active = (trueOrFalse);
        }
    }
    setGlobalZOrder(order) {
        this._button.node.zIndex = (order);
        this._redPoint.node.zIndex = (order);
        this._textImage.node.zIndex = (order);
        this._runningImage.node.zIndex = (order);
    }
}