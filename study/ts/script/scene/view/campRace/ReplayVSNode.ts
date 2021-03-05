import { handler } from "../../../utils/handler";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import { G_UserData, Colors } from "../../../init";
import { TextHelper } from "../../../utils/TextHelper";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ReplayVSNode extends cc.Component {
    _replay: any;
    _round: any;
    _nodeUp: any;
    _nodeDown: any;
    _btnLook: any;
    _txtCampCount: any;
    ctor(replay, round) {
        this._replay = replay;
        this._round = round;
        this._nodeUp = null;
        this._nodeDown = null;
        this._btnLook = null;
        this._init();
        this._refreshUI();
    }
    _init() {
        this._nodeUp = this.node.getChildByName('NodeUp');
        this._nodeDown = this.node.getChildByName('NodeDown');
        this._txtCampCount = this.node.getChildByName('TextCampCount').getComponent(cc.Label);
        this._txtCampCount.node.active = (true);
        this._btnLook = this.node.getChildByName('BtnLook').getComponent(CommonButtonLevel1Highlight);;
        this._btnLook.addClickEventListenerEx(handler(this, this._onWatchClick));
       
    }
    _refreshUI() {
        if (this._replay) {
            this._refreshHeros();
            this.node.active = (true);
            this._refreshPlayer();
            this._refreshWinPos();
            this._refreshRound();
            this._btnLook.setString(Lang.get('camp_play_report'));
        } else {
            this.node.active = (false);
        }
    }
    _refreshHeros() {
        var [left, right] = this._replay.getHeroInfoList();
        for (var i in left) {
            var v = left[i];
            this._refreshSingleHero(1, Number(i) + 1, v);
        }
        for (i in right) {
            var v = right[i];
            this._refreshSingleHero(2, Number(i) + 1, v);
        }
    }
    _refreshPlayer() {
        var upPlayer = G_UserData.getCampRaceData().getUserByPos(this._replay.getCamp(), this._replay.getPos1());
        var downPlayer = G_UserData.getCampRaceData().getUserByPos(this._replay.getCamp(), this._replay.getPos2());
        function updatePlayer(node, player, power) {
            var textName = node.getChildByName('ImageNameBG').getChildByName('TextName').getComponent(cc.Label);
            textName.string = (player.getName());
            textName.node.color = (Colors.getOfficialColor(player.getOfficer_level()));
            var textPower = node.getChildByName('ImagePowerBG').getChildByName('TextPower').getComponent(cc.Label);
            var strPower = TextHelper.getAmountText3(power);
            textPower.string = (strPower);
        }
        updatePlayer(this._nodeUp, upPlayer, this._replay.getLeft_power());
        updatePlayer(this._nodeDown, downPlayer, this._replay.getRight_power());
    }
    _refreshWinPos() {
        var nodes = [
            this._nodeUp,
            this._nodeDown
        ];
        var images = {};
        for (var i = 0; i < 2; i++) {
            var winImage = nodes[i].getChildByName('ImageWin');
            winImage.active = (false);
            images[i] = winImage;
        }
        var winPos = this._replay.getWin_pos();
        if (winPos == this._replay.getPos1()) {
            images[0].active = (true);
        } else if (winPos == this._replay.getPos2()) {
            images[1].active = (true);
        }
    }
    _refreshRound(round?, isLast?) {
        this._txtCampCount.string = (Lang.get('camp_round_name_' + this._round));
    }
    _refreshSingleHero(camp, pos, heroInfo) {
        var node = this._nodeUp;
        if (camp == 2) {
            node = this._nodeDown;
        }
        var heroId = heroInfo.heroId;
        var limitLevel = heroInfo.limitLevel;
        var limitRedLevel = heroInfo.limitRedLevel;

        var heroIcon = node.getChildByName('Hero' + pos).getComponent(CommonHeroIcon);
        if (heroId > 0) {
             heroIcon.updateUI(heroId, null, limitLevel, limitRedLevel);
            heroIcon.showHeroUnknow(false);
        } else {
            heroIcon.showHeroUnknow(true);
        }
    }
    _onWatchClick() {
        G_UserData.getCampRaceData().c2sGetBattleReport(this._replay.getReport_id());
    }
}