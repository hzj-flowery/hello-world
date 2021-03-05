import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { RichTextExtend } from "../../../extends/RichTextExtend";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelBattleDesc extends cc.Component {

    @property({ type: cc.Label, visible: true })
    _playerName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textDesc: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeDesc: cc.Node = null;

    public updateUI(isNormalBattle: boolean, battleData) {
        if (isNormalBattle) {
            this._playerName.string = (battleData.defenseName);
            if (battleData.defenseOffLevel != null) {
                this._playerName.node.color = (Colors.getOfficialColor(battleData.defenseOffLevel));
                UIHelper.enableOutline(this._playerName, Colors.getOfficialColorOutline(battleData.defenseOffLevel));
            }
            this._playerName.node.active = true;
            this._textDesc.node.active = true;
            this._nodeDesc.active = false;
        } else {
            this._playerName.node.active = false;
            this._textDesc.node.active = false;
            this._setRichText(battleData);
        }
    }

    private _setRichText(battleData) {
        this._nodeDesc.active = true;
        var richText = Lang.get('lang_arena_battle_desc', {
            player1: battleData.attackName,
            playerColor1: Colors.colorToNumber(Colors.getOfficialColor(battleData.attackLevel)),
            playerOutColor1: Colors.colorToNumber(Colors.getOfficialColorOutline(battleData.attackLevel)),
            player2: battleData.defenseName,
            playerColor2: Colors.colorToNumber(Colors.getOfficialColor(battleData.defenseLevel)),
            playerOutColor2: Colors.colorToNumber(Colors.getOfficialColorOutline(battleData.defenseLevel))
        });
        if (battleData.isWin == false) {
            richText = Lang.get('lang_arena_battle_desc', {
                player2: battleData.attackName,
                playerColor2: Colors.colorToNumber(Colors.getOfficialColor(battleData.attackLevel)),
                playerOutColor2: Colors.colorToNumber(Colors.getOfficialColorOutline(battleData.attackLevel)),
                player1: battleData.defenseName,
                playerColor1: Colors.colorToNumber(Colors.getOfficialColor(battleData.defenseLevel)),
                playerOutColor1: Colors.colorToNumber(Colors.getOfficialColorOutline(battleData.defenseLevel))
            });
        }
        let widget = RichTextExtend.createWithContent(richText);
        widget.node.x = 0;
        this._nodeDesc.addChild(widget.node);
    }
}