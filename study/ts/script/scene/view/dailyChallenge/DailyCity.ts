const {ccclass, property} = cc._decorator;

import CommoRedPointNumBig from '../../../ui/component/CommoRedPointNumBig'
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { G_UserData, G_ServerTime, G_ConfigLoader, G_Prompt, G_SignalManager } from '../../../init';
import { TimeConst } from '../../../const/TimeConst';
import { Lang } from '../../../lang/Lang';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import ViewBase from '../../ViewBase';
import PopupBase from '../../../ui/PopupBase';
import PopupDailyChoose from './PopupDailyChoose';

@ccclass
export default class DailyCity extends ViewBase {

   @property({
       type: cc.Button,
       visible: true
   })
   _btnCity: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageNameBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageName: cc.Sprite = null;

   @property({
       type: CommoRedPointNumBig,
       visible: true
   })
   _commonRedPointNum: CommoRedPointNumBig = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCloseBG: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCloseTip: cc.Label = null;

    _info:any;
    _openDays:any[];
    _open:boolean;
    _tipString:string;
    _firstLevel:number;
    _bLevelEnough:boolean;
    _signalRedPointUpdate:any;
    _signalDailyDungeonEnter:any;

    ctor(info) {
        this._info = info;
        this._openDays = [];
        this._open = false;
        this._tipString = '';
        this._firstLevel = 0;
        this._bLevelEnough = false;
        UIHelper.addEventListener(this.node, this._btnCity, 'DailyCity', '_onCityClick');
        this.node.name = ('DailyCity' + info.id);
    }
    onCreate() {
        var cityNameX = this._info.x_position;
        var cityNameY = this._info.y_position;
        var callBack = function (imageName:cc.Sprite) {
            var imageNameSize = imageName.node.getContentSize();
            var imageNameBgSize = this._imageNameBG.node.getContentSize();
            imageNameBgSize.height = imageNameSize.height + 40;
            this._imageNameBG.node.setContentSize(imageNameBgSize);
            this._commonRedPointNum.node.y = (imageNameBgSize.height*0.5);
        }.bind(this);

        UIHelper.loadTextureAutoSize(this._imageName, Path.getChallengeText(this._info.pic), callBack);

        //var imageNameBgSize1 = this._imageNameBG.node.getContentSize();
        this._imageNameBG.node.setPosition(cityNameX, cityNameY);
        // this._commonRedPointNum.node.y = (imageNameBgSize1.height * 0.5 - 15);
        this._openDays = [];
        for (var i = 1; i<=this._info.week_open_queue.length; i++) {
            this._openDays.push(parseInt(this._info.week_open_queue[i-1]) == 1);
        }
    }
    refreshData() {
        var todayLevel = G_UserData.getBase().getToday_init_level();
        var nowLevel = G_UserData.getBase().getLevel();
        if (!this._isLevelEnough()) {
            this._open = false;
        } else {
            if (this._isOpenToday()) {
                this._open = true;
            } else if (todayLevel < this._firstLevel && nowLevel >= this._firstLevel) {
                this._open = true;
            } else {
                var days = this._getOpenDays();
                var strDays = '';
                var strDays2 = '';
                for (var i = 1; i<=days.length - 1; i++) {
                    strDays = strDays + (Lang.get('open_days')[days[i-1]-1] + ', ');
                    strDays2 = strDays + Lang.get('open_days')[days[i-1]-1];
                }
                strDays = strDays + Lang.get('open_days')[days[days.length-1]-1];
                this._tipString = Lang.get('open_string', { str: strDays });
                this._open = false;
            }
        }
        this._textCloseTip.string = (this._tipString);
        this._refreshState();
    }
    _refreshState() {
        UIHelper.loadTexture(this._imageName, Path.getChallengeText(this._open && this._info.pic || this._info.pic + 'b'));
    }
    _isOpenToday() {
        var data = G_ServerTime.getDateObject(null, TimeConst.RESET_TIME_SECOND);
        let day = data.getDay();
        day = day == 0 ? 0 : day;
        return this._openDays[day];
    }
    _getOpenDays():any[] {
        var openDays = [];
        for (var i=1; i<=this._openDays.length; i++) {
            var open = this._openDays[i-1];
            if (open) {
                openDays.push(i);
            }
        }
        var sortfunction = function (obj1, obj2):number {
            if(obj1 == 1){
                return 1;
            }
            if(obj2 == 1){
                return -1;
            }
            // if (obj1 == 1 || obj2 == 1) {
            //     return obj1 != 1;
            // }
            return obj1 - obj2;
        }.bind(this);
        openDays.sort(sortfunction);
        return openDays;
    }
    _isLevelEnough() {
        var myLevel = G_UserData.getBase().getLevel();
        var firstLevel = this._getFirstLevel();
        this._tipString = Lang.get('daily_open_tips', {
            count: firstLevel,
            name: this._info.name
        });
        this._bLevelEnough = myLevel >= firstLevel;
        return myLevel >= firstLevel;
    }
    _getFirstLevel() {
        var DailyDungeon = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON);
        var DailyDungeonCount = DailyDungeon.length();
        for (var i = 1; i<=DailyDungeonCount; i++) {
            var info = DailyDungeon.indexOf(i-1);
            if (info.type == this._info.id && info.pre_id == 0) {
                this._firstLevel = info.level;
                return this._firstLevel;
            }
        }
    }
    _onCityClick() {
        if (this._open) {
            var info = this._info;
            PopupBase.loadCommonPrefab('PopupDailyChoose',(popup:PopupDailyChoose)=>{
                popup.ctor(info);
                popup.openWithAction();
            });
        } else {
            G_Prompt.showTip(this._tipString);
        }
    }
    onEnter() {
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalDailyDungeonEnter = G_SignalManager.add(SignalConst.EVENT_DAILY_DUNGEON_ENTER, handler(this, this._onEventDailyDungeonEnter));
        this.refreshData();
        this._refreshRedPoint();
    }
    onExit() {
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalDailyDungeonEnter.remove();
        this._signalDailyDungeonEnter = null;
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_DAILY_STAGE) {
            this._refreshRedPoint();
        }
    }
    _onEventDailyDungeonEnter(event) {
        this.refreshData();
    }
    _refreshRedPoint() {
        var showRedPoint = G_UserData.getDailyDungeonData().dungeonIsHasRemainCountRedPoint(this._info.id);
        this._commonRedPointNum.node.active = (showRedPoint);
        this._commonRedPointNum.showNum(G_UserData.getDailyDungeonData().getRemainCount(this._info.id));
    }

}
