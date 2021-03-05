import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader, G_EffectGfxMgr } from "../../../init";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import CommonHeroStar from "../../../ui/component/CommonHeroStar";
import CommonUI from "../../../ui/component/CommonUI";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import ViewBase from "../../ViewBase";


const { ccclass, property } = cc._decorator;

@ccclass
export class RedPetAvatarNode extends ViewBase {
    name: 'RedPetAvatarNode';
    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonHeroAvatar: CommonHeroAvatar = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _nameBg: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _avatarName: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _starRoot: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _refreshEffectNode: cc.Node = null;
    @property({
        type: CommonHeroStar,
        visible: true
    })
    _commonStar: CommonHeroStar = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nameEffectNode: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _emojiNode: cc.Node = null;

    private _petId: number;
    onCreate() {
        this._petId = 0;
        this._commonHeroAvatar.init();
    }
    onEnter() {
    }
    onExit() {
    }
    setPetName(name) {
        this._avatarName.string = (name);
    }
    setPetQuality(quality) {
    }
    updatePetAvatar(avatarData) {
        this._commonHeroAvatar.init();
        this._commonHeroAvatar.setConvertType(TypeConvertHelper.TYPE_PET);
        this._commonHeroAvatar.updateUI(avatarData.id, '_small');
        this._commonHeroAvatar.setScale(1.2);
        this._commonHeroAvatar.turnBack();
        this._petId = avatarData.id;
        var PetConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET);
        var petConfigInfo = PetConfig.get(this._petId);
        this.setPetName(petConfigInfo.name);
        var initial_star = petConfigInfo.initial_star;
        if (initial_star > 0) {
            this._starRoot.active = (true);
            this._commonStar.setCountAdv(initial_star);
            this.playRedPetNameEffect();
        } else {
            this._starRoot.active = (false);
        }
        this._nameBg.node.addComponent(CommonUI).loadTexture(initial_star > 0 && Path.getRedPetImage('img_pet_pinzhi01') || Path.getRedPetImage('img_pet_pinzhi02'));
        // this._nameBg.ignoreContentAdaptWithSize(true);
    }
    playRefreshEffect() {
        var PetConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET);
        var petConfigInfo = PetConfig.get(this._petId);
        var initial_star = petConfigInfo.initial_star;
        if (initial_star > 0) {
            return;
        }
        this._refreshEffectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._refreshEffectNode, 'moving_qiling_shuaxin', null, null, true);
    }
    playRedPetNameEffect() {
        var effectName = 'effect_qiling_baixiwenzi';
        this._nameEffectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._nameEffectNode, effectName, null);
    }
    removeEmoji() {
        this._emojiNode.removeAllChildren();
    }
    playEmojiEffect(petIds, fragmentIds, intersectPanelId) {
        var isSelf = false;
        petIds = petIds || {};
        for (let k in petIds) {
            var v = petIds[k];
            if (this._petId == v) {
                isSelf = true;
                break;
            }
        }
        this._emojiNode.removeAllChildren();
        if (isSelf) {
            G_EffectGfxMgr.createPlayGfx(this._emojiNode, 'effect_xunma_aixin', null);
            return;
        }
        fragmentIds = fragmentIds || {};

        var FragmentConfig = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT);
        for (let k in fragmentIds) {
            var v = fragmentIds[k];

            var fragmentConfigInfo = FragmentConfig.get(v.value);
            var petId = fragmentConfigInfo.comp_value;
            if (this._petId == petId) {
                isSelf = true;
                break;
            }
        }
        if (isSelf) {
            G_EffectGfxMgr.createPlayGfx(this._emojiNode, 'effect_xunma_chenmo', null);
            return;
        }
        if (fragmentIds.length == 0 && petIds.length == 0 && intersectPanelId == true) {
            G_EffectGfxMgr.createPlayGfx(this._emojiNode, 'effect_xunma_shengqi', null);
        }
    }
};