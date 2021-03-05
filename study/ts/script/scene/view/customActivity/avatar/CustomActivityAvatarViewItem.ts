const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../../ui/component/CommonIconTemplate'
import { G_AudioManager, G_EffectGfxMgr } from '../../../../init';
import { AudioConst } from '../../../../const/AudioConst';
import { DataConst } from '../../../../const/DataConst';
import ViewBase from '../../../ViewBase';

@ccclass
export default class CustomActivityAvatarViewItem extends ViewBase {

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item: CommonIconTemplate = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLight: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRareSign: cc.Sprite = null;

   private _index:number;
   private _award:any;
   private _isRale:boolean;


   setInitData (index, award) {
    this._index = index;
    this._award = award;
    this._isRale = index == 1;
 }
onCreate () {
    this._item.unInitUI();
    this._item.initUI(this._award.type, this._award.value, this._award.size);
    this._imageRareSign.node.active = (this._isRale);
    this._imageLight.node.active = (false);
    this._addEffect();
 }
onEnter () {
 }
onExit () {
 }
stopAction () {
    this._imageLight.node.stopAllActions();
 }
setHighlight (trueOrFalse) {
    this._imageLight. node.active = (trueOrFalse);
 }

//播放运行
playRun (t, callback) {
    this._imageLight. node.active = (true);
    G_AudioManager.playSoundWithId(AudioConst.SOUND_AVATAR_ACTIVITY_RUN);
    var delayAction = cc.delayTime(t);
    var callFuncAction = cc.callFunc(function () {
        // this._imageLight.node.active = (false);
        if(this._blinkTime!=0)
        {
            this.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(function(){
                this._imageLight.node.active = (false)
            }.bind(this))));
        }
        else
        {
            this._imageLight.node.active = (false)
        }
        if (callback) {
            callback();
        }
    }.bind(this));
    var action = cc.sequence(delayAction, callFuncAction);
    this.node.runAction(action);
 }


 private _blinkTime:number=0;
//播放选中
public playSelect (callback) {
    this._imageLight.node.active = (true);
    var blinkAction = cc.blink(0.6, 3);
    G_AudioManager.playSoundWithId(AudioConst.SOUND_AVATAR_ACTIVITY_END);
    var callFuncAction = cc.callFunc(function () {
        this._imageLight.node.active = (false);
        this._blinkTime = 0;
        if (callback) {
            callback();
        }
    }.bind(this));
    // var action = cc.sequence(blinkAction, callFuncAction);
    this._blinkTime = Date.now();
    this._imageLight.node.runAction(blinkAction);
    this.node.runAction(cc.sequence(cc.delayTime(0.6),callFuncAction));
 }
_addStarEffect () {
    this._effectNode.removeAllChildren();
    G_EffectGfxMgr.createPlayGfx(this._effectNode, 'effect_zhujiemian_xingxing');
 }
_addEffect () {
    var cosRes = this._award;
    if (DataConst.ITEM_AVATAR_ACTIVITY_ITEM2 == cosRes.value) {
        this._item.showLightEffect(1, 'effect_icon_liuguang');
        this._addStarEffect();
    } else if (DataConst.ITEM_AVATAR_ACTIVITY_ITEM1 == cosRes.value) {
        this._item.showLightEffect(1, 'effect_icon_liuguang');
    }
}


}