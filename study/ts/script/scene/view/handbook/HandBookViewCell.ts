import { Colors, G_SceneManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { ComponentIconHelper } from "../../../ui/component/ComponentIconHelper";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from "../../../utils/UIHelper";
import { Util } from "../../../utils/Util";
import PopupEquipDetail from "../equipmentDetail/PopupEquipDetail";
import PopupJadeDetail from "../equipmentJade/PopupJadeDetail";
import PopupHorseDetail from "../horseDetail/PopupHorseDetail";
import PopupSilkbagDetailEx from "../silkbag/PopupSilkbagDetailEx";
import PopupTreasureDetail from "../treasureDetail/PopupTreasureDetail";
import HandBookHelper from "./HandBookHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HandBookViewCell extends ListViewCellBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _nodePos: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelCon: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemNum1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemNum2: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _itemNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _topImage: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemType: cc.Label = null;
    _itemType: any;
    _itemIdArray: any;

    public static readonly LINE_ICON_HEIGHT = 162;
    public static readonly LINE_ICON_WIDTH = 920;
    public static readonly LINE_ICON_INTERVAL = 111;
    public static readonly LINE_ICON_NUM = 8;
    public CHANGE_MODEL;

    private startY: number;
    _iconList: any;
    onCreate() {
        var size = this._panelCon.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this.initData();
    }

    initData() {
        this._itemIdArray = [];
        this._iconList = [];
        // var data: Array<string> = [];
        // data.push("prefab/heroDetail/PopupHeroDetail");
        // data.push("prefab/treasure/PopupTreasureDetail");
        // data.push("prefab/equipment/PopupEquipDetail");
        // cc.resources.load(data)

        this.CHANGE_MODEL = {
            1: {
                colorTitle: 'txt_wujiangyulan0',
                funcPopupDetail: function (params) {
                    var itemCfg = params.cfg;
                    // var resource = cc.resources.get("prefab/heroDetail/PopupHeroDetail");
                    // var node1 = cc.instantiate(resource) as cc.Node;
                    // let cell = node1.getComponent(PopupHeroDetail) as PopupHeroDetail;
                    // cell.initData(TypeConvertHelper.TYPE_HERO, itemCfg.id, true, params.limitLevel);
                    // cell.openWithAction();
                    //  UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO, itemCfg.id)
                    G_SceneManager.openPopup('prefab/heroDetail/PopupHeroDetail', (p) => {
                        p.initData(TypeConvertHelper.TYPE_HERO, itemCfg.id, false, params.limitLevel, params.limitRedLevel);
                        p.openWithAction();
                    })

                    // var heroList = G_UserData.getHandBook().getHeroList();
                    // var sameCountry = [];
                    // for (let i = 0; i < heroList.length; i++) {
                    //     var value = heroList[i];
                    //     if (itemCfg.country == value.cfg.country) {
                    //         sameCountry.push(value);
                    //     }
                    // }
                    // cell.setPageData(sameCountry);
                    // cell.setDrawing(true);
                }
            },
            3: {
                colorTitle: 'txt_baowuyulan0',
                funcPopupDetail: function (params) {
                    var itemCfg = params.cfg;
                    // var resource = cc.resources.get("prefab/treasure/PopupTreasureDetail");
                    // var node1 = cc.instantiate(resource) as cc.Node;
                    // let cell = node1.getComponent(PopupTreasureDetail) as PopupTreasureDetail;
                    // cell.initData(TypeConvertHelper.TYPE_TREASURE, itemCfg.id);
                    // cell.openWithAction();
                    cc.resources.load("prefab/common/PopupTreasureDetail", cc.Prefab, (err, resource) => {
                        var popupTreasureDetail: PopupTreasureDetail = Util.getNode('prefab/common/PopupTreasureDetail', PopupTreasureDetail);
                        popupTreasureDetail.initData(TypeConvertHelper.TYPE_TREASURE, itemCfg.id);
                        popupTreasureDetail.openWithAction();
                    });
                    // let treasureList = G_UserData.getHandBook().getTreasureList()
                    // cell.setPageData(treasureList)
                }
            },
            2: {
                colorTitle: "txt_zhuangbeiyulan0",
                funcPopupDetail: function (params) {
                    let itemCfg = params.cfg
                    // var resource = cc.resources.get("prefab/equipment/PopupEquipDetail");
                    // var node1 = cc.instantiate(resource) as cc.Node;
                    // let cell = node1.getComponent(PopupEquipDetail) as PopupEquipDetail;
                    // cell.initData(TypeConvertHelper.TYPE_EQUIPMENT, itemCfg.id);
                    // cell.openWithAction();
                    // let equipList = G_UserData.getHandBook().getEquipList()
                    // cell.setPageData(equipList)
                    cc.resources.load("prefab/equipment/PopupEquipDetail", cc.Prefab, (err, resource) => {
                        var popupEquipDetail: PopupEquipDetail = Util.getNode('prefab/equipment/PopupEquipDetail', PopupEquipDetail);
                        popupEquipDetail.initData(TypeConvertHelper.TYPE_EQUIPMENT, itemCfg.id);
                        popupEquipDetail.openWithAction();
                    });
                }
            },
            11: {
                colorTitle: "txt_chengsejinnang0",
                funcPopupDetail: function (params) {
                    let itemCfg = params.cfg
                    // var resource = cc.resources.get("prefab/equipment/PopupSilkbagDetailEx.prefab");
                    // var node1 = cc.instantiate(resource) as cc.Node;
                    // let cell = node1.getComponent(PopupEquipDetail) as PopupEquipDetail;
                    // cell.initData(TypeConvertHelper.TYPE_EQUIPMENT, itemCfg.id);
                    // cell.openWithAction();
                    // let equipList = G_UserData.getHandBook().getEquipList()
                    // cell.setPageData(equipList)

                    cc.resources.load("prefab/silkbag/PopupSilkbagDetailEx", cc.Prefab, (err, resource) => {
                        var popupEquipDetail: PopupSilkbagDetailEx = Util.getNode("prefab/silkbag/PopupSilkbagDetailEx", PopupSilkbagDetailEx);
                        popupEquipDetail.ctor(TypeConvertHelper.TYPE_HORSE, itemCfg.id);
                        popupEquipDetail.openWithAction();
                    });
                }
            },
            12: {
                colorTitle: "txt_horse0",
                funcPopupDetail: function (params) {
                    let itemCfg = params.cfg
                    // var resource = cc.resources.get("prefab/equipment/PopupEquipDetail.prefab");
                    // var node1 = cc.instantiate(resource) as cc.Node;
                    // let cell = node1.getComponent(PopupEquipDetail) as PopupEquipDetail;
                    // cell.initData(TypeConvertHelper.TYPE_EQUIPMENT, itemCfg.id);
                    // cell.openWithAction();
                    // let equipList = G_UserData.getHandBook().getEquipList()
                    // cell.setPageData(equipList)
                    cc.resources.load("prefab/horse/PopupHorseDetail", cc.Prefab, (err, resource) => {
                        var popupEquipDetail: PopupHorseDetail = Util.getNode("prefab/horse/PopupHorseDetail", PopupHorseDetail);
                        popupEquipDetail.ctor(TypeConvertHelper.TYPE_HORSE, itemCfg.id);
                        popupEquipDetail.openWithAction();
                    });
                }
            },
            16: {
                colorTitle: "txt_jade0",
                funcPopupDetail: function (params) {
                    let itemCfg = params.cfg
                    // var resource = cc.resources.get("prefab/equipment/PopupEquipDetail.prefab");
                    // var node1 = cc.instantiate(resource) as cc.Node;
                    // let cell = node1.getComponent(PopupEquipDetail) as PopupEquipDetail;
                    // cell.initData(TypeConvertHelper.TYPE_EQUIPMENT, itemCfg.id);
                    // cell.openWithAction();
                    // let equipList = G_UserData.getHandBook().getEquipList()
                    // cell.setPageData(equipList)

                    cc.resources.load("prefab/equipment/PopupJadeDetail", cc.Prefab, (err, resource) => {
                        var popupEquipDetail: PopupJadeDetail = Util.getNode("prefab/equipment/PopupJadeDetail", PopupJadeDetail);
                        popupEquipDetail.ctor(TypeConvertHelper.TYPE_JADE_STONE, itemCfg.id);
                        popupEquipDetail.openWithAction();
                    });
                }
            },
            17: {
                colorTitle: 'txt_historyhero0',
                funcPopupDetail: function (params) {
                    var historyHeroList = G_UserData.getHandBook().getHistoryHeroList();
                    var itemCfg = params.cfg;
                    var popup = new (require('PopupHistoryHeroDetail'))(TypeConvertHelper.TYPE_HISTORY_HERO, null, historyHeroList, true, 1, itemCfg.id);
                    popup.openWithAction();
                }
            }
        }
    }

    updateUI(itemType, color, itemIdArray, itemOwnerCount, y: number) {
        if (itemIdArray == null) {
            return;
        }
        this._itemType = itemType;
        this.startY = y;
        this._itemIdArray = itemIdArray;
        this._autoExtend(itemIdArray);
        this.startPos = 0;
        this.schedule(this._updateIconArray, 0.1);
        // this._updateIconArray(itemIdArray);
        this._updateItemNum(color, itemOwnerCount);
    }
    _getColorTitle(color) {
        if (color >= 2 && color <= 7) {
            var changeTable = this.CHANGE_MODEL[this._itemType];
            if (changeTable) {
                return Lang.get(changeTable.colorTitle)[color - 1];
            }
        }
        return '';
    }
    _updateItemNum(color, itemOwnerCount) {
        var colorTitle = this._getColorTitle(color);
        UIHelper.loadTexture(this._topImage, Path.getUICommon('img_quality_title0' + color));
        if (itemOwnerCount.ownNum == itemOwnerCount.totalNum) {
            this._textItemNum1.node.color = (Colors.uiColors.GREEN);
            this._textItemNum2.node.color = (Colors.uiColors.GREEN);
        } else {
            this._textItemNum1.node.color = (Colors.uiColors.RED);
            this._textItemNum2.node.color = (Colors.COLOR_TITLE_MAIN);
        }
        this._textItemNum1.string = (itemOwnerCount.ownNum);
        HandBookHelper.fitBookTextContent(this._textItemNum1);
        var num2Pos = this._textItemNum1.node.x + this._textItemNum1.node.getContentSize().width;
        this._textItemNum2.string = ('/' + itemOwnerCount.totalNum);
        this._textItemNum2.node.x = (num2Pos + 2);
        if (colorTitle) {
            var txtColor = Colors.getColor(color);
            //var txtColorOutline = Colors.getColorOutline(color);
            // dump(colorOutline);
            this._textItemType.string = (colorTitle);
            this._textItemType.node.color = new cc.Color(255, 255, 255);
            if (color != 7) {
                UIHelper.enableOutline(this._textItemType, txtColor, 2);
            }
        }
    }
    _createIconArray(node, itemIdArray) {
        var totalNum = itemIdArray.length;
        var x = 0, y = 0;
        for (var i = 0; i < totalNum; i++) {
            var row = Math.ceil((i + 1) / HandBookViewCell.LINE_ICON_NUM);
            var column = (i + 1) - (row - 1) * HandBookViewCell.LINE_ICON_NUM;
            var icon = ComponentIconHelper.createIcon(this._itemType);
            node.addChild(icon);
            var className = TypeConvertHelper.getTypeClass(this._itemType);
            var comp = icon.getComponent(className);
            comp.setName('item' + i);
            // icon.getComponent(className).addBgImageForName(null, 100);
            icon.x = HandBookViewCell.LINE_ICON_INTERVAL * (column - 1);
            icon.y = (row - 1) * -1 * HandBookViewCell.LINE_ICON_HEIGHT;
            icon.active = false;
            icon.getComponent(className).setNameFontSize(22);
            icon.getComponent(className).setNameOverflow(cc.Label.Overflow.RESIZE_HEIGHT);
            this._iconList.push(icon);
        }
    }
    onIconCallBack(sender, itemParams, limitLevel, limitRedLevel) {
        var changeTable = this.CHANGE_MODEL[itemParams.type];
        if (changeTable) {
            changeTable.funcPopupDetail({
                cfg: itemParams.cfg,
                limitLevel: limitLevel,
                limitRedLevel: limitRedLevel
            });
        }
    }

    private startPos = 0;
    _updateIconArray(/* itemIdArray */) {
        let itemIdArray = this._itemIdArray;
        // let i1 = this.startPos;
        let curPos = this.startPos;
        if (this._itemType == 3 || this._itemType == 16) {
            for (let i = itemIdArray.length - 1 - this.startPos; i >= 0; i--) {
                var heroData = itemIdArray[i];
                var icon = this._iconList[itemIdArray.length - 1 - i];
                if (icon) {
                    this.updateIcon(icon, heroData);
                }

                this.startPos++;
                if (this.startPos - curPos >= 1) {
                    break;
                }
            }
            if (this.startPos <= 0) {
                this.unschedule(this._updateIconArray);
            }
        }
        else {
            for (let i = this.startPos; i < itemIdArray.length; i++) {
                var heroData = itemIdArray[i];
                var icon = this._iconList[i];
                if (icon) {
                    this.updateIcon(icon, heroData);
                }

                this.startPos++;
                if (this.startPos - curPos >= 1) {
                    break;
                }
            }

            if (this.startPos >= itemIdArray.length) {
                this.unschedule(this._updateIconArray);
            }
        }
    }

    onExit() {
        this.unschedule(this._updateIconArray);
        super.onExit();
    }

    private updateIcon(icon, heroData) {
        var className = TypeConvertHelper.getTypeClass(this._itemType);
        icon.getComponent(className).updateUI(heroData.cfg.id, null, heroData.limitLevel, heroData.limitRedLevel);
        icon.getComponent(className).setTouchEnabled(true);
        icon.getComponent(className).showName(true, 100);
        icon.getComponent(className).addBgImageForName(null, 100);

        icon.getComponent(className).setCallBack(handler(this, this.onIconCallBack));
        icon.active = (true);
        if (heroData.isHave == true) {
            icon.getComponent(className).setIconMask(false);
        } else {
            icon.getComponent(className).setIconMask(true);
        }
    }

    _autoExtend(itemIdArray) {
        var lineCount = Math.ceil(itemIdArray.length / HandBookViewCell.LINE_ICON_NUM);
        var rootContentSize = this._panelCon.getContentSize();
        var extendSize = (lineCount - 1) * HandBookViewCell.LINE_ICON_HEIGHT;
        var rootContentHeight = extendSize + rootContentSize.height;
        this._panelCon.setContentSize(cc.size(rootContentSize.width, rootContentHeight + 20));
        var size = this._panelCon.getContentSize();
        this.node.setContentSize(size.width, size.height);
        // this._nodePos.y = (extendSize + 20 - this.startY);
        // this._nodePos.x = 0;
        // this._nodePos.y = 0;
        this.node.x = 0;
        this.node.y = this.startY + extendSize + 20;
        this._createIconArray(this._itemNode, itemIdArray);
    }

}