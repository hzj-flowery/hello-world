import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import { G_RecoverMgr, G_SignalManager, Colors, G_ServerTime, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { assert } from '../../../utils/GlobleFunc';
import { Lang } from '../../../lang/Lang';
import { TextHelper } from '../../../utils/TextHelper';
import { SiegeHelper } from './SiegeHelper';
import { DataConst } from '../../../const/DataConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';

const { ccclass, property } = cc._decorator;
@ccclass
export default class SiegeChallengeInfo extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeActivityTime: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRecoverTime: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _tokenInfo: CommonResourceInfo = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountdown: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _hpPercentBG: cc.Sprite = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _progressHp: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _nowHp: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMaxHp: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHpPercent: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgress: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBoss: cc.Label = null;


    private _leaveTime;
    private _recoverUnit;
    private _needUpdateToken;
    private _isHalfTime;
    private _isLeave;
    private _signalUseItemMsg;

    public init() {
        this._leaveTime = 0;
        this._recoverUnit = G_RecoverMgr.getRecoverUnit(G_RecoverMgr.INDEX_TOKEN);
        this._needUpdateToken = false;
        this._isHalfTime = false;
        this._isLeave = false;
        this._tokenInfo.onLoad();
    }

    public onLoad() {

    }

    public onEnable() {
        this._signalUseItemMsg = G_SignalManager.add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(this, this._onEventUseItem));
    }

    public onDisable() {
        this._signalUseItemMsg.remove();
        this._signalUseItemMsg = null;
    }

    public updateUI(config, data) {
        if (!data) {
          //assert((false, 'SiegeChallengeInfo:updateUI data is nil');
            return;
        }
        this._textBoss.string = (config.name);
        this._textBoss.node.color = (Colors.getColor(config.color));
        UIHelper.enableOutline(this._textBoss, Colors.getColorOutline(config.color), 2);
        var level = data.getBoss_level();
        this._textLevel.string = (Lang.get('siege_come_level', { count: level }));
        var nowHp = TextHelper.getAmountText3(data.getHp_now());
        this._nowHp.string = (nowHp);
        var maxHp = TextHelper.getAmountText3(data.getHp_max());
        this._textMaxHp.string = ('/' + maxHp);
        var hpPercent = Math.ceil(data.getHp_now() / data.getHp_max() * 100);
        this._textHpPercent.string = ('( ' + (hpPercent + '% )'));
        this._progressHp.progress = (hpPercent)/100;
        this._leaveTime = data.getEnd_time();
        this._refreshActivityTime();
        this._refreshTokenInfo();
        this._refreshRunTime();
        var hpProgressTxt = Lang.get('siege_challengeinfo_hp_progress', {
            min: nowHp,
            max: maxHp,
            percent: hpPercent
        });
        // this._createProgressRichText(hpProgressTxt);
    }

    private _createProgressRichText(richText) {
        this._nodeProgress.removeAllChildren();
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(0.5, 0.5);
        this._nodeProgress.addChild(widget.node);
    }

    private _refreshActivityTime() {
        let args: any[] = SiegeHelper.getHalfTimeString();
        this._isHalfTime = args[0];
        let timeText = args[1];
        if (timeText != null) {
            this._nodeActivityTime.addChild(timeText);
        }
    }

    private _refreshRunTime() {
        var timeDiff = this._leaveTime - G_ServerTime.getTime();
        if (timeDiff > 0) {
            this._textCountdown.string = (G_ServerTime._secondToString(timeDiff));
        } else {
            this._textCountdown.string = (Lang.get('siege_has_left'));
            this._isLeave = true;
        }
    }

    private _refreshTokenInfo() {
        var maxCount = this._recoverUnit.getMaxLimit();
        var myToken = G_UserData.getBase().getResValue(DataConst.RES_TOKEN);
        this._tokenInfo.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOKEN, myToken);
        this._tokenInfo.setCount(myToken, maxCount);
        this._tokenInfo.setTextColorToDTypeColor();
        if (myToken < maxCount) {
            this._tokenInfo.showImageAdd(true, true);
            this._textRecoverTime.node.active = (true);
            this._needUpdateToken = true;
            var remainTime = this._recoverUnit.getRemainCount();
            var timeString = G_ServerTime._secondToString(remainTime);
            this._textRecoverTime.string = (Lang.get('siege_token_countdown', { time: timeString }));
        } else {
            this._tokenInfo.showImageAdd(false);
            this._textRecoverTime.node.active = (false);
            this._needUpdateToken = false;
        }
    }

    public setUpdate() {
        this._refreshRunTime();
        if (this._needUpdateToken) {
            this._refreshTokenInfo();
        }
    }

    public isHalfTime() {
        return this._isHalfTime;
    }

    public isLeave() {
        return this._isLeave;
    }

    public _onEventUseItem(eventName) {
        this._refreshTokenInfo();
    }
}