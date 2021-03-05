const { ccclass, property } = cc._decorator;

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { G_SignalManager, G_UserData, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import ChapterConst from '../../../const/ChapterConst';
import { DropHelper } from '../../../utils/DropHelper';
import { ReportParser } from '../../../fight/report/ReportParser';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';

@ccclass
export default class PopupGeneralDetail extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelBase: cc.Node = null;

    @property({ type: CommonNormalMidPop, visible: true })
    _panelBG: CommonNormalMidPop = null;

    @property({ type: cc.Sprite, visible: true })
    _imageChapter: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textDetail: cc.Label = null;

    @property({ type: CommonListViewLineItem, visible: true })
    _listDrop: CommonListViewLineItem = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnFight: CommonButtonLevel0Highlight = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePass: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textOpenInfo: cc.Label = null;

    private _data;
    private _configData;
    private _signalFightGeneral;
    public init(data) {
        this._data = data;
        this._configData = data.getConfigData();
        this._signalFightGeneral = null;
        this._btnFight.addClickEventListenerEx(handler(this, this._onFightClick));
    }

    public onCreate() {
        this._textDetail.string = (this._configData.des);
        this._btnFight.setString(Lang.get('stage_fight'));
        this._panelBG.addCloseEventListener(handler(this, this._onCloseClick));
        this._panelBG.setTitle(this._configData.name);
        var pic = Path.getFamousImage(this._configData.pic);
        UIHelper.loadTexture(this._imageChapter, pic);
        this._updateDropList();
        this._refreshFightState();
    }

    public onEnter() {
        this._signalFightGeneral = G_SignalManager.add(SignalConst.EVENT_CHALLENGE_HERO_GENERAL, handler(this, this._onEventFightGeneral));
    }

    public onExit() {
        this._signalFightGeneral.remove();
        this._signalFightGeneral = null;
    }

    public _refreshFightState() {
        this._btnFight.setVisible(false);
        this._imagePass.node.active = (false);
        this._textOpenInfo.node.active = (false);
        if (this._data.isPass()) {
            this._imagePass.node.active = (true);
        } else {
            var chapterData = G_UserData.getChapter().getChapterByTypeId(ChapterConst.CHAPTER_TYPE_FAMOUS, this._configData.need_chapter);
            if (chapterData.isLastStagePass()) {
                this._btnFight.setVisible(true);
            } else {
                this._textOpenInfo.node.active = (true);
                this._textOpenInfo.string = (Lang.get('general_open_info', { name: chapterData.getConfigData().name }));
            }
        }
    }

    public _onCloseClick() {
        this.closeWithAction();
    }

    public _onFightClick() {
        G_UserData.getChapter().c2sChallengeHeroChapter(this._configData.id);
    }

    public _updateDropList() {
        var awards = DropHelper.getStageDrop(this._configData);
        this._listDrop.setListViewSize(450, 100);
        this._listDrop.updateUI(awards, 1, false, true);
        this._listDrop.setItemsMargin(20);
    }

    public _onEventFightGeneral(eventName, message) {
        let enterFightView = () => {
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseFamousDungeon(message, this._data);
            G_SceneManager.showScene('fight', reportData, battleData);
            if (message.win) {
                this.close();
            }
        }
        G_SceneManager.registerGetReport(message.battle_report, () => {
            enterFightView();
        });
    }
}