import PopupBase from "../../../ui/PopupBase";
import { G_SignalManager, G_EffectGfxMgr, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import PopupBossNode from "./PopupBossNode";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { EffectGfxData, EffectGfxType } from "../../../manager/EffectGfxManager";
import { FunctionConst } from "../../../const/FunctionConst";
import CommonHelp from "../../../ui/component/CommonHelp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupBossCome extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _popupBossNodePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    commonHelp: cc.Prefab = null;

    protected preloadEffectList: EffectGfxData[] = [
        { name: "moving_jingying_junqing", type: EffectGfxType.MovingGfx }
    ];

    public static BOSS_PRE_PAGE = 4;
    private _bossChapters: any[];
    private _pageIdx;
    private _totalPage;
    private _animOver;
    private _signalActDailyBoss;
    private _signalChapterInfoGet;
    private _nodes: PopupBossNode[];
    private _btnLeftPage: cc.Node;
    private _btnRightPage: cc.Node;

    public init(bossChapters) {
        this._bossChapters = bossChapters;
        this._pageIdx = 1;
        this._totalPage = Math.ceil(bossChapters.length / PopupBossCome.BOSS_PRE_PAGE);
        this._animOver = false;
    }

    onCreate() {
        this._nodes = [];
        this._playAnim();
    }

    onEnter() {
        this._signalActDailyBoss = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_DAILY_BOSS, handler(this, this._onEventDailyBoss));
        this._signalChapterInfoGet = G_SignalManager.add(SignalConst.EVENT_CHAPTER_INFO_GET, handler(this, this._onEventChapterInfoGet));
    }
    _onEventChapterInfoGet(event) {
        this._refreshView();
    }

    _onEventDailyBoss(eventName, ret) {
        this._refreshView();
    }

    _playAnim() {
        let effectFunction = (effect): cc.Node => {
            if (effect == 'jingying_xiangqing') {
                var helpNode = cc.instantiate(this.commonHelp);
                helpNode.getComponent(CommonHelp).updateUI(FunctionConst.FUNC_CHAPTER_BOSS);
                return helpNode;
            } else if (effect == 'jingying_zhangjie1') {
                let bossNode = cc.instantiate(this._popupBossNodePrefab).getComponent(PopupBossNode);
                bossNode.init(this._bossChapters[0]);
                this._nodes[0] = bossNode;
                return bossNode.node;
            } else if (effect == 'jingying_zhangjie2') {
                let bossNode = cc.instantiate(this._popupBossNodePrefab).getComponent(PopupBossNode);
                bossNode.init(this._bossChapters[1]);
                this._nodes[1] = bossNode;
                return bossNode.node;
            } else if (effect == 'jingying_zhangjie3') {
                let bossNode = cc.instantiate(this._popupBossNodePrefab).getComponent(PopupBossNode);
                bossNode.init(this._bossChapters[2]);
                this._nodes[2] = bossNode;
                return bossNode.node;
            } else if (effect == 'jingying_zhangjie4') {
                let bossNode = cc.instantiate(this._popupBossNodePrefab).getComponent(PopupBossNode);
                bossNode.init(this._bossChapters[3]);
                this._nodes[3] = bossNode;
                return bossNode.node;
            } else if (effect == 'jingying_close') {
                let params = { texture: Path.getEmbattle('btn_embattle_close') };
                let btnClose = UIHelper.createImage(params);
                btnClose.on(cc.Node.EventType.TOUCH_END, handler(this, this._onCloseClick));
                return btnClose;
            } else if (effect == 'jingying_jiantou_copy1') {
                let params = { texture: Path.getUICommon('img_com_arrow04') };
                let btn = UIHelper.createImage(params);
                btn.on(cc.Node.EventType.TOUCH_END, handler(this, this._onLeftPageClick));
                this._btnLeftPage = btn;
                return btn;
            } else if (effect == 'jingying_jiantou_copy2') {
                let params = { texture: Path.getUICommon('img_com_arrow04') };
                let btn = UIHelper.createImage(params);
                btn.on(cc.Node.EventType.TOUCH_END, handler(this, this._onRightPageClick));
                this._btnRightPage = btn;
                return btn;
            }
        }
        let eventFunction = (event) => {
            if (event == 'finish') {
                this._btnLeftPage.active = (false);
                this._animOver = true;
                this._refreshView();
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, 'moving_jingying_junqing', effectFunction, eventFunction, false);
    }

    _onLeftPageClick(sender, event) {
        if (this._pageIdx <= 1) {
            return;
        }
        this._pageIdx = this._pageIdx - 1;
        this._refreshPage();
    }

    _onRightPageClick(sender, event) {
        if (this._pageIdx >= this._totalPage) {
            return;
        }
        this._pageIdx = this._pageIdx + 1;
        this._refreshPage();
    }

    _refreshPage() {
        for (let i = 0; i < PopupBossCome.BOSS_PRE_PAGE; i++) {
            var bossIndex = (this._pageIdx - 1) * PopupBossCome.BOSS_PRE_PAGE + i;
            var bossData = this._bossChapters[bossIndex];
            this._nodes[i].refreshData(bossData);
        }
        if (this._pageIdx == 1) {
            this._btnLeftPage.active = (false);
        } else {
            this._btnLeftPage.active = (true);
        }
        if (this._bossChapters[this._pageIdx * PopupBossCome.BOSS_PRE_PAGE + 1 - 1]) {
            this._btnRightPage.active = (true);
        } else {
            this._btnRightPage.active = (false);
        }
    }

    onExit() {
        this._signalActDailyBoss.remove();
        this._signalActDailyBoss = null;
        this._signalChapterInfoGet.remove();
        this._signalChapterInfoGet = null;
    }

    _onCloseClick(sender, event) {
        this.close();
    }

    _refreshView() {
        if (!this._animOver) {
            return;
        }
        var chapterData = G_UserData.getChapter();
        var bossChapters = chapterData.getBossChapters();
        if (bossChapters.length <= 0) {
            this.close();
            return;
        }
        this._bossChapters = bossChapters;
        this._pageIdx = 1;
        this._totalPage = Math.ceil(bossChapters.length / PopupBossCome.BOSS_PRE_PAGE);
        this._refreshPage();
    }
}