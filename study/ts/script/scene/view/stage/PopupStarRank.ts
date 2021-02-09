const { ccclass, property } = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonRankIcon from '../../../ui/component/CommonRankIcon'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import ListView from '../recovery/ListView';
import PopupStarRankNode from './PopupStarRankNode';
import { Color } from '../../../utils/Color';
import ChapterConst from '../../../const/ChapterConst';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';

@ccclass
export default class PopupStarRank extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _rankBase: CommonNormalMidPop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: CommonRankIcon,
        visible: true
    })
    _myRank: CommonRankIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyChapter: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyStar: cc.Label = null;

    @property({
        type: ListView,
        visible: true
    })
    _listRank: ListView = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _popupStarRankNodePrefab: cc.Prefab = null;

    private _rankType;
    private _data;

    public static waitEnterMsg(callBack, params) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getStarRankData().c2sGetStageStarRank(params[0]);
        var signal = G_SignalManager.add(SignalConst.EVENT_CHAPTER_STAR_RANK, onMsgCallBack);
        return signal;
    }
    init(rankType) {
        this._rankType = rankType;
        this._data = G_UserData.getStarRankData();
    }
    onCreate() {
        this._rankBase.addCloseEventListener(handler(this, this._onCloseClick));
        this._rankBase.setTitle(Lang.get('mission_star_rank_title'));
        this._setMyInfo();
        var rankData = this._data.getRankDatas();
        this._listRank.setTemplate(this._popupStarRankNodePrefab);
        this._listRank.setCallback(handler(this, this._onRankUpdate));
        this._listRank.resize(rankData.length);
        this._nodeEmpty.node.active = (rankData.length <= 0);
    }
    _onRankUpdate(node:cc.Node, index) {
        var rankData = this._data.getRankDatas();
        if (rankData.length > 0) {
            let item = node.getComponent(PopupStarRankNode);
            item.refreshInfo(rankData[index]);
        }
    }
    _onItemSelected(item, index) {
    }
    onEnter() {
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
    }
    onExit() {
    }
    _onCloseClick() {
        this.closeWithAction();
    }
    _setMyInfo() {
        var myRank = this._data.getSelfRank();
        if (myRank == 0) {
            this._textMyRank.string = (Lang.get('mission_star_no_rank'));
            this._myRank.node.active = (false);
        } else if (myRank < 4) {
            var icon = Path.getRankIcon(myRank);
            this._textMyRank.node.active = (false);
            this._myRank.node.active = (true);
            this._myRank.setRank(myRank);
        } else {
            this._textMyRank.string = (myRank);
            this._textMyRank.node.active = (true);
            this._myRank.node.active = (false);
        }
        var myName = G_UserData.getBase().getName();
        this._textMyName.string = (myName);
        var officerLevel = G_UserData.getBase().getOfficer_level();
        this._textMyName.node.color = (Color.getOfficialColor(officerLevel));
        UIHelper.updateTextOfficialOutline(this._textMyName.node, officerLevel);
        var chapters = null;
        if (this._rankType == ChapterConst.CHAPTER_TYPE_NORMAL) {
            chapters = G_UserData.getChapter().getChapters();
        } else if (this._rankType == ChapterConst.CHAPTER_TYPE_ELITE) {
            chapters = G_UserData.getChapter().getE_chapters();
        }
        var maxChapterId = 0;
        for (let i in chapters) {
            var val = chapters[i];
            if (val.getChapterStar() != 0) {
                maxChapterId = val.getId();
            }
        }
        maxChapterId = maxChapterId % 1000;
        this._textMyChapter.string = (Lang.get('mission_star_chapter', { num: maxChapterId }));
        this._textMyStar.string = (this._data.getStar());
    }
}