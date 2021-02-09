const {ccclass, property} = cc._decorator;

import { MineUserData } from '../../../data/MineUserData';
import { Colors, G_EffectGfxMgr, G_SceneManager, G_ServerTime, G_UserData } from '../../../init';
import CommonGuildFlag from '../../../ui/component/CommonGuildFlag';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import ViewBase from '../../ViewBase';
import MineBarNode from './MineBarNode';
import { MineCraftHelper } from './MineCraftHelper';
import PopupMineUser from './PopupMineUser';


@ccclass
export default class PopupMineNode extends ViewBase {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageMine: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeAvatar: cc.Node = null;

   @property({
       type: CommonGuildFlag,
       visible: true
   })
   _guildFlag: CommonGuildFlag = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeInfo: cc.Node = null;

   @property({
       type: MineBarNode,
       visible: true
   })
   _armyBar: MineBarNode = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgMyNameBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgNameBG: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textUserName: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeInfame: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _infameBg: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelInfam: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _iconInfame: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imagePrivilege: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _touchPanel: cc.Node = null;

//    ctor(data) {
//     this._data = data;
//     this._config = data.getConfigData();
//     this._mineUser = null;
//     this._lastAvatarId = null;
//     this._randomTime = 0;
//     this._startTime = 0;
//     var resource = {
//         file: Path.getCSB('PopupMineNode', 'mineCraft'),
//         binding: {
//             _touchPanel: {
//                 events: [{
//                         event: 'touch',
//                         method: '_onPanelClick'
//                     }]
//             }
//         }
//     };
// }

private _data:any;
private _config:any;
private _mineUser:MineUserData;
private _lastAvatarId:number;
private _randomTime:number;
private _startTime:number;
private _barArmy:MineBarNode;
private _heroAvatar:CommonHeroAvatar;
private _heroAvatarPrefab:any;
private _scheduleHandler:any;
private _curInfameValue:number;
private _scheduleInfameHandler;

protected preloadResList = [
    {path:Path.getCommonPrefab("CommonHeroAvatar"),type:cc.Prefab}
]


public static SCALE_TOTAL = 1;
public static SCALE_AVATAR = 0.6;
public setInitData(data):void{
    this._data = data;
    this._config = data.getConfigData();
    this._mineUser = null;
    this._lastAvatarId = null;
    this._randomTime = 0;
    this._startTime = 0;
    this._curInfameValue = 0;
    this._scheduleInfameHandler = null;
}
onCreate() {
    this._heroAvatarPrefab = cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"));
    this._barArmy = this._armyBar;
    var posX = this._imagePrivilege.node.x;
    
    G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_boxflash', null, null, false);
    if (this._config.pit_type == MineCraftHelper.TYPE_MAIN_CITY) {
        this._effectNode.active = (false);
        this._nodeAvatar.x = (20);
        this._imagePrivilege.node.x = (posX);
    } else {
        this._effectNode.active = (true);
        var effectName = this._config.position_icon;
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, effectName);
    }
}
onEnter() {
    this._touchPanel.on(cc.Node.EventType.TOUCH_END,this.onPanelClick,this);
    this.node.setScale(PopupMineNode.SCALE_TOTAL);
}
onExit() {
    this._stopUpdate();
    this._touchPanel.off(cc.Node.EventType.TOUCH_END,this.onPanelClick,this);
    this._stopUpdateInfame();
}
_stopUpdate() {
    if (this._scheduleHandler != null) {
        this.unschedule(this._scheduleHandler);
        this._scheduleHandler = null;
    }
}
_stopUpdateInfame() {
    if (this._scheduleInfameHandler != null) {
        this.unschedule(this._scheduleInfameHandler);
        this._scheduleInfameHandler = null;
    }
}
_startUpdate() {
    this._scheduleHandler = function(){
        this._update(0.01);
    }.bind(this);
    this.schedule(this._scheduleHandler,0.01);
}
_updateInfoPanel() {
    var data = this._mineUser;
    var isSelfNode = data.getUser_id() == G_UserData.getBase().getId();
    this._imgMyNameBG.node.active = (isSelfNode);
    this._imgNameBG.node.active = (!isSelfNode);
    this._textUserName.string = (data.getUser_name());
    var officerLevel = data.getOfficer_level();
    this._textUserName.node.color = (Colors.getOfficialColor(officerLevel));
    var bShow = G_ServerTime.getLeftSeconds(data.getPrivilege_time()) > 0;
    this._imagePrivilege.node.active = (bShow);
    this._barArmy.setPercent(data.getArmy_value(), false, bShow);
    var guildId = data.getGuild_id();
    if (guildId == 0) {
        this._guildFlag.node.active = (false);
    } else {
        this._guildFlag.node.active = (true);
        this._guildFlag.updateUI(data.getGuild_icon(), data.getGuild_name());
    }
}
_updateAvatar() {
    var mineUser = this._mineUser;
    var id = mineUser.getAvatar_base_id();
    var limit =AvatarDataHelper.getAvatarConfig(id).limit == 1 && 3;
    var avatarId = UserDataHelper.convertToBaseIdByAvatarBaseId(mineUser.getAvatar_base_id(), mineUser.getBase_id())[0];
    if (this._lastAvatarId != avatarId) {
        this._nodeAvatar.removeAllChildren();
        this._lastAvatarId = avatarId;
        
        this._heroAvatar = (cc.instantiate(this._heroAvatarPrefab) as cc.Node).getComponent(CommonHeroAvatar);
        this._heroAvatar.init();
        this._nodeAvatar.addChild(this._heroAvatar.node);
        this._heroAvatar.updateUI(avatarId, null, null, limit);
        if (avatarId == mineUser.getBase_id()) {
            this._heroAvatar.addSpineLoadHandler(handler(this, this._onSpineFinish));
        }
        this._heroAvatar.setScale(PopupMineNode.SCALE_AVATAR);
        this._heroAvatar.turnBack();
        this._heroAvatar.setTouchEnabled(false);
        this._randomTime = 0;
    }
    this._curInfameValue = mineUser.getInfam_value();
        this._updateInfame();
        if (this._curInfameValue > 0) {
            this._stopUpdateInfame();
            this._scheduleInfameHandler = handler(this, this._updateInfameTimer);
            this.schedule(this._scheduleInfameHandler, 1);
            this._updateInfameTimer();
        }
}
_updateInfame() {
    this._nodeInfame.active = (this._curInfameValue > 0);
    this._labelInfam.string = (''+(this._curInfameValue));
    if (this._mineUser.getUser_id() != G_UserData.getBase().getId()) {
        this._infameBg.node.active = (false);
    } else {
        this._infameBg.node.active = (true);
    }
}
_updateInfameTimer() {
    var curTime = G_ServerTime.getTime();
    var bIsVip = G_ServerTime.getLeftSeconds(this._mineUser.getPrivilege_time()) > 0;
    var [REFRESH_TIME,NUM_PERCHANGE] = MineCraftHelper.getInfameCfg(bIsVip);
    var lastFreshTime = this._mineUser.getRefresh_time();
    var countChange = Math.floor((curTime - lastFreshTime) / REFRESH_TIME);
    if (countChange > 0) {
        this._curInfameValue = this._mineUser.getInfam_value() - NUM_PERCHANGE * countChange;
        this._updateInfame();
    }
}
refreshUserData(mineUser) {
    this._stopUpdate();
    this._stopUpdateInfame();
    if (!mineUser) {
        this.node.active = (false);
        this._mineUser = null;
        this._lastAvatarId = null;
        return;
    }
    this.node.active = (true);
    this._mineUser = mineUser;
    this._updateInfoPanel();
    this._updateAvatar();
}
_onSpineFinish() {
    if (this._config.pit_type != MineCraftHelper.TYPE_MAIN_CITY) {
        var time = Math.floor(Math.random()*9)+1;
        if(time>9)
        {
            time = 9;
        }
        this._randomTime = time / 10;
        this._startTime = 0;
        this._startUpdate();
    }
}
_update(f) {
    this._startTime = this._startTime + f;
    if (this._startTime >= this._randomTime) {
        this._heroAvatar.setAction('wak', true);
        this._startTime = 0;
        this._stopUpdate();
    }
}
private onPanelClick() {
    if (!this._mineUser) {
        return;
    }
    if (this._mineUser.getUser_id() != G_UserData.getBase().getId()) {
        G_SceneManager.openPopup(Path.getPrefab("PopupMineUser","mineCraft"),function(pop:PopupMineUser){
            pop.setInitData(this._mineUser.getUser_id(), this._data);
            pop.openWithAction();
        }.bind(this));
    }
}

}