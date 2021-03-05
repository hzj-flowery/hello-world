const { ccclass, property } = cc._decorator;

import CommonContinueNode from '../../../ui/component/CommonContinueNode'
import { G_ConfigLoader, G_EffectGfxMgr, G_SceneManager } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import ViewBase from '../../ViewBase';
import PetShow from './PetShow';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { SceneIdConst } from '../../../const/SceneIdConst';

@ccclass
export default class PetMerge extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _showNode: cc.Node = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _nodeContinue: CommonContinueNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGetBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGetDetail: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageBG: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _avatarPrefab: cc.Prefab = null;

    _count: any;
    _isAnimFinish: boolean;
    _petData: any;

    ctor(petId, count) {
        this._count = count || 1;
        this._isAnimFinish = false;
        this._petData = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(petId);
    }
    onCreate() {
        this.setSceneSize();
        this.updateSceneId(SceneIdConst.SCENE_ID_DRAW_CARD);
        var params = G_SceneManager.getViewArgs('petMerge');
        this.ctor(params[0], params[1]);
        this._nodeContinue.node.active = (false);
        this._imageGetBG.node.active = (false);
        this._textGetDetail.node.active = (false);
    }
    onEnter() {
        this._playHeroOpen();
    }
    onExit() {
    }
    _playHeroOpen() {
        this._imageGetBG.node.active = (true);
        if (this._petData.color >= 4) {
            PetShow.getIns(PetShow, (p: PetShow) => {
                p.ctor(this._petData.id, function () {
                    this._playAvatarOpen();
                }.bind(this));
                p.open();
            })
        } else {
            this._playAvatarOpen();
        }
    }
    _playAvatarOpen() {
        let effectFunction = function (effect) {
            if (effect == 'card_lv') {
                var card = this._createCard(this._petData.color);
                return card;
            } else if (effect == 'hero_come') {
                var avatar = (cc.instantiate(this._avatarPrefab) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                avatar.init();
                avatar.setConvertType(TypeConvertHelper.TYPE_PET);
                avatar.updateUI(this._petData.id);
                avatar.showName(true);
                avatar.updateNameHeight(avatar.getHeight());
                avatar.scheduleOnce(function () {
                    avatar._playAnim("idle", true);
                }, 2)
                return avatar.node;
            } else {
                return new cc.Node();
            }
        }.bind(this);

        let eventFunction = function (event) {
            if (event == 'finish') {
                this._isAnimFinish = true;
                this._textGetDetail.node.active = (true);
                this._textGetDetail.string = (Lang.get('recruit_get_detail', {
                    name: this._petData.name,
                    count: this._count
                }));
                this._nodeContinue.node.active = (true);
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayMovingGfx(this._showNode, 'moving_card_open_yes', effectFunction, eventFunction, false);
    }
    _createCard(color) {
        var spriteName = [
            Path.getDrawCard('blue_card'),
            Path.getDrawCard('green_card'),
            Path.getDrawCard('blue_card'),
            Path.getDrawCard('purple_card'),
            Path.getDrawCard('god_card'),
            Path.getDrawCard('red_card')
        ];
        var sprite = UIHelper.newSprite(spriteName[color -1]);
        return sprite.node;
    }
    onImageBGTouch() {
        if (this._isAnimFinish) {
            G_SceneManager.popScene();
        }
    }
}