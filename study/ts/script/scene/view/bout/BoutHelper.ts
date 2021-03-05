import { AudioConst } from "../../../const/AudioConst";
import { BoutConst } from "../../../const/BoutConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { DataConst } from "../../../const/DataConst";
import UIConst from "../../../const/UIConst";
import EffectHelper from "../../../effect/EffectHelper";
import { Colors, G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { Color } from "../../../utils/Color";
import { AttrDataHelper } from "../../../utils/data/AttrDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { assert, rawequal } from "../../../utils/GlobleFunc";
import { Path } from "../../../utils/Path";
import ResourceLoader from "../../../utils/resource/ResourceLoader";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";


export namespace BoutHelper {




    export function initBoutInfo() {
        var boutInfo = {};
        var bout_info = G_ConfigLoader.getConfig(ConfigNameConst.BOUT_INFO);
        for (var i = 0; i < bout_info.length(); i++) {
            var indexData = bout_info.indexOf(i);
            if (!boutInfo[indexData.id]) {
                boutInfo[indexData.id] = {};
            }
            boutInfo[indexData.id][indexData.point] = indexData;
        }
        return boutInfo;
    };
    export function getBoutBaseItem(id) {
        var bout_base = G_ConfigLoader.getConfig(ConfigNameConst.BOUT_BASE);
        var indexData = bout_base.indexOf(id-1);
        if (indexData) {
            return indexData;
        }
        assert(false, 'can\'t find the bout\'s id(%d) config of bout_base', id);
    };
    export function getBoutInfoItem(id, pos) {
        var bout_info = G_ConfigLoader.getConfig(ConfigNameConst.BOUT_INFO);
        var indexData = bout_info.get(id, pos);
        if (indexData) {
            return indexData;
        }
        assert(false, 'can\'t find the bout\'s id-pos(%d-%d) config of bout_info', id, pos);
    };
    export function isCanUnlockSBoutPoint(pos) {
        var curBoutId = G_UserData.getBout().getCurBoutId();
        var curBoutList = G_UserData.getBout().getBoutList();
        if (!curBoutList || !curBoutList[curBoutId]) {
            return false;
        }
        var data = G_UserData.getBout().getBoutInfo()[curBoutId][pos];
        if (!BoutHelper.isEnoughJade2(data.cost_yubi)) {
            return false;
        }
        var boutInfo = G_UserData.getBout().getBoutInfo();
        return rawequal(table.nums(curBoutList[curBoutId]), table.nums(boutInfo[curBoutId]) - 1);
    };
    export function isSpecialBoutPoint(id, pos) {
        var info = BoutHelper.getBoutInfoItem(id, pos);
        if (!info) {
            return false;
        }
        return rawequal(info.point_type, 2);
    };
    export function checkRedPoint(node: cc.Node, pos) {
        var curBoutId = G_UserData.getBout().getCurBoutId();
        var isLocked = G_UserData.getBout().checkUnlocked(curBoutId, pos);
        if (!isLocked) {
            node.active = (false);
        } else {
            var isRed: boolean = BoutHelper.isEnoughConsume({
                id: curBoutId,
                pos: pos
            })[0];
            var isSpecial = BoutHelper.isSpecialBoutPoint(curBoutId, pos);
            if (isSpecial) {
                node.active = (BoutHelper.isCanUnlockSBoutPoint(pos));
            } else {
                node.active = (isRed);
            }
        }
    };
    export function checkTexture(pointNode: cc.Button, isEnabled) {
        var curBoutId = G_UserData.getBout().getCurBoutId();
        var isSpecial = BoutHelper.isSpecialBoutPoint(curBoutId, pointNode["tag"]);
        var texture = Path.getBoutPath('img_bout_kaiqi02');
        if (isSpecial) {
            var isLock = G_UserData.getBout().checkUnlocked(curBoutId, pointNode["tag"]);
            texture = isLock && Path.getBoutPath('img_bout_kaiqi02b') || Path.getBoutPath('img_bout_kaiqi01b');
        } else {
            texture = isEnabled && Path.getBoutPath('img_bout_kaiqi02') || Path.getBoutPath('img_bout_kaiqi01');
        }
        UIHelper.loadTexture(pointNode.target.getComponent(cc.Sprite), texture);
    };
    export function checkNameColor(label: cc.Label, index) {
        var outLineSize = index == 3 && 1 || 2;
        var fontSize = index == 3 && 20 || 22;
        if (index == 3 && label["tag"] != 3) {
            BoutHelper.createEffect(label.node, 1, null, false, cc.v2(0,-10));
        }
        label["tag"] = (index);
        label.node.color = (Color.BOUT_POINTNAME_COLOR[index-1][0]);
        UIHelper.enableOutline(label, Color.BOUT_POINTNAME_COLOR[index-1][1], outLineSize);
        label.fontSize = (fontSize);
    };
    export function createAddOn(callBack) {
        var texture = Path.getBoutPath('img_bout_jiacheng01');
        var btn = new cc.Node().addComponent(cc.Button);
        var btnTarget = new cc.Node().addComponent(cc.Sprite);
        btn.node.setContentSize(100,100);
        btn.target = btnTarget.node;
        btnTarget.node.setPosition(-6,0);
        btn.node.addChild(btnTarget.node);
        UIHelper.loadTexture(btnTarget, texture);
        btn.node.on(cc.Node.EventType.TOUCH_START, callBack, this);
        btn.node.setPosition(cc.v2(207-1386/2, 74-640/2));
        return btn;
    };
    export function createBottom(rootNode: cc.Sprite, boutPos) {
        var curBoutId = G_UserData.getBout().getCurBoutId();
        var bottom = UIHelper.createImage({ texture: Path.getBoutBottomPath('img_bout_0' + (curBoutId + ('_0' + boutPos)), curBoutId) });
        bottom.name = (BoutConst.BOUT_BOTTOM_NAMEKEY + boutPos);
        bottom.setAnchorPoint(cc.v2(0.5, 0.5));
        bottom.opacity = (80);
        rootNode.node.addChild(bottom, 1);
        return bottom;
    };
    export function createRedPoint(isSpecial) {
        var pos = isSpecial && cc.v2(70 / 2, 85 / 2) || cc.v2(62 / 2, 82 / 2);
        var redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
        redImg.name = ('RedPoint');
        redImg.setPosition(pos);
        return redImg;
    };
    export function createBoutPoint(rootNode: cc.Sprite, boutPos, callBack:Function,labelName:cc.Label) {
        var curBoutId = G_UserData.getBout().getCurBoutId();
        var isSpecial = BoutHelper.isSpecialBoutPoint(curBoutId, boutPos);
        var texture = isSpecial && Path.getBoutPath('img_bout_kaiqi02b') || Path.getBoutPath('img_bout_kaiqi02');
        var pos = isSpecial && cc.v2(65, 64) || cc.v2(42, 64);
        let btn = new cc.Node().addComponent(cc.Button);
        btn.node.setContentSize(78,78);
        let btnTarget = new cc.Node().addComponent(cc.Sprite);
        btn.node.addChild(btnTarget.node);
        btn.target = btnTarget.node;
        UIHelper.loadTexture(btnTarget, texture);
        // btn.clickEvents = [];
        // btn.clickEvents.push(callBack);
        btn.node.on(cc.Node.EventType.TOUCH_START,callBack,this);
        btn["tag"] = (boutPos);
        btn.node.setPosition(pos);
        btn.node.name = (BoutConst.BOUT_POINT_NAMEKEY + boutPos);
        var pos2 = isSpecial && cc.v2(0, 15) || cc.v2(0, 15);
        var selectImg = UIHelper.createImage({});
        selectImg.name = ('selected');
        selectImg.active = (false);
        selectImg.setAnchorPoint(cc.v2(0.5, 0.5));
        selectImg.setPosition(pos2);
        // selectImg.setSwallowTouches(false);
        BoutHelper.createEffect(selectImg, 3, null, false, cc.v2(-2, -1));
        var pos3 = isSpecial && cc.v2(0, 11) || cc.v2(0, 10);
        btn.node.addChild(labelName.node);
        labelName.node.active = true;
        labelName.fontSize = 22;
        labelName.node.name = ('pointName');
        labelName["tag"] = (1);
        var isLocked = G_UserData.getBout().checkUnlocked(curBoutId, boutPos);
        var colorIdx = isLocked && 1 || 3;
        BoutHelper.checkNameColor(labelName, colorIdx);
        btn.scheduleOnce(()=>{
            labelName.node.setAnchorPoint(cc.v2(0.5, 0.5));
            labelName.node.setPosition(pos3);
        })
        labelName.node.setAnchorPoint(cc.v2(0.5, 0.5));
        labelName.node.setPosition(pos3);
        var redImg = BoutHelper.createRedPoint(isSpecial);
        BoutHelper.checkRedPoint(redImg, boutPos);
        var effectActive = new cc.Node();
        effectActive.name = ('EffectActive');
        btn.node.addChild(selectImg);
        btn.node.addChild(effectActive);
        btn.node.addChild(redImg, 10);
        rootNode.node.addChild(btn.node, 2);
        return btn;
    };
    export function getConsumeItems(id, pos) {
        var consumeItems = [];
        var info = BoutHelper.getBoutInfoItem(id, pos);
        for (var index = 1; index <= BoutConst.CONSUME_HERO_MAXNUM; index++) {
            if (info['cost_hero' + index] > 0) {
                table.insert(consumeItems, {
                    type: TypeConvertHelper.TYPE_HERO,
                    value: info['cost_hero' + index],
                    size: info['cost_hero' + (index + '_num')]
                });
            }
        }
        return [
            consumeItems,
            info.cost_yubi
        ];
    };
    export function getAttrbute(id, pos) {
        var attrs = {};
        var info = BoutHelper.getBoutInfoItem(id, pos);
        for (var index = 1; index <= BoutConst.CONSUME_HERO_ATTRS; index++) {
            if (info['attribute_value_' + index] > 0) {
                if (!attrs[info['attribute_type_' + index]]) {
                    attrs[info['attribute_type_' + index]] = 0;
                }
                attrs[info['attribute_type_' + index]] = attrs[info['attribute_type_' + index]] + info['attribute_value_' + index];
            }
        }
        return attrs;
    };
    export function checkOfficerLevel(v) {
        var curOfficiallevel = G_UserData.getBase().getOfficialLevel();
        var boutData = BoutHelper.getBoutBaseItem(v.id);
        return [
            curOfficiallevel >= boutData.need_office,
            boutData.need_office
        ];
    };
    export function isEnoughJade2(curNum) {
        var myJadeNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        if (curNum > myJadeNum) {
            return false;
        }
        return true;
    };
    export function isEnoughUniqueIds(consumeHeroIds, sameCards, costNum): boolean {
        var count = 0;
        for (let k in sameCards) {
            var card = sameCards[k];
            if (count >= costNum) {
                break;
            }
            table.insert(consumeHeroIds, card.getId());
            count = count + 1;
        }
        return count >= costNum;
    }

    export function isEnoughConsume(v): Array<any> {
        var [isEnoughOffi, _a] = BoutHelper.checkOfficerLevel(v);
        if (!isEnoughOffi) {
            return [
                false,
                null
            ];
        }
        var data = G_UserData.getBout().getBoutInfo()[v.id][v.pos];
        if (!BoutHelper.isEnoughJade2(data.cost_yubi)) {
            return [
                false,
                null
            ];
        }
        var hero = G_UserData.getHero();
        var consumeHeroIds = [];
        for (var index = 1; index <= BoutConst.CONSUME_HERO_MAXNUM; index++) {
            if (data['cost_hero' + index] && data['cost_hero' + index] > 0) {
                var sameCards = hero.getSameCardCountWithBaseId(data['cost_hero' + index]);
                if (!sameCards) {
                    return [
                        false,
                        null
                    ];
                }
                if (!isEnoughUniqueIds(consumeHeroIds, sameCards, data['cost_hero' + (index + '_num')])) {
                    var info = HeroDataHelper.getHeroConfig(data['cost_hero' + index]);
                    return [
                        false,
                        consumeHeroIds
                    ];
                }
            }
        }
        return [
            true,
            consumeHeroIds
        ];
    };
    export function playEffectMusic(id, pos) {
        if (BoutHelper.isSpecialBoutPoint(id, pos)) {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_BOUT_SPECIALACTIVE);
        } else {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_BOUT_NORMALACTIVE);
        }
    };
    export function playActiveSummary(id, pos) {
        var info = BoutHelper.getBoutBaseItem(id);
        var boutData = BoutHelper.getBoutInfoItem(id, pos);
        var summary = [];
        var content = Lang.get('bout_active', {
            boutName: info.name,
            boutColor: Colors.colorToNumber(Colors.COLOR_QUALITY[info.color-1]),
            boutOutline: Colors.colorToNumber(Colors.COLOR_QUALITY_OUTLINE[info.color-1]),
            pointName: boutData.point_name
        });
        var param = { content: content };
        table.insert(summary, param);
        BoutHelper.addBaseAttrPromptSummary(summary, id, pos);
        G_Prompt.showSummary(summary);
    };
    export function addBaseAttrPromptSummary(summary, id, pos) {
        var result = BoutHelper.getAttrbute(id, pos);
        for (let k in result) {
            var v = result[k];
            if (v != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(k, v),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                table.insert(summary, param);
            }
        }
        return summary;
    };
    export function playRevertoSpecialEffect(rootNode: cc.Node, pointNodes: Array<cc.Button>, callBack: Function) {
        if (!pointNodes || table.nums(pointNodes) <= 0) {
            return;
        }
        function playEffect(rootNode, startPos, endPos) {
            var node = new cc.Node();
            var emitter = node.addComponent(cc.ParticleSystem);
            let effectPath1 = "effect/particle/qilingguijichengse.plist";
            let effectPath = 'effect/particle/zhenfalizi.plist';
            EffectHelper.loadEffectRes(effectPath1, cc.ParticleAsset, (res: any) => {
                if (emitter && rootNode) {
                    emitter.file = res;
                    emitter.node.setPosition(startPos);
                    rootNode.addChild(emitter.node);
                    emitter.resetSystem();
                }
                var pointPos1 = cc.v2(startPos.x, startPos.y + 200);
                var pointPos2 = cc.v2((startPos.x + endPos.x) / 2, startPos.y + 100);
                var bezier = [
                    pointPos1,
                    pointPos2,
                    endPos
                ];
                var action1 = cc.bezierTo(2, bezier);
                emitter.node.runAction(cc.sequence(action1, cc.delayTime(0.8), cc.callFunc(function () {
                    if (callBack) {
                        callBack();
                    }
                }), cc.removeSelf()));
                
            })

           

           
        }
        var max: number = pointNodes.length - 1;
        var size = pointNodes[1].node.getContentSize();
        let maxPosx = pointNodes[max].node.x;
        let maxPosy = pointNodes[max].node.y;
        // var endPos = UIHelper.convertSpaceFromNodeToNode(pointNodes[max].node, rootNode, cc.v2(0,0));
        var endPos = cc.v2(pointNodes[max].node.x,pointNodes[max].node.y)
        for (let k = 1; k < pointNodes.length; k++) {
            var v = pointNodes[k];
            if (k != max) {
                // var startPos = UIHelper.convertSpaceFromNodeToNode(pointNodes[k].node, rootNode, cc.v2(0,0));
                var startPos = cc.v2(pointNodes[k].node.x,pointNodes[k].node.y);
                playEffect(rootNode, startPos, endPos);
            }
        }
    };
    export function createEffect(node:cc.Node, idx, callBack, isAudoRelease, pos) {
        G_EffectGfxMgr.createPlayGfx(node, 'effect_zhenfagu_jihuo' + idx, callBack, isAudoRelease, pos);
    };
}