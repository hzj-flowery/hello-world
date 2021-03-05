const { ccclass, property } = cc._decorator;

import CommonHeroStar from './CommonHeroStar'

import CommonHeroAvatar from './CommonHeroAvatar'
import { handler } from '../../utils/handler';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import { Lang } from '../../lang/Lang';
import { Colors, G_EffectGfxMgr } from '../../init';
import UIHelper from '../../utils/UIHelper';
import { UserDataHelper } from '../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../utils/data/WayFuncDataHelper';

@ccclass
export default class CommonPetMainAvatar extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _node_root: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_bk: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_effect: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Lock: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_open_level: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Add: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_Info: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInfo: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_38: cc.Sprite = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _commonPetStar: CommonHeroStar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_widget: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_petName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_petLevel: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_RedPoint: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_pet_state: cc.Label = null;
    _funcId: any;
    _petId: any;

    onLoad() {
        this._commonPetStar.node.active = (false);
        this._node_Info.active = (false);
        this._text_petName.node.active = (false);
        this._text_petLevel.node.active = (false);
        this._commonAvatar.init();
        this._commonAvatar.setCallBack(handler(this, this.onClickCallBack));
        this._commonAvatar.setTouchEnabled(true);
        this._commonAvatar.setConvertType(TypeConvertHelper.TYPE_PET);
        this._commonAvatar.setScale(0.9);
        this._commonAvatar.setShadowScale(2.7);
        this._image_RedPoint.node.active = (false);
        this._imageArrow.node.active = (false);
        UIHelper.enableOutline(this._text_open_level,  Colors.toColor3B(0x8E3103), 2);
        UIHelper.enableOutline(this._text_petLevel, cc.color(0,0,0), 2);
        this.setLock(true);
    }
    onTeam(needShow) {
        if (needShow) {
            this._text_pet_state.string = (Lang.get('pet_on_team'));
            this._text_pet_state.node.color = (Colors.DARK_BG_THREE);
        } else {
            this._text_pet_state.string = (Lang.get('pet_on_bless'));
            this._text_pet_state.node.color = (Colors.NUMBER_GREEN);
        }
    }
    setPetIndex(index) {
        this._text_pet_state.string = (Lang.get('pet_on_bless_num', { num: index }));
        this._text_pet_state.node.color = (Colors.NUMBER_GREEN);
    }
    _isLock() {
        var isLock = this._image_Lock.node.active;
        return isLock;
    }
    _isAdd() {
        var isAdd = this._image_Add.node.active;
        return isAdd;
    }
    getFuncId() {
        return this._funcId;
    }
    updateImageBk(path) {
        this._image_bk.node.active = (true);
        UIHelper.loadTexture(this._image_bk, path);
    }
    setFuncId(funcTeamSoltId) {
        this._funcId = funcTeamSoltId;
        this.setLock(true);
        this.showOpenLevel(false);
    }
    showOpenLevel(needShow) {
        var openLevel = Lang.get('team_txt_unlock_position', { level: UserDataHelper.getOpenLevelWithId(this._funcId) });
        this._text_open_level.string = (openLevel);
        this._text_open_level.node.active = (needShow);
    }
    setLock(needLock) {
        needLock = needLock || false;
        this._commonAvatar.showShadow(!needLock);
        this._text_petName.node.active = (false);
        this._image_Lock.node.active = (false);
        this._image_Add.node.active = (false);
        if (needLock) {
            this._image_Lock.node.active = (true);
            this._commonAvatar.setSpineVisible(false);
            this._node_Info.active = (false);
        } else {
            this._image_Add.node.active = (true);
            this.showOpenLevel(false);
        }
    }
    setAdd(showAdd) {
        showAdd = showAdd || false;
        this._commonAvatar.showShadow(!showAdd);
        this._image_Add.node.active = (showAdd);
    }
    onClickCallBack() {
        if (this._isLock() || this._funcId == null) {
            return;
        }
        if (this._isAdd() == false && this._petId == null) {
            return;
        }
        WayFuncDataHelper.gotoModuleByFuncId(this._funcId);
    }
    updateUI(petId) {
        this._commonAvatar.updateUI(petId);
        var height = this._commonAvatar.getHeight();
        this._petId = petId;
        this._image_Lock.node.active = (false);
        this._image_Add.node.active = (false);
        this._commonAvatar.showShadow(true);
        this._commonAvatar.setSpineVisible(true);
        this._commonAvatar.playAnimationLoopIdle();
    }
    updatePetName(petId, petStar, petLevel) {
        var petParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, petId);
        if (petParams) {
            this._text_petName.string = (petParams.name);
            this._text_petName['_updateRenderData'](true);
            this._text_petName.node.active = (true);
            this._text_petName.node.color = (petParams.icon_color);
            UIHelper.enableOutline(this._text_petName, petParams.icon_color_outline, 2);
            this._node_Info.active = (true);
        }
        if (petLevel && petLevel > 0) {
            this._text_petLevel.string = (Lang.get('pet_txt_level', { level: petLevel }));
            this._text_petLevel['_updateRenderData'](true);
            this._text_petLevel.node.active = (true);

            var width = this._text_petLevel.node.getContentSize().width + this._text_petName.node.getContentSize().width + 5;
            this._panel_widget.setContentSize(cc.size(width, this._text_petLevel.node.getContentSize().height));
            this._text_petLevel.node.x = -this._panel_widget.width / 2;
            this._text_petName.node.x =  this._text_petLevel.node.x + (this._text_petLevel.node.getContentSize().width + 5);
        }
        this._commonPetStar.node.active = (true);
        this._commonPetStar.setCount(petStar);
    }
    setString(s) {
        this._text_petName.string = (s);
    }
    showRedPoint(visible) {
        this._image_RedPoint.node.active = (visible);
    }
    showImageArrow(visible) {
        this._imageArrow.node.active = (visible);
    }
    updateScale(scale) {
        scale = 1 / scale;
        this._node_Info.setScale(scale);
    }
    setImageScale(scale) {
        this._image_bk.node.setScale(scale);
    }
    setAvatarScale(scale) {
        this._commonAvatar.setScale(scale);
    }
    playEffect(effectName) {
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var gfxEffect = G_EffectGfxMgr.createPlayGfx(this._node_effect, effectName, eventFunction);
    }
    setShadowScale(scale) {
        this._commonAvatar.setShadowScale(scale);
    }
}