const {ccclass, property} = cc._decorator;

import CommonResourceInfo from './CommonResourceInfo'
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import UIHelper from '../../utils/UIHelper';
import { G_EffectGfxMgr, Colors } from '../../init';

@ccclass
export default class CommonPromptSilverNode extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_tip_background: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image: cc.Sprite = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _resInfo: CommonResourceInfo = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_num: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_crt: cc.Label = null;


    _crtNum: number = 0;
    _itemParams: any;

    updateUI(type, value, size) {
        type = type || TypeConvertHelper.TYPE_RESOURCE;
        var itemParams = TypeConvertHelper.convert(type, value);
        this._itemParams = itemParams;
        if (itemParams.res_mini) {
            UIHelper.loadTexture(this._image, itemParams.res_mini);
        }
        if (size) {
            this.setCount(size);
        }
    }
    setCount(count) {
        if (this._text_num) {
            this._text_num.string = ('X' + (count));
        }
    }
    getCrtNum() {
        return this._crtNum;
    }
    setCrt(crt) {
        this._crtNum = crt;
        if (this._text_crt && crt > 0) {
            if (crt == 1) {
                this._text_crt.node.active = (false);
            } else {
                this._text_crt.node.active = (true);
            }
            this._text_crt.string = ('暴击X' + (crt));
            var color = Colors.getCritPromptColor(crt);
            var outlineColor = Colors.getCritPromptColorOutline(crt);
            this.setCountTextColor(color, outlineColor);
            this.setCrtTextColor(color, outlineColor);
        }
    }
    playCrtEffect() {
        this._effectNode.removeAllChildren();
        if (this._crtNum == 2) {
            G_EffectGfxMgr.createPlayGfx(this._effectNode, 'effect_jubaopen_huangkuang', function () {
            });
        } else if (this._crtNum == 3) {
            G_EffectGfxMgr.createPlayGfx(this._effectNode, 'effect_jubaopen_huangkuang', function () {
            });
        } else if (this._crtNum == 5) {
            G_EffectGfxMgr.createPlayGfx(this._effectNode, 'effect_jubaopen_huangkuang', function () {
            });
        } else if (this._crtNum == 10) {
            G_EffectGfxMgr.createPlayGfx(this._effectNode, 'effect_jubaopen_hongkuang', function () {
            });
        }
    }
    setCountTextColor(textColor, outlineColor) {
        this._text_num.node.color = (textColor);
    }
    setCrtTextColor(textColor, outlineColor) {
        this._text_crt.node.color = (textColor);
    }
}
