import { ConfigNameConst } from "../../const/ConfigNameConst";
import { G_ConfigLoader, G_EffectGfxMgr } from "../../init";
import { Lang } from "../../lang/Lang";
import { Color } from "../../utils/Color";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { FightConfig } from "../FightConfig";
import EffectActor from "./EffectActor";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BillBoard extends cc.Component {

    private _hpShadow: cc.Node;
    private _hp: cc.Node;
    private _imageAnger: cc.Node[];
    private _angerCountBG: cc.Node;
    private _angerLabel: cc.Label;
    private _buffIcons: cc.Sprite[];

    private _needUpdate: boolean;
    private _hpPercent: number;
    private _angerEffect: cc.Node;
    _panelHpBase: cc.Node;
    _protect: any[];
    _maxHp: any;
    _shadowPercent: number;


    public init(name: string, quality: number, rankLevel: number, isPlayer: boolean,
        officelLevel: number, officalInfoName: string, showMark: any[], camp: number, maxHp, trueQuality) {

        let panelHpBase = UIHelper.newSprite(Path.getBattleRes('img_battle_hpbg')).node;
        panelHpBase.name = "panelHpBase"
        this.node.addChild(panelHpBase);
        panelHpBase.setPosition(0, 5);
        this._panelHpBase = panelHpBase;

        this._hpShadow = UIHelper.newSprite(Path.getBattleRes('img_battle_hpshadow')).node;
        this._hpShadow.name = "_hpShadow";
        panelHpBase.addChild(this._hpShadow);
        this._hpShadow.setAnchorPoint(0, 0.5);
        this._hpShadow.setPosition(-40, 0);

        this._protect = [];

        this._hp = UIHelper.newSprite(Path.getBattleRes('img_battle_hp')).node;
        this._hp.name = "_hp";
        panelHpBase.addChild(this._hp);
        this._hp.setAnchorPoint(0, 0.5);
        this._hp.setPosition(-40, 0);

        var angerBase = UIHelper.newSprite(Path.getBattleRes('img_battle_bar_angebg')).node;
        angerBase.name = "_angerBase"
        this.node.addChild(angerBase);
        angerBase.setPosition(0, -2);
        this._imageAnger = [];
        for (var i = 1; i <= 4; i++) {
            let imageAnger = UIHelper.newSprite(Path.getBattleRes('img_battle_bar_ange0' + i)).node;
            imageAnger.name = "_imageAnger" + i;
            imageAnger.setPosition(-25 + (i - 1) * 16, 0);
            this._imageAnger.push(imageAnger);
            angerBase.addChild(imageAnger);
        }
        this._angerCountBG = UIHelper.newSprite(Path.getBattleRes('img_battle_angenumbg')).node;
        this._angerCountBG.name = "_angerCountBG";
        this.node.addChild(this._angerCountBG);
        this._angerCountBG.setPosition(50, 3);
        // this._angerLabel = UIHelper.createWithCharMap(Path.getBattleFont('img_battle_angenum'));
        this._angerLabel = UIHelper.createWithCharMap(Path.getBattleFontLableAtlas('img_battle_angenum'));
        this._angerLabel.fontSize = 18;
        this._angerLabel.name = "_angerLabel";
        this._angerCountBG.addChild(this._angerLabel.node);
        this._angerLabel.string = ('9');
        this._angerLabel.node.setAnchorPoint(0, 0.5);
        // this._angerLabel.node.setPosition(20, 10);
        this._angerLabel.node.setPosition(0, 10);
        if (rankLevel != 0) {
            if (trueQuality == 7 && !isPlayer) {
                name = name + (' ' + (Lang.get('goldenhero_train_text') + rankLevel));
            } else {
                name = name + ('+' + rankLevel);
            }
        }
        var labelName = UIHelper.createWithTTF(name, Path.getCommonFont(), 22);
        labelName.node.name = "_labelName";
        this.node.addChild(labelName.node);
        labelName.node.setPosition(0, 24);
        if (isPlayer) {
            labelName.node.color = (Color.getOfficialColor(officelLevel));
            UIHelper.enableOutline(labelName, Color.getOfficialColorOutline(officelLevel), 2)
        } else {
            labelName.node.color = (Color.getColor(quality));
            UIHelper.enableOutline(labelName, Color.getColorOutline(quality), 2);
        }
        if (officelLevel && officelLevel != 0 && isPlayer) {
            var labelOfficalName = UIHelper.createWithTTF('[' + (officalInfoName + ']'), Path.getCommonFont(), 22);
            this.node.addChild(labelOfficalName.node);
            labelOfficalName.node.setPosition(0, 45);
            labelOfficalName.node.color = (Color.getOfficialColor(officelLevel));
            UIHelper.enableOutline(labelOfficalName, Color.getOfficialColorOutline(officelLevel), 2);
        }
        this._createMarks(showMark, camp);
        this._buffIcons = [];
        for (var i = 1; i <= 4; i++) {
            var params = {};
            let buffIcon = UIHelper.createImage(params);
            buffIcon.name = "_buffIcon" + i;
            this._buffIcons.push(buffIcon.getComponent(cc.Sprite));
            buffIcon.setAnchorPoint(0, 0);
            buffIcon.setPosition(-40 + 20 * (i - 1), -28);
            buffIcon.setScale(0.5);
            this.node.addChild(buffIcon);
            buffIcon.active = (false);
        }
        this._needUpdate = false;
        this._maxHp = maxHp;
        this._hpPercent = 1;
        this._shadowPercent = 1;
        this._angerEffect = null;
        this.node.active = (false);
    }

    _createNewProtect() {
        var protect = UIHelper.newSprite(Path.getBattleRes('img_battle_es')).node;
        this._panelHpBase.addChild(protect);
        protect.setAnchorPoint(cc.v2(0, 0));
        protect.setPosition(cc.v2(1, 2));
        protect.scaleX = (0);
        this._protect.push(protect);
        protect.zIndex = (this._protect.length);
    }

    private _createMarks(showMark: any[], camp: number) {
        for (let i = 0; i < showMark.length; i++) {
            var v = showMark[i];
            var effect = new cc.Node("_showMark" + (i + 1)).addComponent(EffectActor);
            effect.init(FightConfig.MARK[v - 1]);
            effect.setAction('effect', true);
            this.node.addChild(effect.node);
            effect.node.y = (-15);
            if (camp == 2) {
                effect.node.scaleX = (-1);
            }
        }
    }

    public updateHP(hp, protect?) {
        var hpPercent = hp / this._maxHp;
        if (hpPercent > 100) {
            hpPercent = 100;
        }
        this._shadowPercent = hpPercent;
        this._hp.scaleX = (hpPercent);
        if (protect != 0) {
            var protectCnt = Math.ceil(protect / this._maxHp);
            if (protectCnt != 0) {
                while (!this._protect[protectCnt -1]) {
                    this._createNewProtect();
                }
                for (var i = 0; i < protectCnt - 1; i++) {
                    this._protect[i].scaleX =  1;
                }
                if (protectCnt < this._protect.length) {
                    for (var i = this._protect.length -1; i > protectCnt + 1; i += -1) {
                        this._protect[i].removeFromParent();
                        this._protect.splice(i, 1);
                    }
                }
                var lastProtect = protect - (protectCnt - 1) * this._maxHp;
                var protectPercent = lastProtect / this._maxHp;
                this._protect[this._protect.length -1].scaleX = (protectPercent);
            }
        } else {
            for (var j in this._protect) {
                var v = this._protect[j];
                v.removeFromParent();
            }
            this._protect = [];
        }
    }

    public updateHpShadow(needScaleMoving?) {
        if (needScaleMoving) {
            var action1 = cc.fadeOut(0.2);
            var action2 = cc.callFunc(function () {
                this._hpShadow.scaleX = (this._shadowPercent);
                this._hpShadow.opacity = (255);
            }.bind(this));
            var action = cc.sequence(action1, action2);
            this._hpShadow.runAction(action);
        } else {
            this._hpShadow.scaleX = (this._shadowPercent);
        }
    }

    public setUpdate(f) {

    }

    public showDead() {
        var action1 = cc.fadeOut(0.2);
        var action2 = cc.destroySelf();
        var action = cc.sequence(action1, action2);
        this.node.runAction(action);
    }

    public updateAnger(count) {
        for (var i = 1; i <= 4; i++) {
            if (i <= count) {
                this._imageAnger[i - 1].active = true;
            } else {
                this._imageAnger[i - 1].active = false;
            }
        }
        if (count > 4) {
            this._angerLabel.string = (count);
            this._angerCountBG.active = true;
        } else {
            this._angerCountBG.active = false;
        }
        if (count >= 4) {
            this._playAngerEffect();
        } else {
            this._hideAngerEffect();
        }
    }

    public updateBuff(bufflist: any[], camp?) {
        for (var i = 0; i < 4; i++) {
            this._buffIcons[i].node.active = false;
        }
        var buffPos = 0;
        if (bufflist.length > 4) {
            for (var i = bufflist.length - 4; i < bufflist.length; i++) {
                var data = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(bufflist[i].configId);
                if (data.buff_icon != '') {
                    var picName = Path.getBuffFightIcon(data.buff_icon);
                    UIHelper.loadTexture(this._buffIcons[buffPos], picName);
                    this._buffIcons[buffPos].node.active = true;
                    buffPos = buffPos + 1;
                }
            }
        } else {
            for (var i = 0; i < bufflist.length; i++) {
                var data = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(bufflist[i].configId);
                if (data.buff_icon != '') {
                    var picName = Path.getBuffFightIcon(data.buff_icon);
                    UIHelper.loadTexture(this._buffIcons[buffPos], picName);
                    this._buffIcons[buffPos].node.active = true;
                    buffPos = buffPos + 1;
                }
            }
        }
    }

    private _playAngerEffect() {
        if (!this._angerEffect) {
            this._angerEffect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_nuqi', null, null, false).node;
        }
        this._angerEffect.active = true;
    }

    private _hideAngerEffect() {
        if (this._angerEffect) {
            this._angerEffect.active = false;
        }
    }
}