

import { G_EffectGfxMgr, G_Prompt } from "../../../init";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TextHelper } from "../../../utils/TextHelper";
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from "../../../utils/UIHelper";
import { Util } from "../../../utils/Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExploreGainEft extends cc.Component {

    private _callback;
    private _awards: any[];
    private _holidayAwards;
    private _crit: number;

    start() {
        // this.node.active = false;
    }

    //游历每走一步的经验，银两飘字
    //奖励，暴击，回调
    setUp() { }

    startEffect(awards: any[], crit, callback) {
        var holidayAwards = [];
        for (var k in awards) {
            var v = awards[k];
            if (v.type == 6 && v.value == 87) {
                holidayAwards.push(v);
                var index: number = awards.indexOf(k);
                if (index >= 0) awards.splice(index, 1);
            }
        }
        this._holidayAwards = holidayAwards;
        this._reset();
        this._callback = callback;
        this._awards = awards;
        this._crit = crit;
        this._playAction();
    }

    _reset() {
        this._callback = null;
        this._awards = null;
        this._crit = null;
        this.node.removeAllChildren();
    }
    //创建
    _createResNode(reward) {
        var gainNode: cc.Node = Util.getNode('prefab/exploreMap/ExploreGainNode');
        var textValue = gainNode.getChildByName('TextValue').getComponent(cc.Label);
        var imageRes: cc.Sprite = gainNode.getChildByName('ImageRes').getComponent(cc.Sprite);
        var textRes: cc.Label = gainNode.getChildByName('TextRes').getComponent(cc.Label);
        var itemParams = TypeConvertHelper.convert(reward.type, reward.value);
        UIHelper.loadTexture(imageRes, itemParams.icon);
        // cc.resources.load(itemParams.icon, (err, resource) =>{
        //     imageRes.spriteFrame.setTexture(itemParams.icon);
        // });
        var name = TextHelper.expandTextByLen(itemParams.name, 3);
        textRes.string = name;
        textRes.node.color = itemParams.icon_color;
        UIHelper.enableOutline(textRes, itemParams.icon_color_outline, 2);
        textValue.string = ('+' + reward.size);
        return gainNode;
    }
    //事件函数
    _eftEventFunc(event) {
        console.log('exploregaineft: ', event);
        if (event == 'finish' && this._callback) {
            if (this._holidayAwards && this._holidayAwards.length > 0) {
                G_Prompt.showAwards(this._holidayAwards);
            }
            this._callback();
        }
    }
    //获得暴击图案
    _getImageCrit() {
        var strImage = 'img_txt_erbei';
        if (this._crit == 4) {
            strImage = 'img_txt_sibei';
        } else if (this._crit == 8) {
            strImage = 'img_txt_babei';
        }
        var image = Path.getExploreImage(strImage);
        return image;
    }
    _createCritEft() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_youli_baoji', this.effectFunction.bind(this), handler(this, this._eftEventFunc), true);
    }

    private effectFunction(effect) {
        if (effect.index('baoji_')) {
            var img = this._getImageCrit();
            return Util.newSprite(img);
        } else if (effect == 'exp') {
            return this._createResNode(this._awards[1]);
        } else if (effect == 'money') {
            return this._createResNode(this._awards[2]);
        } else if (effect == 'item') {
            return this._createResNode(this._awards[0]);
        }
    }

    _createNormalEft() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_youli_txt', handler(this, this.effectFunction2), handler(this, this._eftEventFunc), true);
    }

    private effectFunction2(effect) {
        if (effect == 'exp') {
            return this._createResNode(this._awards[1]);
        } else if (effect == 'money') {
            return this._createResNode(this._awards[2]);
        } else if (effect == 'item') {
            return this._createResNode(this._awards[0]);
        }
    }

    //播放动画
    _playAction() {
        if (this._crit == 1) {
            this._createNormalEft();
        } else {
            this._createCritEft();
        }
    }
}