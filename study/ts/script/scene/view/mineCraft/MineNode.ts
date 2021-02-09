const {ccclass, property} = cc._decorator;

import CommonGuildFlag from '../../../ui/component/CommonGuildFlag'
import { G_EffectGfxMgr, G_SceneManager } from '../../../init';
import { Path } from '../../../utils/Path';
import { MineCraftHelper } from './MineCraftHelper';
import CommonUI from '../../../ui/component/CommonUI';
import ViewBase from '../../ViewBase';
import PopupMine from './PopupMine';
import { MineData } from '../../../data/MineData';
import { GrainCarDataHelper } from '../grainCar/GrainCarDataHelper';
import PopupGrainCar from '../grainCar/PopupGrainCar';

@ccclass
export default class MineNode extends ViewBase {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageMine: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _selfArrow: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageNodeName: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeCountInfo: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textSelfCount: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSelfState: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;

   @property({
       type: CommonGuildFlag,
       visible: true
   })
   _nodeFlag: CommonGuildFlag = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDouble: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _peaceNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _peaceEffect: cc.Node = null;
   
   private _mineData:MineData;
   private _configData:any;
   private _peaceStatus:boolean;
   private _schedulePeaceHandler;

   setInitData(data:MineData):void{
        this._mineData = data;
        this._configData = data.getConfigData();
   }
onEnter():void{
     this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onPanelClick,this);
}
onCreate() {
    this._selfArrow.node.active = (false);
    var picPath = Path.getMineImage(this._configData.pit_icon_png);
    this._imageMine.node.addComponent(CommonUI).loadTexture(picPath)
    var picName = Path.getMineNodeTxt(this._configData.pit_name_txt);
    this._imageNodeName.node.addComponent(CommonUI).loadTexture(picName)
    var height = this._imageMine.node.getContentSize().height;
    this._imageNodeName.node.y = (-height / 2 + 5);
    this._nodeCountInfo.y = (-height / 2 + 18);
    this.node.setPosition(new cc.Vec2(this._configData.x, this._configData.y));
    this._imageDouble.node.active = (false);
    this._peaceNode.active = false;
    if(this._schedulePeaceHandler)this.unschedule(this._schedulePeaceHandler)
    this._schedulePeaceHandler = this._updatePeaceTimer.bind(this);
    this.schedule(this._schedulePeaceHandler, 1);
}

onExit():void{
    this._panelTouch.off(cc.Node.EventType.TOUCH_END,this._onPanelClick,this);
    if(this._schedulePeaceHandler)this.unschedule(this._schedulePeaceHandler)
    this._schedulePeaceHandler = null;
}
refreshData(data) {
    this._mineData = data;
}
updateUI() {
    if (this._mineData.getUserCnt() == 0 || this._configData.pit_type == MineCraftHelper.TYPE_MAIN_CITY) {
        this._nodeCountInfo.active = (false);
    } else {
        this._nodeCountInfo.active = (true);
        var[outputConfig,baseOutput] = this._mineData.getMineStateConfig();
        var stateIcon = Path.getMineImage(outputConfig.icon);
        this._imageSelfState.node.addComponent(CommonUI).loadTexture(stateIcon);
        this._textSelfCount.string = (this._mineData.getUserCnt()).toString();
        var color = MineCraftHelper.getStateColor(outputConfig.state);
        this._textSelfCount.node.color = (color);
    }
    this._selfArrow.node.active = (false);
    this._refreshGuildFlag();
    if (this._mineData.getMultiple() > 1) {
        var doubleId = this._mineData.getMultiple();
        var pic = Path.getMineDoubleImg(doubleId - 1);
        this._imageDouble.node.active = (true);
        this._imageDouble.node.addComponent(CommonUI).loadTexture(pic);
        var picPath = Path.getMineImage(this._configData.rich_pit_icon_png);
        this._imageMine.node.addComponent(CommonUI).loadTexture(picPath);
    } else {
        this._imageDouble.node.active = (false);
        var picPath = Path.getMineImage(this._configData.pit_icon_png);
        this._imageMine.node.addComponent(CommonUI).loadTexture(picPath);
    }
    this._updatePeaceNode();
}
_refreshGuildFlag() {
    var guildId = this._mineData.getGuildId();
    if (guildId != 0) {
        this._nodeFlag.node.active = (true);
        var guildName = this._mineData.getGuildName();
        var guildIcon = this._mineData.getGuildIcon();
        this._nodeFlag.updateUI(guildIcon, guildName);
    } else {
        this._nodeFlag.node.active = (false);
    }
}
_openMineDetail() {
    
    if (GrainCarDataHelper.haveCarInMineId(this._mineData.getId())) {
        G_SceneManager.openPopup(Path.getPrefab("PopupGrainCar","grainCar"),function(pop:PopupGrainCar){
            pop.ctor(this._mineData);
            pop.openWithAction();
        }.bind(this),this._mineData.getId(),this._mineData);
    } else {
        G_SceneManager.openPopup(Path.getPrefab("PopupMine","mineCraft"),function(pop:PopupMine){
            pop.setInitData(this._mineData);
            pop.openWithAction();
        }.bind(this),this._mineData.getId());
    }
}

private _onPanelClick(sender:cc.Touch) {
    var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
    var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
    if (offsetX < 20 && offsetY < 20) {
        this._openMineDetail();
    }
}
doDoubleAnim() {
    this._imageDouble.node.setScale(0.1);
    var action = cc.scaleTo(0.2, 1, 1);
    this._imageDouble.node.runAction(action);
}

_updatePeaceNode() {
    var isPeace = this._mineData.isPeace();
    this._peaceNode.active = (isPeace);
    this._peaceEffect.removeAllChildren();
    if (isPeace) {
        G_EffectGfxMgr.createPlayGfx(this._peaceEffect,"effect_kuangzhan_hepingz")
    }
    this._peaceStatus = isPeace;
}
_updatePeaceTimer() {
    var isPeace = this._mineData.isPeace();
    if (isPeace != this._peaceStatus) {
        this._updatePeaceNode();
    }
}


}