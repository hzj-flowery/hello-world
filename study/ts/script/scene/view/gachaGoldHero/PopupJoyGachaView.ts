const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import { Colors, G_UserData, G_ServerTime, G_SignalManager } from '../../../init';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Lang } from '../../../lang/Lang';
import GachaGoldenHeroHelper from './GachaGoldenHeroHelper';
import { Path } from '../../../utils/Path';
import { GachaGoldenHeroConst } from '../../../const/GachaGoldenHeroConst';
import UIHelper from '../../../utils/UIHelper';
import { table } from '../../../utils/table';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class PopupJoyGachaView extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonBack: CommonNormalMidPop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBack: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCurCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCurTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNextCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNextTime: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAwardsNum: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGroup: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGroup: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRewardDesc: cc.Sprite = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _commonFoward: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageZhaomuCon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeZhaomuCondition: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDrawCount: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDrawCount: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPrize: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCurLuckPerson: cc.Label = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _scrollViewAward: CommonCustomListViewEx = null;

    @property(cc.Prefab)
    bonusPoolAwardCell:cc.Prefab = null;

    _poolData: any;
    _countDownHandler: any;
    _prizeLists: any;
    _closeBack: any;
    _signalLuckList: any;
    _countDownScheduler: any;

    public static path:string = 'gachaGoldHero/PopupJoyGachaView';


    ctor(closeBack) {
        this._countDownHandler = null;
        this._closeBack = closeBack;

        this.setSceneSize();
        UIHelper.addEventListener(this.node, this._commonFoward._button, 'PopupJoyGachaView', '_onButtonForward');
        this.node.name = ('PopupJoyGachaView');
    }
    onCreate() {
        this._poolData = GachaGoldenHeroHelper.getGachaState();
        this._prizeLists = G_UserData.getGachaGoldenHero().getPrizeLists();
        this._initRewardsScrollView();
    }
    onEnter() {
        this._signalLuckList = G_SignalManager.add(SignalConst.EVENT_GACHA_GOLDENHERO_LUCKLIST, handler(this, this._onEventLuckList));
        this._initCommonBack();
        this._updateStateData();
        this._updateDropIcon();
        this._updateRewardMember();
        this._updateCountDown();
        this._updateEnterPrizeLists();
        this._countDownScheduler = handler(this, this._update);
        this.schedule(this._countDownScheduler, 0.5);
    }
    onExit() {
        this._signalLuckList.remove();
        this._signalLuckList = null;
        this._endSchedule();
        if (this._countDownScheduler) {
            this.unschedule(this._countDownScheduler);
            this._countDownScheduler = null;
        }
    }
    _onEventLuckList() {
        this._updateEnterPrizeLists();
        this._updateStateData();
    }
    _initCommonBack() {
        this._commonBack.setTitle(Lang.get('gacha_goldenhero_joytitle'));
        this._commonBack.addCloseEventListener(handler(this, this._btnClose));
        this._commonFoward.setString(Lang.get('gacha_goldenhero_forward'));
    }
    _onButtonForward() {
        if (this._closeBack) {
            this._closeBack();
        }
        this.close();
        G_UserData.getGachaGoldenHero().setAutoPopupJoy(false);
    }
    _btnClose() {
        if (this._closeBack) {
            this._closeBack();
        }
        this.close();
        G_UserData.getGachaGoldenHero().setAutoPopupJoy(false);
    }
    _initRewardsScrollView() {
        this._scrollViewAward.setCallback(handler(this, this._onCellUpdate), handler(this, this._onCellSelected));
        this._scrollViewAward.setCustomCallback(handler(this, this._onCellTouch));
        this._scrollViewAward.setTemplate(this.bonusPoolAwardCell);
    }
    _updateListView() {
        var awards = this._prizeLists.length;
        var lineCount = Math.ceil(awards / 2);
        this._scrollViewAward.resize(lineCount);
    }
    _updateEnterPrizeLists() {
        this._prizeLists = G_UserData.getGachaGoldenHero().getPrizeLists();
        this._updateListView();
        this._updateRewardsImg();
    }
    _onCellUpdate(cell, cellIdx) {
        if (this._prizeLists.length <= 0) {
            return;
        }
        var cellData = [];
        var cellStartIdx = cellIdx * 2 + 1;
        var cellEndIdx = cellIdx * 2 + 2;
        for (var i = cellStartIdx; i<=cellEndIdx; i++) {
            if (this._prizeLists[i-1]) {
                table.insert(cellData, this._prizeLists[i-1]);
            }
        }
        cell.updateUI(cellData);
    }
    _onCellSelected(cell, cellIdx) {
    }
    _onCellTouch(cellIdx, callBackData) {
    }
    _updateStateData() {
        if (this._poolData && this._poolData.stage <= 0) {
            return;
        }
        var isLottery = this._poolData.isLottery;
        var isCrossDay = this._poolData.isCrossDay;
        this._imageRewardDesc.node.active = (!isCrossDay && isLottery);
        this._imageZhaomuCon.node.active = (!isLottery);
        this._commonFoward.setVisible(!isLottery);
        this._textCurCountDown.node.active = (!isLottery);
        this._textCurTime.node.active = (!isLottery);
        this._imageGroup.node.active = (!isLottery);
        this._textNextCountDown.node.active = (isLottery);
        this._textNextTime.node.active = (isLottery);
        this._textCurLuckPerson.node.active = (isLottery);
        this._panelPrize.active = (isLottery);
        var imgBackName = isLottery && GachaGoldenHeroConst.DRAW_JOY_BACKBG[1] || GachaGoldenHeroConst.DRAW_JOY_BACKBG[0];
        UIHelper.loadTexture(this._imageBack, Path.getGoldHeroJPG(imgBackName));
        //this._imageBack.ignoreContentAdaptWithSize(true);
    }
    _updateRewardsImg() {
        this._prizeLists = G_UserData.getGachaGoldenHero().getPrizeLists();
        var imgStateName = GachaGoldenHeroHelper.isLottery(this._prizeLists) && GachaGoldenHeroConst.DRAW_JOY_STATE[0] || GachaGoldenHeroConst.DRAW_JOY_STATE[1];
        UIHelper.loadTexture(this._imageRewardDesc, Path.getGoldHeroTxt(imgStateName));
        //this._imageRewardDesc.ignoreContentAdaptWithSize(true);
    }
    _updateCountDown() {
        if (this._poolData && this._poolData.stage <= 0) {
            return;
        }
        var leftTime = G_ServerTime.getLeftSeconds(this._poolData.countDowm);
        if (leftTime <= 0) {
            this._poolData = GachaGoldenHeroHelper.getGachaState();
            if (this._poolData.isLottery) {
                G_UserData.getGachaGoldenHero().setLuck_draw_num(0);
            }
            this._updateStateData();
            this._startCountDown();
        }
        var times = G_ServerTime.getLeftDHMSFormatEx(this._poolData.countDowm);
        if (this._poolData.isLottery) {
            this._updateRewardsImg();
            if (this._poolData.isOver) {
                this._textNextCountDown.string = (Lang.get('gacha_goldenhero_joy_overcountdown'));
            } else {
                this._textNextCountDown.string = (Lang.get('gacha_goldenhero_joy_nextcountdown'));
            }
            this._textNextTime.string = (times).toString();
        } else {
            if (this._poolData.stage == 0 || this._poolData.isCrossDay == true) {
                this._textCurCountDown.string = (Lang.get('gacha_goldenhero_joy_opencountdown'));
            } else {
                this._textCurCountDown.string = (Lang.get('gacha_goldenhero_joy_drawcountdown'));
            }
            this._textCurTime.string = times.toString();
        }
    }
    _startCountDown() {
        this._endSchedule();
        this._countDownHandler = function () {
            this._updateDropIcon();
            this._updateRewardsImg();
            this._updateRewardMember();
        }.bind(this);
        this.scheduleOnce(this._countDownHandler, 1);
    }
    _endSchedule() {
        if (this._countDownHandler) {
            this.unschedule(this._countDownHandler);
            this._countDownHandler = null;
        }
    }
    _updateDropIcon() {
        if (!this._poolData) {
            return;
        }
        var id = G_UserData.getGachaGoldenHero().getDrop_id();
        var data = GachaGoldenHeroHelper.getGoldenHeroDraw(id);
        if (this._poolData.isLottery) {
            data = GachaGoldenHeroHelper.getLastReward(id);
        }
        if (data == null) {
            return;
        }
        this._fileNodeIcon.unInitUI();
        this._fileNodeIcon.initUI(data.type, data.value, 1);
        this._fileNodeIcon.setTouchEnabled(true);
        var params = this._fileNodeIcon.getItemParams();
        this._textAwardsNum.string = (Lang.get('gacha_goldenhero_joyawardnum', {
            name: params.name,
            num: data.size
        }));
        this._textAwardsNum.node.color = (params.icon_color);
        this._textGroup.string = (Lang.get('gacha_goldenhero_awardsgroup', { group: data.group }));
    }
    _updateRewardMember() {
        var drawNum = G_UserData.getGachaGoldenHero().getLuck_draw_num();
        if (this._poolData.isLottery || this._poolData.isCrossDay) {
            drawNum = 0;
        }
        this._textDrawCount.string = (Lang.get('gacha_goldenhero_awardnum', { num: drawNum }));
        var strDesc = drawNum > 0 && Lang.get('gacha_goldenhero_award') || Lang.get('gacha_goldenhero_donotaward');
        this._nodeZhaomuCondition.removeAllChildren();
        var richText = RichTextExtend.createRichTextByFormatString(strDesc, {
            defaultColor: Colors.DARK_BG_THREE,
            defaultSize: 22,
            other: { 1: { fontSize: 22 } }
        });
        richText.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._nodeZhaomuCondition.addChild(richText.node);
    }
    _update(dt) {
        this._updateCountDown();
    }

}
