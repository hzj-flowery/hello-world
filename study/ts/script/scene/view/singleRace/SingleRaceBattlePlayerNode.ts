import CommonHeroPower from "../../../ui/component/CommonHeroPower";
import { G_UserData, Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleRaceBattlePlayerNode extends cc.Component {
    onLoad() {
        for (var i = 1; i <= 2; i++) {
            var bg = this.node.getChildByName('ImageBg' + i);
            this['_imageFirst' + i] = bg.getChildByName('ImageFirst' + i).getComponent(cc.Sprite);
            this['_nodePower' + i] = bg.getChildByName('NodePower' + i).getComponent(CommonHeroPower);
            this['_textServerName' + i] = bg.getChildByName('TextServerName' + i).getComponent(cc.Label);
            this['_textPlayerName' + i] = bg.getChildByName('TextPlayerName' + i).getComponent(cc.Label);
            this['_textCount' + i] = bg.getChildByName('TextCount' + i).getComponent(cc.Label);
            this['_textTip' + i] = bg.getChildByName('TextTip' + i).getComponent(cc.Label);
        }
    }
    updateUI(curWatchPos) {
        var firstHand = G_UserData.getSingleRace().getFirstHandIndex(curWatchPos);
        var [winNum1, winNum2] = G_UserData.getSingleRace().getWinNumWithPosition(curWatchPos);
        var winNums = [
            winNum1,
            winNum2
        ];
        var preIndex = G_UserData.getSingleRace().getPreIndexOfPosition(curWatchPos);
        for (var i = 1; i <= 2; i++) {
            var pos = preIndex[i -1];
            var userData = G_UserData.getSingleRace().getUserDataWithPosition(pos);
            if (userData) {
                this['_imageFirst' + i].node.active = (firstHand == pos);
                this['_nodePower' + i].updateUI(userData.getPower());
                var serverName = userData.getServer_name();
                this['_textServerName' + i].string = (serverName);
                this['_textPlayerName' + i].string = (userData.getUser_name());
                this['_textPlayerName' + i].node.color = (Colors.getOfficialColor(userData.getOfficer_level()));
                this['_textCount' + i].string = (Lang.get('camp_play_off_win_count', { count: winNums[i-1] }));
                this['_textCount' + i].node.active = (true);
                this['_textTip' + i].node.active = (false);
                this['_nodePower' + i].node.active = (true);
            } else {
                this['_imageFirst' + i].node.active = (false);
                this['_textServerName' + i].string = ('');
                this['_textPlayerName' + i].string = ('');
                this['_textPlayerName' + i].node.color = (Colors.getCampGray());
                this['_textCount' + i].node.active = (false);
                this['_textTip' + i].node.active = (true);
                this['_nodePower' + i].node.active = (false);
            }
        }
    }
}