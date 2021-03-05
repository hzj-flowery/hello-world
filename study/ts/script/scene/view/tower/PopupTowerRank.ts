const { ccclass, property } = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonRankIcon from '../../../ui/component/CommonRankIcon'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import { G_UserData, G_SceneManager, Colors } from '../../../init';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import PopupTowerRankNode from './PopupTowerRankNode';
import PopupBase from '../../../ui/PopupBase';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import ListView from '../recovery/ListView';

@ccclass
export default class PopupTowerRank extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelBase: cc.Node = null;

    @property({ type: CommonNormalMidPop, visible: true })
    _rankBase: CommonNormalMidPop = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBG: cc.Sprite = null;

    @property({ type: CommonRankIcon, visible: true })
    _myRank: CommonRankIcon = null;

    @property({ type: cc.Label, visible: true })
    _textMyRank: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textMyName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textMyChapter: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textMyStar: cc.Label = null;

    @property({ type: ListView, visible: true })
    _listRank: ListView = null;

    @property({ type: cc.Sprite, visible: true })
    _titleBG: cc.Sprite = null;

    @property({ type: CommonEmptyListNode, visible: true })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({ type: cc.Prefab, visible: true })
    _rankNodePrefab: cc.Prefab = null;

    private _data;
    private _rankData;

    public onCreate() {
        this.setClickOtherClose(true);
        this._data = G_UserData.getTowerRankData();

        this._rankBase.addCloseEventListener(handler(this, this._onCloseClick));
        this._rankBase.setTitle(Lang.get('challenge_tower_rank_title'));
        this._setMyInfo();
        this._rankData = this._data.getRankDatas();

        this._nodeEmpty.node.active = (this._rankData.length <= 0);

        this._listRank.setTemplate(this._rankNodePrefab);
        this._listRank.setCallback(handler(this, this._onRankUpdate));
        this._listRank.setData(this._rankData);
    }

    public onEnter() {
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
    }

    public onExit() {
    }

    private _onRankUpdate(node: cc.Node, index) {
        let item: PopupTowerRankNode = node.getComponent(PopupTowerRankNode);
        var rankData = this._rankData;
        if (rankData.length > 0) {
            item.updateUI(rankData[index]);
        }
    }

    private _onCloseClick() {
        this.closeWithAction();
    }

    private _setMyInfo() {
        var myRank = this._data.getSelfRank();
        if (myRank == 0) {
            this._textMyRank.string = (Lang.get('mission_star_no_rank'));
            this._myRank.node.active = (false);
        } else if (myRank < 4) {
            var icon = Path.getRankIcon(myRank);
            this._textMyRank.node.active = (false);
            this._myRank.setRank(myRank);
        } else {
            this._textMyRank.string = (myRank);
            this._textMyRank.node.active = (true);
            this._myRank.node.active = (false);
        }
        var myName = G_UserData.getBase().getName();
        this._textMyName.string = (myName);
        var officerLevel = G_UserData.getBase().getOfficer_level();
        this._textMyName.node.color = (Colors.getOfficialColor(officerLevel));
        UIHelper.updateTextOfficialOutline(this._textMyName.node, officerLevel);
        var layer = G_UserData.getTowerData().getMax_layer();
        this._textMyChapter.string = (Lang.get('challenge_tower_rank_layer_count', { count: layer }));
        var star = G_UserData.getTowerData().getMax_star();
        this._textMyStar.string = (star).toString();
    }
}