const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonAttrNode from '../../../ui/component/CommonAttrNode'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_UserData, Colors } from '../../../init';
import { table } from '../../../utils/table';
import PetAvatarNode from './PetAvatarNode';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonPetVName from '../../../ui/component/CommonPetVName';
import PopupPetDetail from '../pet/PopupPetDetail';

@ccclass
export default class PetHandBookCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNoShow: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _petCellName: cc.Label = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr4: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr5: CommonAttrNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageZheZhao: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageActive: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonBtn: CommonButtonLevel1Highlight = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    petAvatarNode: cc.Prefab = null;

    _cellValue: any;

    onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size);
        this._commonBtn.setString(Lang.get('avatar_btn_active'));
        this._commonBtn.addClickEventListenerEx(handler(this, this.onButtonClick));
    }
    onButtonClick(sender) {
        G_UserData.getPet().c2sActivePetPhoto(this.getPetMapId());
    }
    onEnter() {
    }
    onExit() {
    }
    getPetMapId() {
        return this._cellValue.id;
    }
    _updatePetAvatar() {
        var petIdList = this._getPetList();
        var rootNode = this._getRootNode(petIdList);
        function updateAvatarState(node, petBaseId) {
            if (node) {
                var avatar = node.getChildByName('Node_avatar').getChildByName('avatar').getComponent(PetAvatarNode);
                var petName = node.getChildByName('Pet_VName');
                petName.active = (true);
                if (avatar) {
                    if (G_UserData.getPet().isPetHave(petBaseId)) {
                        avatar.highLightNode();
                    } else {
                        avatar.darkNode();
                    }
                }
            }
        }
        for (var i in petIdList) {
            var value = petIdList[i];
            var node = rootNode.getChildByName('Node_pet' + (parseFloat(i) + 1));
            updateAvatarState(node, value);
        }
    }
    _getPetList() {
        var petIdList = [];
        for (var i = 1; i <= 3; i++) {
            var petId = this._cellValue['pet' + i];
            if (petId > 0) {
                petIdList.push(petId);
            }
        }
        return petIdList;
    }
    _getRootNode(petIdList) {
        var rootNode = this._resourceNode.getChildByName('Node_pet_three');
        if (petIdList.length == 3) {
            rootNode = this._resourceNode.getChildByName('Node_pet_three');
            this._resourceNode.setContentSize(cc.size(459, 550));
            this.node.setContentSize(cc.size(459, 550));
        }
        if (petIdList.length == 2) {
            rootNode = this._resourceNode.getChildByName('Node_pet_two');
            this._resourceNode.setContentSize(cc.size(404, 550));
            this.node.setContentSize(cc.size(404, 550));
        }
        if (petIdList.length == 1) {
            rootNode = this._resourceNode.getChildByName('Node_pet_one');
            this._resourceNode.setContentSize(cc.size(404, 550));
            this.node.setContentSize(cc.size(404, 550));
        }
        rootNode.active = (true);
        return rootNode;
    }
    updateUI(petMapData) {
        this._cellValue = petMapData;
        var petIdList = this._getPetList();
        var rootNode = this._getRootNode(petIdList);
        this._commonBtn.node.active = (true);
        for (var i in petIdList) {
            let value = petIdList[i];
            var node = rootNode.getChildByName('Node_pet' + (parseFloat(i) + 1));
            var nodeAvatar = node.getChildByName('Node_avatar');
            var petName = node.getChildByName('Pet_VName').getComponent(CommonPetVName);
            nodeAvatar.removeAllChildren();
            var avatar = cc.instantiate(this.petAvatarNode).getComponent(PetAvatarNode);
            avatar.init();
            petName.updateUI(value);
            if (G_UserData.getPet().isPetMapShow(this._cellValue.id) == false) {
                avatar.doNoShow();
                petName.setVisible(false);
            } else {
                avatar.updateUI(value);
                avatar.setCallBack(handler(this, this.onIconCallBack));
                petName.setVisible(true);
            }
            avatar.node.name = ('avatar');
            avatar.setUserData(value);
            nodeAvatar.addChild(avatar.node);
        }
        this._updateAttr();
        this.procPetMapState();
    }
    onIconCallBack(value) {
        var itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, value);
        var itemCfg = itemParams.cfg;
        PopupPetDetail.loadCommonPrefab('PopupPetDetail', (popup: PopupPetDetail) => {
            popup.ctor(TypeConvertHelper.TYPE_PET, itemCfg.id, true);
            popup.openWithAction();
            var petList = G_UserData.getHandBook().getPetList();
            popup.setPageData(petList);
        });
    }
    procPetMapState() {
        var state = G_UserData.getPet().getPetMapState(this.getPetMapId());
        var petIdList = this._getPetList();
        var rootNode = this._getRootNode(petIdList);
        let procNoShowState = function (state) {
            if (state != -1) {
                return;
            }
            this._petCellName.string = (' ');
            this._imageZheZhao.node.active = (true);
            this._commonBtn.node.active = (false);
            this._textNoShow.node.active = (true);
            for (var i = 1; i <= 5; i++) {
                this['_nodeAttr' + i].node.active = (false);
            }
            for (var j in petIdList) {
                var value = petIdList[j];
                var node = rootNode.getChildByName('Node_pet' + (parseFloat(j) + 1));
                var avatar = node.getChildByName('Node_avatar').getChildByName('avatar').getComponent(PetAvatarNode);
                var petName = node.getChildByName('Pet_VName');
                avatar.doNoShow();
                petName.active = (false);
            }
        }.bind(this);
        procNoShowState(state);
        let procActivedState = function (state) {
            if (state != 2) {
                return;
            }
            this._imageZheZhao.node.active = (false);
            this._commonBtn.node.active = (false);
            this._imageActive.node.active = (true);
            var attrList = this.getAttrList();
            for (var i in attrList) {
                var value = attrList[i];
                this['_nodeAttr' + (parseFloat(i) + 1)].setNameColor(Colors.BRIGHT_BG_GREEN);
                this['_nodeAttr' + (parseFloat(i) + 1)].setValueColor(Colors.BRIGHT_BG_GREEN);
            }
            this._updatePetAvatar();
        }.bind(this);

        procActivedState(state);
        let procNoActiveState = function (state) {
            if (state != 0) {
                return;
            }
            this._imageZheZhao.node.active = (true);
            this._commonBtn.node.active = (false);
            this._imageActive.node.active = (false);
            var attrList = this.getAttrList();
            for (var i in attrList) {
                var value = attrList[i];
                this['_nodeAttr' + (parseFloat(i) + 1)].setNameColor(Colors.BRIGHT_BG_TWO);
                this['_nodeAttr' + (parseFloat(i) + 1)].setValueColor(Colors.BRIGHT_BG_TWO);
            }
            this._updatePetAvatar();
        }.bind(this);
        procNoActiveState(state);
        let procCanActiveState = function (state) {
            if (state != 1) {
                return;
            }
            this._imageZheZhao.node.active = (false);
            this._commonBtn.node.active = (true);
            this._imageActive.node.active = (false);
            var attrList = this.getAttrList();
            for (var i in attrList) {
                var value = attrList[i];
                this['_nodeAttr' + (parseFloat(i) + 1)].setNameColor(Colors.BRIGHT_BG_TWO);
                this['_nodeAttr' + (parseFloat(i) + 1)].setValueColor(Colors.BRIGHT_BG_TWO);
            }
            this._updatePetAvatar();
        }.bind(this);
        procCanActiveState(state);
    }
    getAttrList() {
        var attrList = [];
        for (var i = 1; i <= 5; i++) {
            var attrType = this._cellValue['attribute_type_' + i];
            if (attrType > 0) {
                var attrValue = this._cellValue['attribute_value_' + i];
                attrList.push({
                    attrType: attrType,
                    attrValue: attrValue
                });
            }
        }
        return attrList;
    }
    _updateAttr() {
        this._petCellName.string = (this._cellValue.name);
        var attrList = this.getAttrList();
        for (var i = 1; i <= 5; i++) {
            this['_nodeAttr' + i].node.active = (false);
        }
        for (var j in attrList) {
            var value = attrList[j];
            var attrType = value.attrType;
            var attrValue = value.attrValue;
            this['_nodeAttr' + (parseFloat(j) + 1)].setVisible(true);
            this['_nodeAttr' + (parseFloat(j) + 1)].updateValue(attrType, attrValue);
        }
    }
}