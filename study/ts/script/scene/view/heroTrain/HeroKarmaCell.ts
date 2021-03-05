const { ccclass, property } = cc._decorator;

import HeroKarmaCellIcon from './HeroKarmaCellIcon'

import HeroKarmaCellTitle from './HeroKarmaCellTitle'
import AttributeConst from '../../../const/AttributeConst';
import { Path } from '../../../utils/Path';
import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonUI from '../../../ui/component/CommonUI';
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';
import CommonListItem from '../../../ui/component/CommonListItem';


var COLOR_KARMA = [
    [
        new cc.Color(255, 222, 109),
        new cc.Color(212, 77, 8, 255)
    ],
    [
        new cc.Color(243, 255, 43),
        new cc.Color(100, 189, 13, 255)
    ]
];
var ICON_POS = {
    1: [new cc.Vec2(152, 131)],
    2: [
        new cc.Vec2(105, 131),
        new cc.Vec2(199, 131)
    ]
};


@ccclass
export default class HeroKarmaCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item1: cc.Node = null;

    @property({
        type: HeroKarmaCellTitle,
        visible: true
    })
    _fileNodeTitle1: HeroKarmaCellTitle = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMark1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle1: cc.Label = null;

    @property({
        type: HeroKarmaCellIcon,
        visible: true
    })
    _fileNodeIcon1_1: HeroKarmaCellIcon = null;

    @property({
        type: HeroKarmaCellIcon,
        visible: true
    })
    _fileNodeIcon1_2: HeroKarmaCellIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item2: cc.Node = null;

    @property({
        type: HeroKarmaCellTitle,
        visible: true
    })
    _fileNodeTitle2: HeroKarmaCellTitle = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMark2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle2: cc.Label = null;

    @property({
        type: HeroKarmaCellIcon,
        visible: true
    })
    _fileNodeIcon2_1: HeroKarmaCellIcon = null;

    @property({
        type: HeroKarmaCellIcon,
        visible: true
    })
    _fileNodeIcon2_2: HeroKarmaCellIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item3: cc.Node = null;

    @property({
        type: HeroKarmaCellTitle,
        visible: true
    })
    _fileNodeTitle3: HeroKarmaCellTitle = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMark3: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle3: cc.Label = null;

    @property({
        type: HeroKarmaCellIcon,
        visible: true
    })
    _fileNodeIcon3_1: HeroKarmaCellIcon = null;

    @property({
        type: HeroKarmaCellIcon,
        visible: true
    })
    _fileNodeIcon3_2: HeroKarmaCellIcon = null;

    private _karmaId1: number;
    private _karmaId2: number;
    private _karmaId3: number;
    private _map: any;


    onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._karmaId1 = null;
        this._karmaId2 = null;
        this._karmaId3 = null;
        this._map = {};

        this._fileNodeTitle1.setInitData(handler(this,this._onButtonActive1));
        this._fileNodeTitle2.setInitData(handler(this,this._onButtonActive2));
        this._fileNodeTitle3.setInitData(handler(this,this._onButtonActive3));
    }

    updateUI(itemId, data):void{
        this.updateData(data[0],data[1],data[2]);
    }

    //原来是update 和组件自带的update重复
    //修改为 updateData
    public updateData(data1, data2, data3) {
        var _this = this;
        var updateCell = function (index, data) {
            if (data) {
                (_this['_fileNodeTitle' + index] as HeroKarmaCellTitle).node.name = ('HeroKarmaCellTitle' + data.id);
                _this._map[data.id] = index;
                _this['_karmaId' + index] = data.id;
                _this['_item' + index].active = (true);
                var isCanActivate = true;
                var heroIds = data.heroIds;
                var visibleCount = 0;
                for (var i = 1; i <= 2; i++) {
                    var heroId = heroIds[i-1];
                    if (heroId) {
                        (_this['_fileNodeIcon' + (index + ('_' + i))] as HeroKarmaCellIcon).node.active = (true);
                        var isHaveHero = G_UserData.getKarma().isHaveHero(heroId);
                        (_this['_fileNodeIcon' + (index + ('_' + i))] as HeroKarmaCellIcon).updateIcon(heroId, !isHaveHero);
                        isCanActivate = isCanActivate && isHaveHero;
                        visibleCount = visibleCount + 1;
                    } else {
                        (_this['_fileNodeIcon' + (index + ('_' + i))] as HeroKarmaCellIcon).node.active = (false);
                    }
                }
                var posInfo = ICON_POS[visibleCount];
                if (posInfo) {
                    for (var i = 1; i <= visibleCount; i++) {
                        var pos = posInfo[i-1];
                        (_this['_fileNodeIcon' + (index + ('_' + i))] as HeroKarmaCellIcon).node.setPosition(pos);
                    }
                }
                var des = Lang.get('hero_karma_attr_title', {
                    attrName: data.attrName,
                    attrValue: data.attrValue
                });
                var isActivated = G_UserData.getKarma().isActivated(data.id);
                (_this['_fileNodeTitle' + index] as HeroKarmaCellTitle).setDes(des, isActivated, isCanActivate, data.attrId);
                var titleBgRes = isActivated && Path.getFetterRes('img_namebg_light') || Path.getFetterRes('img_namebg_nml');
                var titleColor = isActivated && COLOR_KARMA[1][0] || COLOR_KARMA[0][0];
                var titleOutline = isActivated && COLOR_KARMA[1][1] || COLOR_KARMA[0][1];
                (_this['_textTitle' + index] as cc.Label).string = (data.karmaName);
                (_this['_imageTitle' + index] as cc.Sprite).addComponent(CommonUI).loadTexture(titleBgRes);
                (_this['_textTitle' + index] as cc.Label).node.color = titleColor;
                UIHelper.enableOutline((_this['_textTitle' + index] as cc.Label), titleOutline, 2)
                var markRes = _this._getMarkRes(isActivated, data.attrId);
                if (markRes) {
                    (_this['_imageMark' + index] as cc.Sprite).addComponent(CommonUI).loadTexture(markRes);
                }
            } else {
                _this['_item' + index].active = (false);
            }
        }
        updateCell(1, data1);
        updateCell(2, data2);
        updateCell(3, data3);
    }
    _getMarkRes(isActivated, attrId) {
        var res = {
            [AttributeConst.ATK_PER]: [
                'img_attackicon_light',
                'img_attackicon_nml'
            ],
            [AttributeConst.DEF_PER]: [
                'img_deficon_light',
                'img_deficon_nml'
            ],
            [AttributeConst.HP_PER]: [
                'img_healicon_light',
                'img_healicon_nml'
            ]
        };
        var info = res[attrId];
        if (info) {
            var name = isActivated && info[0] || info[1];
            return Path.getFetterRes(name);
        } else {
            return null;
        }
    }
    _onButtonActive(id) {
        var index = this._map[id];
        this.dispatchCustomCallback(index);
    }
    _onButtonActive1() {
        this.dispatchCustomCallback(1);
    }
    _onButtonActive2() {
        this.dispatchCustomCallback(2);
    }
    _onButtonActive3() {
        this.dispatchCustomCallback(3);
    }
    getKarmaId1() {
        return this._karmaId1;
    }
    getKarmaId2() {
        return this._karmaId2;
    }
    getKarmaId3() {
        return this._karmaId3;
    }

}