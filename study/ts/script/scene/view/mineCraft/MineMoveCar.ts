const {ccclass, property} = cc._decorator;

import CommonGrainCarAvatar from '../../../ui/component/CommonGrainCarAvatar'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Colors, G_ConfigLoader, G_EffectGfxMgr } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { assert } from '../../../utils/GlobleFunc';
import { Lang } from '../../../lang/Lang';
import MineNewsNode from './MineNewsNode';
import GrainCarBg from '../grainCar/GrainCarBg';
import GrainCarBar from '../grainCar/GrainCarBar';
import { GrainCarDataHelper } from '../grainCar/GrainCarDataHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';

@ccclass
export default class MineMoveCar extends ViewBase {

   @property({
       type: CommonGrainCarAvatar,
       visible: true
   })
   _carAvatar: CommonGrainCarAvatar = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeFlag: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _guildName: cc.Label = null;

   @property({
       type: GrainCarBar,
       visible: true
   })
   _barArmy: GrainCarBar = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _title: cc.Sprite = null;

   @property({
    type: cc.Node,
    visible: true
})
_nodeEffect: cc.Node = null;
   

   static AVATAR_SCALE = 1.2;
   static GUILD_NAME_HEIGHT = 40;
   static CAR_SCALE = {
    [1]: 1,
    [2]: 1,
    [3]: 1.1,
    [4]: 1.1,
    [5]: 1.1
};
   private _titleInitPosY:number;
   private _barInitPosY:number;
onCreate() {
    this.node.setScale(MineMoveCar.AVATAR_SCALE);
    this._titleInitPosY = this._guildName.node.y;
    this._barInitPosY = this._barArmy.node.y;
    G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_bianshenka');
}
onEnter() {
}
onExit() {
}
updateUI(carUnit) {
    this._carAvatar.updateUI(carUnit.getLevel());
    this._carAvatar.setScale(0.9*MineMoveCar.CAR_SCALE[carUnit.getLevel()]);
    this._guildName.string = (carUnit.getGuild_name() + (Lang.get('grain_car_guild_de') + carUnit.getConfig().name));
    if (GrainCarDataHelper.isMyGuild(carUnit.getGuild_id())) {
        this._guildName.node.color = (Colors.BRIGHT_BG_GREEN);
        UIHelper.enableOutline(this._guildName,Colors.COLOR_QUALITY_OUTLINE[1], 1);
        this._nodeEffect.active = (true);
    } else {
        this._nodeEffect.active = (false);
    }
    this._barArmy.updateBarWithCarUnit(carUnit);
    this._barArmy.showPercentText(false);
}
setGuildNameYWithIndex(index) {
    this._guildName.node.y = (this._titleInitPosY + MineMoveCar.GUILD_NAME_HEIGHT * (index - 1));
    this._title.node.y = (this._titleInitPosY + MineMoveCar.GUILD_NAME_HEIGHT * (index - 1));
    this._barArmy.node.y = (this._barInitPosY + MineMoveCar.GUILD_NAME_HEIGHT * (index - 1));
}
resetGuildNamePos() {
    this._guildName.node.y = (this._titleInitPosY);
    this._title.node.y = (this._titleInitPosY);
    this._barArmy.node.y = (this._barInitPosY);
}
playRun() {
    this._carAvatar.playRun();
}
playIdle() {
    this._carAvatar.playIdle();
}
playDead() {
    this._carAvatar.playDead();
}
turnBack(needTurn?) {
    this._carAvatar.turnBack(needTurn);
}

}