const { ccclass, property } = cc._decorator;

import CommonEmptyTipNode from '../../../ui/component/CommonEmptyTipNode'

import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import PetConst from '../../../const/PetConst';
import { Lang } from '../../../lang/Lang';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import CommonAttrNode from '../../../ui/component/CommonAttrNode';
import { PetDataHelper } from '../../../utils/data/PetDataHelper';

@ccclass
export default class PopupPetAttrAdd extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _commonBK: CommonNormalMiniPop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDesc: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDesc: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    Node_5: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    Node_10: cc.Node = null;

    @property({
        type: CommonEmptyTipNode,
        visible: true
    })
    _fileNodeEmpty: CommonEmptyTipNode = null;
    _petDlgType: number;

    init(petDlgType) {
        this._petDlgType = petDlgType;
    }
    onCreate() {
        this._commonBK.addCloseEventListener(handler(this, this.onClickClose));
        this._commonBK.hideBtnBg();
        this._fileNodeEmpty.setButtonGetVisible(false);
        this.updateUI();
        this._textDesc.fontSize -= 2;
    }
    updateUI() {
        this.Node_5.active = (false);
        this.Node_10.active = (false);
        var attrList = [];
        if (this._petDlgType == PetConst.PET_DLG_HELP_ADD) {
            this._commonBK.setTitle(Lang.get('pet_help_add'));
            this._textDesc.string = (Lang.get('pet_popup_help_add'));
            this._fileNodeEmpty.setTipsString(Lang.get('pet_have_no_1'));
            var [attrMap, tempList] = PetDataHelper.getPetHelpAttr();
            attrList = tempList;
        } else {
            this._commonBK.setTitle(Lang.get('pet_map_add'));
            this._textDesc.string = (Lang.get('pet_popup_map_add'));
            this._fileNodeEmpty.setTipsString(Lang.get('pet_have_no_2'));
            [attrMap, tempList] = UserDataHelper.getPetMapAttr();
            attrList = tempList;
        }
        var attrMaxSize = 10;
        var loopNode = this.Node_10;
        loopNode.active = (true);
        for (var i = 1; i <= attrMaxSize; i++) {
            var attrFileNode = loopNode.getChildByName('Node_Attr' + i).getComponent(CommonAttrNode);
            attrFileNode.node.active = (false);
        }
        if (attrList.length == 0) {
            this._fileNodeEmpty.node.active = (true);
            this._fileNodeEmpty.setButtonGetVisible(false);
            this._imageDesc.node.active = (false);
        } else {
            this._fileNodeEmpty.node.active = (false);
            this._imageDesc.node.active = (true);
        }
        for (var j in attrList) {
            var attr = attrList[j];
            var attrFileNode = loopNode.getChildByName('Node_Attr' + (parseFloat(j) + 1)).getComponent(CommonAttrNode);
            attrFileNode.node.active = (true);
            attrFileNode.updateValue(attr.type, attr.value);
        }
    }
    onClickClose() {
        this.close();
    }
    onEnter() {
    }
    onExit() {
    }
}