import CommonListItem from "../../../ui/component/CommonListItem";
import { G_ServerTime, Colors, G_UserData, G_ConfigLoader } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";
import { Path } from "../../../utils/Path";
import CommonUI from "../../../ui/component/CommonUI";
import UIHelper from "../../../utils/UIHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import { RedPointHelper } from "../../../data/RedPointHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DailyActivityHintCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _bgImage: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _icon: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _openTime1: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _openTime2: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _title: cc.Label = null;
   
   private _isHighlight:boolean;
   private _clickCallback:any;
   private _cellIndex:number;
   private _data:any;
   private _beganClickPoint:cc.Vec2
   private _isClick:boolean;

   setInitData(index:number, callback) {
    this._isHighlight = false;
    this._clickCallback = callback;
    this._cellIndex = index;
}
onCreate() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._bgImage.node.on(cc.Node.EventType.TOUCH_START,this._onTouchBeganEvent,this);
    this._bgImage.node.on(cc.Node.EventType.MOUSE_MOVE,this._onTouchMoveEvent,this);
    this._bgImage.node.on(cc.Node.EventType.TOUCH_END,this._onTouchEndEvent,this);
}
updateUI(data, curSelectCellIndex) {
    this._data = data;
    var date:any = G_ServerTime.getDateObject();
    var curTodayTime = date.hour * 3600 + date.min * 60 + date.sec;
    this._showRedPoint(this._data.function_id);
    if (this._data.isTodayOpen) {
        if (this._data.isTodayEnd) {
            if (this._data.isTomorrowOpen) {
                this._openTime1.node.color = (Colors.BRIGHT_BG_ONE);
                this._openTime1.string = (Lang.get('lang_time_limit_activity_today_end'));
                this._openTime2.node.active = (false);
            } else {
                this._openTime1.node.color = (Colors.BRIGHT_BG_ONE);
                this._openTime1.string = (this._data.start_des);
                this._openTime2.node.active = (true);
                this._openTime2.string = (Lang.get('lang_time_limit_activity_open_text'));
            }
        } else {
            this._openTime1.node.color = (Colors.BRIGHT_BG_GREEN);
            this._openTime2.node.active = (false);
            if (this._data.isOpenIng) {
                this._openTime1.string = (Lang.get('lang_time_limit_activity_ing'));
            } else {
                var hour = Math.floor(this._data.startTime / 3600);
                var min = Math.floor(this._data.startTime % 3600 / 60);
                var timeStr:string = "";
                if(hour<10)
                timeStr = "0"+hour;
                else
                timeStr = hour+"";
                if(min<10)
                timeStr = timeStr +":0"+min;
                else
                timeStr = timeStr+":"+min;
                this._openTime1.string = (Lang.get('lang_time_limit_activity_open_time', { time: timeStr }));
            }
        }
    } else {
        if (this._data.openServerTimeOpen > 0) {
            var openServerNum = G_UserData.getBase().getOpenServerDayNum();
            var leftDay = this._data.openServerTimeOpen - openServerNum;
            if (leftDay > 0) {
                this._openTime1.node.color = (Colors.BRIGHT_BG_ONE);
                this._openTime1.string = (Lang.get('lang_time_limit_activity_open_server_time', { num: leftDay }));
                this._openTime2.node.active = (false);
            } else {
                this._openTime1.node.color = (Colors.BRIGHT_BG_ONE);
                this._openTime1.string = (this._data.start_des);
                this._openTime2.node.active = (true);
                this._openTime2.string = (Lang.get('lang_time_limit_activity_open_text'));
            }
        } else {
            this._openTime1.node.color = (Colors.BRIGHT_BG_ONE);
            this._openTime1.string = (this._data.start_des);
            this._openTime2.node.active = (true);
            this._openTime2.string = (Lang.get('lang_time_limit_activity_open_text'));
        }
    }
    var FunctionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
    var functionConfig = FunctionLevelConfig.get(this._data.function_id);
  //assert((functionConfig != null, 'functionConfig can not find');
    this._title.string = (this._data.title);
    var iconPath;
    if (this._data.icon && this._data.icon != '') {
        iconPath = Path.getLimitActivityIcon(this._data.icon);
    } else {
        iconPath = Path.getCommonIcon('main', functionConfig.icon);
    }
    this._icon.node.addComponent(CommonUI).loadTexture(iconPath);
    this.setHighlight(this._cellIndex == curSelectCellIndex);
}
setHighlight(trueOrFalse) {
    if (trueOrFalse) {
        this._bgImage.node.addComponent(CommonUI).loadTexture(Path.getTask('img_task02c'));
        this._bgImage.node.y = 0;
    } else {
        this._bgImage.node.addComponent(CommonUI).loadTexture(Path.getTask('img_task02b'));
        this._bgImage.node.y = (414-378);
    }
}
playActionOut(time, callback) {
    this._bgImage.node.stopAllActions();
    this._bgImage.node.addComponent(CommonUI).loadTexture(Path.getTask('img_task02b'));
    this._bgImage.node.y= 0;
    var moveAction = cc.moveTo(time, new cc.Vec2(this._bgImage.node.x, 414-378));
    var callAction = cc.callFunc(function () {
        this._bgImage.node.addComponent(CommonUI).loadTexture(Path.getTask('img_task02b'));
        if (callback) {
            callback();
        }
    }.bind(this));
    var seqAction = cc.sequence(moveAction, callAction);
    this._bgImage.node.runAction(seqAction);
}
playActionIn(time, callback) {
    this._bgImage.node.stopAllActions();
    this._bgImage.node.addComponent(CommonUI).loadTexture(Path.getTask('img_task02c'));
    this._bgImage.node.y = (414-378);
    var moveAction = cc.moveTo(time, new cc.Vec2(this._bgImage.node.x,0));
    var callAction = cc.callFunc(function () {
        this._bgImage.node.addComponent(CommonUI).loadTexture(Path.getTask('img_task02c'));
        if (callback) {
            callback();
        }
    }.bind(this));
    var seqAction = cc.sequence(moveAction, callAction);
    this._bgImage.node.runAction(seqAction);
}
_onTouchBeganEvent(touch:cc.Touch, event) {
    var touchPoint = touch.getLocation();
    var locationInNode = this._bgImage.node.convertToNodeSpace(touchPoint);
    var s = this._bgImage.node.getContentSize();
    var rect = cc.rect(0, 0, s.width, s.height);
    if (rect.contains(locationInNode)) {
        this._beganClickPoint = touchPoint;
        this._isClick = true;
        return true;
    }
}
_onTouchMoveEvent(touch, event) {
    var newPoint = touch.getLocation();
    if (this._beganClickPoint && this._isClick) {
        if (Math.abs(this._beganClickPoint.x - newPoint.x) > 15 || Math.abs(this._beganClickPoint.y - newPoint.y) > 15) {
            this._isClick = false;
        }
    }
}
_onTouchEndEvent(touch, event) {
    if (this._isClick && this._clickCallback) {
        this._clickCallback(this._cellIndex);
    }
    this._beganClickPoint = null;
    this._isClick = false;
}
_showRedPoint(funcId) {
    var redImg = this._resourceNode.getChildByName('redPoint');
    if (!redImg) {
        redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
        redImg.name = ('redPoint');
        redImg.setPosition(30, this._resourceNode.getContentSize().height - 30);
        this._resourceNode.addChild(redImg);
    }
    if (funcId == FunctionConst.FUNC_CAMP_RACE) {
        var showCmpRaceRedPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE);
        redImg.active = (showCmpRaceRedPoint);
    } else {
        redImg.active = (false);
    }
}


}