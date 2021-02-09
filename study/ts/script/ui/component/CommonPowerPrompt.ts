import { AudioConst } from "../../const/AudioConst";
import LabelExtend from "../../extends/LabelExtend";
import { G_AudioManager, G_SceneManager } from "../../init";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { Util } from "../../utils/Util";
import { PromptAction } from "../prompt/PromptAction";
import CommonRollNumber from "./CommonRollNumber";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonPowerPrompt extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_125: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCombatValue: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _label1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _label2: cc.Label = null;

    private _totalPower;
    private _diffValue;

    updateUI(totalPower: number, diffValue: number) {
        this._totalPower = totalPower;
        this._diffValue = diffValue;
        // this._label1.string = totalPower.toString();
        Util.updatelabelRenderData(this._label1);
        var maxWidth = this._label1.node.getContentSize().width;
        var defaultGap = 120;
        if (maxWidth > defaultGap) {
            this._imageArrow.node.x = this._imageArrow.node.x + maxWidth - defaultGap;
            this._label2.node.x = this._label2.node.x + maxWidth - defaultGap;
        }
        this._label1.string = (totalPower - diffValue).toString();
        var arrowRes = diffValue > 0 && Path.getUICommon('img_battle_arrow_up') || Path.getUICommon('img_battle_arrow09');
        if (diffValue != 0) {
            this._imageArrow.node.active = true;
            UIHelper.loadTexture(this._imageArrow,arrowRes);
        }
        else {
            this._imageArrow.node.active = false;
            this._label2.string = '0';
        }
    }

    playEffect(needRemove) {
        if (this._diffValue == 0) return;
        this._label1.string = this._totalPower.toString();
        if (needRemove) {
            this._label2PlayAction(this._diffValue, cc.sequence(cc.delayTime(1.5), cc.fadeOut(0.5), cc.destroySelf()));
        }else {
            this._label2PlayAction(this._diffValue, cc.sequence(cc.delayTime(1.5), cc.fadeOut(0.5)));
        }   
       
        // this._label2.setProperty(Math.abs(this._diffValue), charMapFile, 18, 23, '0');
    }

    play(offsetX, offsetY) {
        if (this._diffValue == 0) {
            return;
        }
        var offsetX = offsetX || 0;
        var offsetY = offsetY || 0;
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addTextSummary(this.node);
        // var width = G_ResolutionManager.getDesignWidth();
        // var height = G_ResolutionManager.getDesignHeight();
        this.node.setPosition(offsetX, offsetY - 45 * 4);

        // this._label1.string = '0';
        this.label1Extends.updateTxtValue(this._totalPower, null, null, true);
        // this._label1.string = this._totalPower.toString();
        this._label2PlayAction(this._diffValue, cc.sequence(cc.delayTime(1.5), cc.fadeOut(0.5), cc.destroySelf()));

        // this._label2.setProperty(Math.abs(this._diffValue), charMapFile, 18, 23, '0');
        G_AudioManager.playSoundWithId(AudioConst.SOUND_NUM);
    }

    _label2PlayAction(diffValue, action): void {
        var charMapFile = diffValue > 0 ? Path.getTextTeam('font_zhanli02') : Path.getTextTeam('font_zhanli03');
        cc.resources.load(charMapFile, cc.Font, (err, resource) => {
            this._label2.font = resource;
            this._label2.string = Math.abs(diffValue).toString();
            if (action) {
                this.node.runAction(cc.sequence(PromptAction.PopupAction(), action));
            }
            else {
                this.node.runAction(PromptAction.PopupAction());
            }
        });
    }

    private _label1RollNum: CommonRollNumber;
    private get label1Extends(){
        if(!this._label1RollNum) {
            this._label1RollNum = this._label1.node.addComponent(CommonRollNumber);
            var labelExtend: LabelExtend = this._label1.addComponent(LabelExtend);
            this._label1RollNum.setRollListener(labelExtend);
        }
        return this._label1RollNum;
    }

}