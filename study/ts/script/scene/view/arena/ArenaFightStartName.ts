const { ccclass, property } = cc._decorator;

import CommonHeroPower from '../../../ui/component/CommonHeroPower'
import ViewBase from '../../ViewBase';
import { Colors } from '../../../init';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class ArenaFightStartName extends ViewBase {

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _fileNodePower: CommonHeroPower = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _playerName: cc.Label = null;
    onCreate() {
    }

    onEnter() {

    }

    onExit() {

    }

    updateUI(playerName, officialLevel, playerPower) {
        this._playerName.string = playerName;
        this._playerName.node.color = Colors.getOfficialColor(officialLevel);
        UIHelper.enableOutline(this._playerName, Colors.getOfficialColorOutline(officialLevel))
        this._fileNodePower.updateUI(playerPower);
        this._fileNodePower.node.x = -this._fileNodePower.getWidth() * 0.5;
    }

}