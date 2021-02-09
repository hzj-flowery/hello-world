import ReplayVSNode from "../campRace/ReplayVSNode";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { G_UserData, Colors } from "../../../init";
import { TextHelper } from "../../../utils/TextHelper";
import { SingleRaceConst } from "../../../const/SingleRaceConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleRaceReplayVSNode extends ReplayVSNode {
    _imageCount;
    _callback: any;

    init(callback) {
        this._callback = callback;
        this._init();
        this._imageCount = this.node.getChildByName('ImageCount').getComponent(cc.Sprite);
    }

    updateUI(replay, round, isLast) {
        this._replay = replay;
        if (this._replay) {
            this._refreshHeros();
            this.node.active = (true);
            this._refreshPlayer();
            this._refreshWinPos();
            this._refreshRound(round, isLast);
            this._btnLook.setString(Lang.get('camp_play_report'));
        } else {
            this.node.active = (false);
        }
    }

    _refreshHeros() {
        var [atk, def] = this._replay.getHeroInfoList();
        for (var i in atk) {
            var v = atk[i];
            this._refreshSingleHero(1, Number(i) + 1, v);
        }
        for (i in def) {
            var v = def[i];
            this._refreshSingleHero(2, Number(i) + 1, v);
        }
    }
    _refreshPlayer() {
        var upPlayer = G_UserData.getSingleRace().getUserDataWithId(this._replay.getAtk_user());
        var downPlayer = G_UserData.getSingleRace().getUserDataWithId(this._replay.getDef_user());
        function updatePlayer(node, player, power) {
            var textName = node.getChildByName('ImageNameBG').getChildByName('TextName').getComponent(cc.Label);
            textName.string = (player.getUser_name());
            textName.node.color = (Colors.getOfficialColor(player.getOfficer_level()));
            var textPower = node.getChildByName('ImagePowerBG').getChildByName('TextPower').getComponent(cc.Label);
            var strPower = TextHelper.getAmountText3(power);
            textPower.string = (strPower);
        }
        updatePlayer(this._nodeUp, upPlayer, this._replay.getAtk_power());
        updatePlayer(this._nodeDown, downPlayer, this._replay.getDef_power());
    }

    _refreshWinPos() {
        var nodes = [
            this._nodeUp,
            this._nodeDown
        ];
        var images = {};
        for (var i = 1; i <= 2; i++) {
            var winImage = nodes[i -1].getChildByName('ImageWin');
            winImage.active = (false);
            images[i] = winImage;
        }
        var winSide = this._replay.getWinnerSide();
        if (winSide == SingleRaceConst.REPORT_SIDE_1) {
            images[1].active = (true);
        } else if (winSide == SingleRaceConst.REPORT_SIDE_2) {
            images[2].active = (true);
        }
    }

    _refreshRound(round, isLast) {
        var round2Name = [
            'txt_camp_bt01',
            'txt_camp_bt02',
            'txt_camp_bt02a',
            'txt_camp_bt02b'
        ];
        var imageName = '';
        if (isLast) {
            imageName = 'txt_camp_bt03';
        } else {
            imageName = round2Name[round -1];
        }
        var image = Path.getTextCampRace(imageName);
        UIHelper.loadTexture(this._imageCount, image);
    }

    _onWatchClick() {
        if (this._callback) {
            this._callback(this._replay.getReport_id());
        }
    }
}