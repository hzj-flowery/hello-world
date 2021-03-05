import { UTF8 } from "../../utils/UTF8";
import { Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";
import CommonUI from "./CommonUI";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonGuildFlag extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFlag: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName1: cc.Label = null;


    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName2: cc.Label = null;


    private _textGuildNames: Array<cc.Label> = [];
    setTextGuidName(data: Array<cc.Label>): void {
        for (var i = 1; i <= 2; i++) {
            this._textGuildNames[i - 1] = data[i - 1];
        }
    }
    updateUI(index, name) {
        if (this._textGuildName) {
            this._textGuildName.string = (UTF8.utf8sub(name, 1, 2));
            this._textGuildName.node.color = (Colors.getGuildFlagColor(index));
            UIHelper.enableOutline(this._textGuildName, Colors.getGuildFlagColorOutline(index))
        } 
        else if(this._textGuildNames.length>=2)
        {
            for (var i = 1; i <= 2; i++) {
                this._textGuildNames[i - 1].string = (UTF8.utf8sub(name, i, i));
                this._textGuildNames[i - 1].node.color = (Colors.getGuildFlagColor(index));
                UIHelper.enableOutline(this._textGuildNames[i - 1], Colors.getGuildFlagColorOutline(index))
            }
        }
        else if(this._textGuildName1&&this._textGuildName2)
        {
            for (var i = 1; i <= 2; i++) {
                var guildName = "_textGuildName"+i; 
                this[guildName].string = (UTF8.utf8sub(name, i, i));
                this[guildName].node.color = (Colors.getGuildFlagColor(index));
                UIHelper.enableOutline(this[guildName], Colors.getGuildFlagColorOutline(index))
            }
        }
        this._imageFlag.addComponent(CommonUI).loadTexture(this.getImagePath(index));
    }
    getImagePath(index) {
        return Path.getGuildFlagImage(index);
    }

}