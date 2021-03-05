import CampRaceLookNode from "./CampRaceLookNode";
import CampRaceVSNode from "./CampRaceVSNode";
import CampRaceCountryNode from "./CampRaceCountryNode";
import { G_UserData, G_Prompt, G_SignalManager, Colors, G_SceneManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { SignalConst } from "../../../const/SignalConst";
import { Path } from "../../../utils/Path";
import { handler } from "../../../utils/handler";
import { CampRaceHelper } from "./CampRaceHelper";
import { CampRaceConst } from "../../../const/CampRaceConst";
import PopupReplays from "./PopupReplays";
import UIHelper from "../../../utils/UIHelper";
import PopupBase from "../../../ui/PopupBase";

const { ccclass, property } = cc._decorator;


@ccclass
export default class PopupCampMap extends PopupBase {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCamp: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos1: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos2: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos3: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos4: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos5: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos6: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos7: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos8: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos9: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos10: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos11: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLinePos12: cc.Sprite = null;
    @property({
        type: CampRaceLookNode,
        visible: true
    })
    _nodeLook12: CampRaceLookNode = null;
    @property({
        type: CampRaceLookNode,
        visible: true
    })
    _nodeLook34: CampRaceLookNode = null;
    @property({
        type: CampRaceLookNode,
        visible: true
    })
    _nodeLook56: CampRaceLookNode = null;
    @property({
        type: CampRaceLookNode,
        visible: true
    })
    _nodeLook78: CampRaceLookNode = null;
    @property({
        type: CampRaceLookNode,
        visible: true
    })
    _nodeLook910: CampRaceLookNode = null;
    @property({
        type: CampRaceLookNode,
        visible: true
    })
    _nodeLook1112: CampRaceLookNode = null;
    @property({
        type: CampRaceLookNode,
        visible: true
    })
    _nodeLook1314: CampRaceLookNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer1: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer2: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer3: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer4: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer5: CampRaceVSNode = null;

    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer6: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer7: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer8: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer9: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer10: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer11: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer12: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer13: CampRaceVSNode = null;
    @property({
        type: CampRaceVSNode,
        visible: true
    })
    _nodePlayer14: CampRaceVSNode = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore2: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore3: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore4: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore5: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore6: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore7: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore8: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore9: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore10: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore11: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore12: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore13: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore14: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textState: cc.Label = null;
    @property({
        type: CampRaceCountryNode,
        visible: true
    })
    _nodeCamp1: CampRaceCountryNode = null;
    @property({
        type: CampRaceCountryNode,
        visible: true
    })
    _nodeCamp2: CampRaceCountryNode = null;
    @property({
        type: CampRaceCountryNode,
        visible: true
    })
    _nodeCamp3: CampRaceCountryNode = null;
    @property({
        type: CampRaceCountryNode,
        visible: true
    })
    _nodeCamp4: CampRaceCountryNode = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    _isMultipleCamp: any;
    _signalGetLastRank: any;
    _signalUpdateState: any;
    static static_camp: number;

    _camp: number;

    public static waitEnterMsg(callBack, params) {
        var camp = params[0];
        var campIndex = 1;
        function onMsgCallBack(id, camp) {
            var count = G_UserData.getCampRaceData().getUserIdsCount(camp);
            if (count == 0) {
                if (campIndex >= 1 && campIndex <= 4) {
                    G_SignalManager.addOnce(SignalConst.EVENT_GET_LAST_RANK, onMsgCallBack);
                    G_UserData.getCampRaceData().c2sGetCampRaceLastRank(campIndex);
                    campIndex = campIndex + 1;
                    if (campIndex > 4) {
                        G_Prompt.showTip(Lang.get('camp_race_map_no_content'));
                        G_SceneManager.clearWaitEnterSignal();
                    }
                }
            } else {
                PopupCampMap.static_camp = camp;
                callBack();
            }
        }
        G_SignalManager.addOnce(SignalConst.EVENT_GET_LAST_RANK, onMsgCallBack);
        G_UserData.getCampRaceData().c2sGetCampRaceLastRank(camp);
    }
    ctor(isMultipleCamp) {
        this._isMultipleCamp = isMultipleCamp || false;
    }
    onCreate() {
        var param = G_SceneManager.getViewArgs('PopupCampMap');
        this.ctor(param[1]);
        this._initData();
        this._initView();
    }
    _initData() {
        this._camp = PopupCampMap.static_camp;
    }
    _initView() {
        for (var i = 1; i <= 14; i++) {
            this['_player' + i] = this['_nodePlayer' + i];
            this['_player' + i].ctor(i);
        }
        for (var i = 1; i <= 7; i++) {
            var pos1 = i * 2 - 1;
            var pos2 = i * 2;
            this['_nodeLook' + pos1 + pos2].ctor(pos1, pos2, handler(this, this._onLookClick));
            this['_look' + pos1 + pos2] = this['_nodeLook' + pos1 + pos2];
        }
        for (var i = 1; i <= 4; i++) {
            this['_nodeCamp' + i].ctor(i, handler(this, this._onCampClick));
            this['_country' + i] = this['_nodeCamp' + i];
            this['_nodeCamp' + i].node.active = (this._isMultipleCamp);
        }
    }
    onEnter() {
        this._signalGetLastRank = G_SignalManager.add(SignalConst.EVENT_GET_LAST_RANK, handler(this, this._onEventGetLastRank));
        this._signalUpdateState = G_SignalManager.add(SignalConst.EVENT_CAMP_UPDATE_STATE, handler(this, this._onEventUpdateState));
        this._updateView();
    }
    onExit() {
        this._signalGetLastRank.remove();
        this._signalGetLastRank = null;
        this._signalUpdateState.remove();
        this._signalUpdateState = null;
    }
    _updateView() {
        this._updateCamp();
        this._updatePlayers();
        this._updateLook();
        this._updateState();
        this._updateCountry();
    }
    _updateCamp() {
        var res = Path.getCampImg('img_camp_com' + this._camp);
        UIHelper.loadTexture(this._imageCamp, res);
    }
    _updatePlayers() {
        for (var i = 1; i <= 14; i++) {
            var state = CampRaceHelper.getMacthStateWithPos(this._camp, i);
            if (state == CampRaceConst.MATCH_STATE_BEFORE) {
                this['_player' + i].updateUI(null);
                this['_textScore' + i].node.active = (false);
                if (this['_imageLinePos' + i]) {
                    this['_imageLinePos' + i].node.active = (false);
                }
            } else if (state == CampRaceConst.MATCH_STATE_ING) {
                var userData = G_UserData.getCampRaceData().getUserByPos(this._camp, i);
                var score = CampRaceHelper.getMatchScore(this._camp, i);
                this['_player' + i].updateUI(userData, true);
                this['_textScore' + i].string = (score);
                this['_textScore' + i].node.color = (Colors.getCampWhite());
                this['_textScore' + i].node.active = (true);
                if (this['_imageLinePos' + i]) {
                    this['_imageLinePos' + i].node.active = (false);
                }
            } else if (state == CampRaceConst.MATCH_STATE_AFTER) {
                var userData = G_UserData.getCampRaceData().getUserByPos(this._camp, i);
                var score = CampRaceHelper.getMatchScore(this._camp, i);
                var isWin = score >= 2;
                this['_player' + i].updateUI(userData, isWin);
                this['_textScore' + i].string = (score);
                this['_textScore' + i].node.color = (Colors.getCampScoreGray());
                this['_textScore' + i].node.active = (true);
                if (this['_imageLinePos' + i]) {
                    this['_imageLinePos' + i].node.active = (isWin);
                }
            }
        }
    }
    _updateLook() {
        for (var i = 1; i <= 7; i++) {
            var pos1 = i * 2 - 1;
            var pos2 = i * 2;
            var state = CampRaceHelper.getMacthStateWithPos(this._camp, pos1);
            this['_look' + pos1 + pos2].updateUI(state);
        }
    }
    _updateState() {
        var round = G_UserData.getCampRaceData().getFinalStatusByCamp(this._camp);
        this._textState.string = (Lang.get('camp_race_map_match_round_' + round));
    }
    _onCampClick(camp) {
        if (this._isMultipleCamp) {
            G_UserData.getCampRaceData().c2sGetCampRaceLastRank(camp);
        }
    }
    _updateCountry() {
        if (!this._isMultipleCamp) {
            return;
        }
        for (var i = 1; i <= 4; i++) {
            this['_country' + i].setSelected(i == this._camp);
        }
    }
    _onLookClick(pos1, pos2, state) {
        if (G_UserData.getCampRaceData().isMatching()) {
            G_Prompt.showTip(Lang.get('camp_race_map_can_not_look_tip'));
            return;
        }
        if (state == CampRaceConst.MATCH_STATE_ING) {
            var userData = G_UserData.getCampRaceData().getUserByPos(this._camp, pos1);
            var userId = userData.getId();
            G_UserData.getCampRaceData().setCurWatchUserId(userId);
            G_UserData.getCampRaceData().c2sGetCampRaceFormation(this._camp, userId);
            this.close();
        } else if (state == CampRaceConst.MATCH_STATE_AFTER) {
            var reports = G_UserData.getCampRaceData().getReportGroupByPos(this._camp, pos1, pos2);
            var sortReports = CampRaceHelper.sortReportGroup(reports);
            PopupReplays.getIns(PopupReplays, (p) => {
                p.ctor(sortReports);
                p.openWithAction();
            })
        }
    }
    onCloseClick() {
        this.close();
    }
    _onEventGetLastRank(eventName, camp) {
        this._camp = camp;
        this._updateCountry();
        this._updateView();
    }
    _onEventUpdateState(eventName, camp) {
        if (this._camp == camp) {
            this._updateView();
        }
    }
}