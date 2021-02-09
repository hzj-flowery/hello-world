import { SeasonSportConst } from "../../../const/SeasonSportConst";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { G_EffectGfxMgr } from "../../../init";
import SquadAvatar from "./SquadAvatar";
import { SeasonSportHelper } from "../seasonSport/SeasonSportHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OtherHeroPickNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal1: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect1: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal2: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect2: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal3: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect3: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal4: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect4: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal5: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect5: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _heroPedespal6: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect6: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _squadAvatarPrefab: cc.Prefab = null;

    private _heroPedespals: cc.Sprite[];
    public init() {
        this._heroPedespals = [this._heroPedespal1, this._heroPedespal2, this._heroPedespal3, this._heroPedespal4, this._heroPedespal5, this._heroPedespal6];
        this._initInfo();
    }

    private _initInfo() {
        for (let index = 0; index < SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            this._heroPedespals[index].node.active = true;
            UIHelper.loadTexture(this._heroPedespals[index], Path.getEmbattle('img_embattleherbg_nml'));
        }
    }

    private _playWujiangPickAnimation(rootNode: cc.Node, key, value) {
        let eventFunction = (event) => {
            if (event == 'finish') {
            } else if (event == 'hero') {
                var avatar = this._createHeroAvatar(value, key);
                avatar.node.name = ('avatar' + key);
                avatar.turnBack(true);
                this._resourceNode.addChild(avatar.node, key * 10);
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_wuchabiebuzhen_wujiang', null, eventFunction.bind(this), false);
    }

    private _createHeroAvatar(heroId, index): SquadAvatar {
        var avatar = cc.instantiate(this._squadAvatarPrefab).getComponent(SquadAvatar);
        var posX = this._heroPedespals[index - 1].node.x;
        var posY = this._heroPedespals[index - 1].node.y;
        avatar.node.x = posX;
        avatar.node.y = posY;
        var limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(heroId);
        avatar.updateUI(heroId, limitLevel);
        avatar.setScale(0.65);
        return avatar;
    }

    public updateUI(data) {
        if (!data) {
            return;
        }
        for (let i = 1; i <= data.length; i++) {
            var value = data[i - 1];
            if (value > 0) {
                if (SeasonSportHelper.isHero(value) == false) {
                    value = SeasonSportHelper.getTransformCardsHeroId(value);
                }
                var avatar = this._resourceNode.getChildByName('avatar' + i);
                if (avatar == null) {
                    this['_nodeEffect' + i].removeAllChildren();
                    this._playWujiangPickAnimation(this['_nodeEffect' + i], i, value);
                }
            }
        }
    }
}