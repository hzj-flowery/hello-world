import { FunctionConst } from "../../../const/FunctionConst";
import { TenJadeAuctionConst } from "../../../const/TenJadeAuctionConst";
import { G_Prompt, G_ServerTime, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";
import CommonIconTemplateWithBg from "../../../ui/component/CommonIconTemplateWithBg";
import PopupBase from "../../../ui/PopupBase";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { handler } from "../../../utils/handler";
import ViewBase from "../../ViewBase";
import { TenJadeAuctionConfigHelper } from "../tenJadeAuction/TenJadeAuctionConfigHelper";

const {ccclass, property} = cc._decorator;
@ccclass

export default class CustomActivityTenJadeAuction extends ViewBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: CommonIconTemplateWithBg,
        visible: true
    })
    _commonIcon1: CommonIconTemplateWithBg = null;

    @property({
        type: CommonIconTemplateWithBg,
        visible: true
    })
    _commonIcon2: CommonIconTemplateWithBg = null;
    @property({
        type: CommonIconTemplateWithBg,
        visible: true
    })
    _commonIcon3: CommonIconTemplateWithBg = null;
    @property({
        type: CommonIconTemplateWithBg,
        visible: true
    })
    _commonIcon4: CommonIconTemplateWithBg = null;


    

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonGo: CommonButtonLevel0Highlight = null;

    
    private _countDownHandler:any;
    private _parentView:PopupBase;
    setInitData(parentView) {
        this._parentView = parentView;
        this._buttonGo.addTouchEventListenerEx(handler(this,this._onBtnGoOnClick),true)
    }
    onCreate() {
        this._initData();
        this._initView();
    }
    _initData() {
    }
    _initView() {
    }
    onEnter() {
        this._textTimeTitle.string = (Lang.get('ten_jade_auction_activity_time_title'));
        this._buttonGo.setString(Lang.get('ten_jade_auction_buy_now'));
        this._startCountDown();
        this._updateShowItem();
    }
    onExit() {
        this._stopCountDown();
    }
    refreshView() {
    }
    _startCountDown() {
        this._stopCountDown();
        this._countDownHandler = handler(this, this._onCountDown);
        this.schedule(this._countDownHandler,1);
        this._onCountDown();
    }
    _stopCountDown() {
        if (this._countDownHandler) {
            this.unschedule(this._countDownHandler);
            this._countDownHandler = null;
        }
    }
    _updateShowItem() {
        for (var i = 1; i <= 4; i++) {
            var [type, value] = TenJadeAuctionConfigHelper.getShowItem(i);
            this['_commonIcon' + i].unInitUI();
            this['_commonIcon' + i].initUI(type, value, 1);
            this['_commonIcon' + i].setImageTemplateVisible(true);
            this['_commonIcon' + i].setTouchEnabled(true);
        }
    }
    _onCountDown() {
        var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
        if (phase == TenJadeAuctionConst.PHASE_SHOW) {
            var startTime = G_UserData.getTenJadeAuction().getCurAuctionStartTime();
            this._textTime.string = (G_ServerTime.getLeftSecondsString(startTime));
        } else if (phase == TenJadeAuctionConst.PHASE_ITEM_SHOW) {
            this._textTimeTitle.node.x = (196);
            this._textTimeTitle.string = (Lang.get('ten_jade_auction_is_start'));
            this._textTime.node.active = (false);
        } else if (phase == TenJadeAuctionConst.PHASE_START) {
            this._textTimeTitle.node.x = (196);
            this._textTimeTitle.string = (Lang.get('ten_jade_auction_is_start'));
            this._textTime.node.active = (false);
        } else if (phase == TenJadeAuctionConst.PHASE_END || phase == TenJadeAuctionConst.PHASE_DEFAULT) {
            this._stopCountDown();
            this._textTimeTitle.node.x = (196);
            this._textTimeTitle.string = (Lang.get('ten_jade_auction_is_over'));
            this._textTime.node.active = (false);
        }
    }
    _onBtnGoOnClick() {
        var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
        if (phase == TenJadeAuctionConst.PHASE_END || phase == TenJadeAuctionConst.PHASE_DEFAULT) {
            G_Prompt.showTip(Lang.get('ten_jade_auction_is_over'));
            return;
        }
        // this._parentView.close();
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_TEN_JADE_AUCTION);
    }
}
