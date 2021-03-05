import UIHelper from "../../../utils/UIHelper";
import { G_UserData } from "../../../init";
import { SingleRaceConst } from "../../../const/SingleRaceConst";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleRaceReportNode extends cc.Component {
    _pos: any;
    _callback: any;
    _state: number;
    _imageLine1: any;
    _imageLine2: any;
    _imageLookBg: any;
    _imageLookSign: any;
    _textWinNum1: any;
    _textWinNum2: any;

    ctor(pos, callback) {
        this._pos = pos;
        this._callback = callback;
        this._state = 0;
        this._imageLine1 = this.node.getChildByName('ImageLine1').getComponent(cc.Sprite);
        this._imageLine2 = this.node.getChildByName('ImageLine2').getComponent(cc.Sprite);
        this._imageLookBg = this.node.getChildByName('ImageLookBg').getComponent(cc.Sprite);
        UIHelper.addEventListenerToNode(this.node, this._imageLookBg.node, 'SingleRaceReportNode', '_onClick');
        this._imageLookSign = this.node.getChildByName('ImageLookSign').getComponent(cc.Sprite);
        this._textWinNum1 = this.node.getChildByName('TextWinNum1').getComponent(cc.Label);
        this._textWinNum2 = this.node.getChildByName('TextWinNum2').getComponent(cc.Label);
    }
    updateUI() {
        this._imageLine1.node.active = (false);
        this._imageLine2.node.active = (false);
        var [winNum1, winNum2] = G_UserData.getSingleRace().getWinNumWithPosition(this._pos);
        var state = SingleRaceConst.MATCH_STATE_BEFORE;
        if (G_UserData.getSingleRace().getStatus() == SingleRaceConst.RACE_STATE_FINISH) {
            state = SingleRaceConst.MATCH_STATE_AFTER;
        } else {
            state = G_UserData.getSingleRace().getReportStateWithPosition(this._pos);
        }
        this._state = state;
        var preIndex = G_UserData.getSingleRace().getPreIndexOfPosition(this._pos);
        var userData1 = G_UserData.getSingleRace().getUserDataWithPosition(preIndex[0]);
        var userData2 = G_UserData.getSingleRace().getUserDataWithPosition(preIndex[1]);
        if (state == SingleRaceConst.MATCH_STATE_BEFORE) {
            UIHelper.loadTexture(this._imageLookSign, Path.getCampImg('img_camp_player03c2'));
            UIHelper.setNodeTouchEnabled(this._imageLookBg.node, false);
            this._textWinNum1.string = ('');
            this._textWinNum2.string = ('');
        } else if (state == SingleRaceConst.MATCH_STATE_ING) {
            if (userData1 || userData2) {
                UIHelper.loadTexture(this._imageLookSign, Path.getCampImg('img_camp_player03c1'));
                UIHelper.setNodeTouchEnabled(this._imageLookBg.node, true);
            } else {
                UIHelper.loadTexture(this._imageLookSign, Path.getCampImg('img_camp_player03c3'));
                UIHelper.setNodeTouchEnabled(this._imageLookBg.node, false);
            }
            var num1 = (userData1 && userData2) ? winNum1 : '';
            var num2 = (userData1 && userData2) ? winNum2 : '';
            this._textWinNum1.string = (num1);
            this._textWinNum2.string = (num2);
        } else if (state == SingleRaceConst.MATCH_STATE_AFTER) {
            if (userData1 || userData2) {
                UIHelper.loadTexture(this._imageLookSign, Path.getCampImg('img_camp_player03c'));
                UIHelper.setNodeTouchEnabled(this._imageLookBg.node, true);
            } else {
                UIHelper.loadTexture(this._imageLookSign, Path.getCampImg('img_camp_player03c2'));
                UIHelper.setNodeTouchEnabled(this._imageLookBg.node, false);
            }
            var num1 = (userData1 && userData2) ? winNum1 : '';
            var num2 = (userData1 && userData2) ? winNum2 : '';
            this._textWinNum1.string = (num1);
            this._textWinNum2.string = (num2);
            var tempMatchData = G_UserData.getSingleRace().getMatchDataWithPosition(this._pos);
            if (tempMatchData) {
                var matchData1 = G_UserData.getSingleRace().getMatchDataWithPosition(preIndex[1]);
                var matchData2 = G_UserData.getSingleRace().getMatchDataWithPosition(preIndex[2]);
                var tempUserId = tempMatchData.getUser_id();
                var userId1 = matchData1 && matchData1.getUser_id() || 0;
                var userId2 = matchData2 && matchData2.getUser_id() || 0;
                this._imageLine1.node.active = (userId1 > 0 && tempUserId == userId1);
                this._imageLine2.node.active = (userId2 > 0 && tempUserId == userId2);
            }
        }
    }
    _onClick() {
        if (this._callback) {
            this._callback(this._pos, this._state);
        }
    }
    fontSizeBigger() {
        this._textWinNum1.fontSize = (48);
        this._textWinNum2.fontSize = (48);
    }
    fontSizeSmaller() {
        this._textWinNum1.fontSize = (24);
        this._textWinNum2.fontSize = (24);
    }
}