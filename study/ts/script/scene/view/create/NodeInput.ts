import { Colors, G_ConfigLoader } from "../../../init";
import { Lang } from "../../../lang/Lang";
import BlackList from "../../../utils/BlackList";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { Util } from "../../../utils/Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NodeInput extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _btnRandom: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _nameText: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelInput: cc.Node = null;
    @property({
        type: cc.EditBox,
        visible: true
    })
    _editBox: cc.EditBox = null;

    private _sex;
    private _defaultName;

    public init(sex, defaultName) {
        this._sex = sex;
        this._defaultName = defaultName;
        this._init();
    }

    private _init() {
        this._editBox.maxLength = 7;
        this._editBox.placeholderLabel.string = Lang.get("lang_input_name_tip");
        if (!this._defaultName) {
            this.onRandomClick();
        } else {
            this._setName(this._defaultName);
        }
        this._nameText.node.active = true;
        this._editBox.node.active = false;
    }

    public onInputStart() {
        this._editBox.node.active = true;
        this._editBox.focus();
    }

    public onInputEnd() {
        this._editBox.node.active = false;
        let name = this._editBox.string;
        if (!name || name == "") {
            this._onPlaceRandomName();
        }
        else {
            this._defaultName = name;
            this._nameText.string = this._defaultName;
        }
    }

    public onRandomClick() {
        var randomName = null;
        var count = 10;
        while (count > 0) {
            randomName = this._getRandomName();
            if (!BlackList.isMatchText(randomName)) {
                break;
            }
            count = count - 1;
        }
        this._setName(randomName);
        this._defaultName = null;
    }

    private _getRandomName() {
        var Name1Place = G_ConfigLoader.getConfig(ConfigNameConst.NAME1_PLACE);
        var Name2Surname = G_ConfigLoader.getConfig(ConfigNameConst.NAME2_SURNAME);
        var Name3Name = G_ConfigLoader.getConfig(ConfigNameConst.NAME3_NAME);
        var index01 = Util.getRandomInt(0, Name1Place.length());
        var index02 = Util.getRandomInt(0, Name2Surname.length());
        var index03 = Util.getRandomInt(0, Name3Name.length());
        var name01 = Name1Place.indexOf(index01);
        var name02 = Name2Surname.indexOf(index02);
        var name03 = Name3Name.indexOf(index03);
        var name = name01.place + name02.surname;
        if (this._sex == 1) {
            name = name + name03.name_boy;
        } else {
            name = name + name03.name_girl;
        }
        return name;
    }

    private _setName(name) {
        this._nameText.string = (name);
        this._editBox.string = (name);
    }

    private _onPlaceRandomName() {
        var randomName = null;
        var count = 10;
        while (count > 0) {
            randomName = this._getRandomName();
            if (!BlackList.isMatchText(randomName)) {
                break;
            }
            count = count - 1;
        }
        this._setName(randomName);
    }

    public getDefaultName() {
        return this._defaultName;
    }
    public getName() {
        return this._nameText.string;
    }
}