import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import HandBookHelper from "../scene/view/handbook/HandBookHelper";
import { HeroConst } from "../const/HeroConst";
import { clone2 } from "../utils/GlobleFunc";
import ParameterIDConst from "../const/ParameterIDConst";
;

export class HandBookData extends BaseData {
    _homelandBuffInfos: any[];
    _historyHeroList: any;
    _historyHeroInfos: any;
    _historyOwnerCount: any;
    constructor() {
        super()

        this._recvGetResPhoto = G_NetworkManager.add(MessageIDConst.ID_S2C_GetResPhoto, this._s2cGetResPhoto.bind(this));
        this._handbookList = {};
        this._heroInfos = {};
        this._treasureInfos = [];
        this._equipInfos = {};
        this._heroOwnerCount = {};
        this._treasureOwnerCount = {};
        this._equipOwnerCount = {};
        this._silkbagInfos = {};
        this._silkbagOwnerCount = {};
        this._horseInfos = {};
        this._horseOwnerCount = {};
        this._petInfos = {};
        this._petList = [];
        this._petOwnerCount = {};
        this._homelandBuffInfos = [];

    }

    public static HERO_TYPE = 1
    public static EQUIP_TYPE = 2
    public static TREASURE_TYPE = 3
    public static PET_TYPE = 6
    public static SILKBAG_TYPE = 7
    public static HORSE_TYPE = 8
    public static HISTORICALHERO_TYPE = 9 // 历代名将
    public static JADE_STONE_TYPE = 11
    public static HOMELAND_BUFF_TYPE = 12;
    public static EQUIP_JADE_TYPE_COUNT = 4;

    private _recvGetResPhoto;
    private _handbookList;
    private _heroInfos;
    private _treasureInfos: Array<any>;
    private _equipInfos;
    private _heroOwnerCount;
    private _treasureOwnerCount;
    private _equipOwnerCount;
    private _silkbagInfos;
    private _silkbagOwnerCount;
    private _horseInfos;
    private _horseOwnerCount;
    private _petInfos: any;
    private _petList: Array<any>;
    private _petOwnerCount;

    clear() {
    }
    reset() {
    }
    c2sGetResPhoto() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetResPhoto, {});
    }
    _s2cGetResPhoto(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var res_photo = message['res_photo'];
        if (!res_photo) {
            return;
        }
        for (var i in res_photo) {
            var value = res_photo[i];
            this._handbookList['k' + value.res_type] = this._handbookList['k' + value.res_type] || {};
            if (!this._handbookList['k' + value.res_type]['k' + value.res_id]) {
                this._handbookList['k' + value.res_type]['k' + value.res_id] = {
                    has: true,
                    limitLevel: 0,
                    limitRedLevel: 0
                };
            }
            var item = this._handbookList['k' + value.res_type]['k' + value.res_id];
            if (value.res_lv > item.limitLevel) {
                item.limitLevel = value.res_lv;
            }
            if (value['res_rtg'] && value.res_rtg > item.limitRedLevel) {
                item.limitRedLevel = value.res_rtg;
            }
        }
        this._initHeroInfos();
        this._initEquipInfos();
        this._initTreasureInfos();
        this._initPetInfos();
        this._initSilkbagInfos();
        this._initHorseInfos();
        this._initJadeStoneInfos();
        this._initHistoryHeroInfos();
        this._initHomelandBuffInfos();
        G_SignalManager.dispatch(SignalConst.EVENT_GET_RES_PHOTO_SUCCESS);
    }
    isHeroHave(baseId, limitLevel, limitRedLevel) {
        var typeMap = this._handbookList['k' + HandBookData.HERO_TYPE] || {};
        var item = typeMap['k' + baseId];
        if (item) {
            if (limitLevel && limitLevel > 0) {
                return item.limitLevel == limitLevel;
            } else if (limitRedLevel && limitRedLevel > 0) {
                return item.limitRedLevel == limitRedLevel;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    isEquipHave(baseId) {
        var typeMap = this._handbookList['k' + HandBookData.EQUIP_TYPE] || {};
        var isHave = typeMap['k' + baseId];
        if (isHave) {
            return true;
        }
        return false;
    }
    isTreasureHave(baseId) {
        var typeMap = this._handbookList['k' + HandBookData.TREASURE_TYPE] || {};
        var isHave = typeMap['k' + baseId];
        if (isHave) {
            return true;
        }
        return false;
    }
    isPetHave(baseId) {
        var typeMap = this._handbookList['k' + HandBookData.PET_TYPE] || {};
        var isHave = typeMap['k' + baseId];
        if (isHave) {
            return true;
        }
        return false;
    }
    isSilkbagHave(baseId) {
        var typeMap = this._handbookList['k' + HandBookData.SILKBAG_TYPE] || {};
        var isHave = typeMap['k' + baseId];
        if (isHave) {
            return true;
        }
        return false;
    }
    isHorseHave(baseId) {
        var typeMap = this._handbookList['k' + HandBookData.HORSE_TYPE] || {};
        var isHave = typeMap['k' + baseId];
        if (isHave) {
            return true;
        }
        return false;
    }
    isHostoricalHeroHave(baseId) {
        var typeMap = this._handbookList['k' + HandBookData.HISTORICALHERO_TYPE] || {};
        var isHave = typeMap['k' + baseId];
        if (isHave) {
            return true;
        }
        return false;
    }
    isJadeStoneHave(baseId) {
        var typeMap = this._handbookList['k' + HandBookData.JADE_STONE_TYPE] || {};
        var isHave = typeMap['k' + baseId];
        if (isHave) {
            return true;
        }
        return false;
    }
    isHomelandBuffHave(baseId) {
        var typeMap = this._handbookList['k' + HandBookData.HOMELAND_BUFF_TYPE] || {};
        var isHave = typeMap['k' + baseId];
        if (isHave) {
            return true;
        }
        return false;
    }
    private _heroList;
    private _treasureList: Array<any>;
    private _equipList: Array<any>;
    private _silkbagList: Array<any>;
    private _horseList: Array<any>;
    private _jadeStoneList: Array<any>;
    private _jadeStoneInfos;
    private _jadeStoneOwnerCount;

    getHeroList() {
        return this._heroList;
    }
    getPetList() {
        return this._petList;
    }
    getTreasureList() {
        return this._treasureList;
    }
    getEquipList() {
        return this._equipList;
    }
    getSilkbagList() {
        return this._silkbagList;
    }
    getHorseList() {
        return this._horseList;
    }
    getJadeStoneList() {
        return this._jadeStoneList;
    }
    getHistoryHeroList() {
        return this._historyHeroList;
    }
    getHeroInfos() {
        return [
            this._heroInfos,
            this._heroOwnerCount
        ];
    }
    getTreasureInfos() {
        return [
            this._treasureInfos,
            this._treasureOwnerCount
        ];
    }
    getEquipInfos() {
        return [
            this._equipInfos,
            this._equipOwnerCount
        ];
    }
    getSilkbagInfos() {
        return [
            this._silkbagInfos,
            this._silkbagOwnerCount
        ];
    }
    getHorseInfos() {
        return [
            this._horseInfos,
            this._horseOwnerCount
        ];
    }
    getJadeInfos() {
        return [
            this._jadeStoneInfos,
            this._jadeStoneOwnerCount
        ];
    }
    getHistoryHeroInfos() {
        return [
            this._historyHeroInfos,
            this._historyOwnerCount
        ];
    }
    getHomelandBuffInfos() {
        return this._homelandBuffInfos;
    }
    getInfosByType(type) {
        if (type == HandBookHelper.TBA_HERO) {
            return this.getHeroInfos();
        }
        if (type == HandBookHelper.TBA_EQUIP) {
            return this.getEquipInfos();
        }
        if (type == HandBookHelper.TBA_TREASURE) {
            return this.getTreasureInfos();
        }
        if (type == HandBookHelper.TBA_SILKBAG) {
            return this.getSilkbagInfos();
        }
        if (type == HandBookHelper.TBA_HORSE) {
            return this.getHorseInfos();
        }
        if (type == HandBookHelper.TBA_JADE_STONE) {
            return this.getJadeInfos();
        }
        if (type == HandBookHelper.TBA_HISTORY_HERO) {
            return this.getHistoryHeroInfos();
        }
    }

    private processData(heroData, limitLevel?, limitRedLevel?): any {
        var heroCountry = heroData.country;
        var heroColor = heroData.color;
        if (heroColor != 1 && heroData.is_show == 1) {
            this._heroInfos[heroCountry] = this._heroInfos[heroCountry] || {};
            this._heroOwnerCount[heroCountry] = this._heroOwnerCount[heroCountry] || {};
            this._heroOwnerCount[heroCountry][heroColor] = this._heroOwnerCount[heroCountry][heroColor] || {};
            if (this._heroInfos[heroCountry][heroColor] == null) {
                this._heroInfos[heroCountry][heroColor] = [];
            }
            var handData = {
                cfg: heroData,
                isHave: this.isHeroHave(heroData.id, limitLevel, limitRedLevel),
                limitLevel: limitLevel,
                limitRedLevel: limitRedLevel
            };
            this._heroInfos[heroCountry][heroColor].push(handData);
            this._heroList.push(handData);
            this._heroInfos[heroCountry][heroColor].sort(function (item1, item2) {
                return item1.cfg.id - item2.cfg.id;
            });
            if (handData.isHave == true) {
                this._heroOwnerCount[heroCountry][heroColor].ownNum = this._heroOwnerCount[heroCountry][heroColor].ownNum || 0;
                this._heroOwnerCount[heroCountry][heroColor].ownNum = this._heroOwnerCount[heroCountry][heroColor].ownNum + 1;
            }
            this._heroOwnerCount[heroCountry][heroColor].totalNum = this._heroOwnerCount[heroCountry][heroColor].totalNum || 0;
            this._heroOwnerCount[heroCountry][heroColor].totalNum = this._heroOwnerCount[heroCountry][heroColor].totalNum + 1;
        }
    }
    _initHeroInfos() {
        var openServerDay = G_UserData.getBase().getOpenServerDayNum();
        var heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var limitRedShowDay = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.LIMIT_RED_SHOW_DAY).content);
        this._heroInfos = {};
        this._heroList = [];
        this._heroOwnerCount = {};
        for (var loopi = 0; loopi < heroInfo.length(); loopi++) {
            var heroData = heroInfo.indexOf(loopi);
            var showDay = heroData.show_day;
            if (openServerDay >= showDay) {
                this.processData(heroData);
                var isLimitHero = heroData.limit == 1;
                if (isLimitHero) {
                    var tempData = heroData;
                    tempData.color = 6;
                    this.processData(tempData, HeroConst.HERO_LIMIT_RED_MAX_LEVEL, 0);
                }
                var isLimitRedHero = heroData.limit_red == 1;
                if (isLimitRedHero && openServerDay >= limitRedShowDay) {
                    var tempData = clone2(heroData);
                    tempData.color = 7;
                    this.processData(tempData, 0, HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL);
                }
            }
        }
        this._heroList.sort(function (item1, item2) {
            if (item1.cfg.color != item2.cfg.color) {
                return item2.cfg.color - item1.cfg.color;
            }
            return item1.cfg.id - item2.cfg.id;
        });
        for (var i in this._heroOwnerCount) {
            var country = this._heroOwnerCount[i];
            var countryOwn = 0;
            var countryTotal = 0;
            for (var j in country) {
                var color = country[j];
                if (typeof (color) == 'object') {
                    if (color.ownNum == null) {
                        color.ownNum = 0;
                    }
                    if (color.totalNum == null) {
                        color.totalNum = 0;
                    }
                    countryOwn = countryOwn + color.ownNum;
                    countryTotal = countryTotal + color.totalNum;
                }
            }
            this._heroOwnerCount[i].ownNum = countryOwn;
            this._heroOwnerCount[i].totalNum = countryTotal;
        }
    }
    _initEquipInfos() {

        var equipInfo = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT);
        this._equipInfos = {};
        this._equipList = [];
        this._equipOwnerCount = {};
        var sortList: any = [];
        for (var loopi = 0; loopi < equipInfo.length(); loopi++) {
            var equipData = equipInfo.indexOf(loopi);
            sortList.push(equipData);
        }
        sortList.sort(function (data1, data2) {
            if (data1.potential != data2.potential) {
                return data2.potential - data1.potential;
            }
            if (data1.id != data2.id) {
                return data1.id - data2.id;
            }
        });
        for (var i in sortList) {
            var value = sortList[i];
            var equipData = value;
            var equipColor = equipData.color;
            this._equipInfos = this._equipInfos || {};
            this._equipOwnerCount = this._equipOwnerCount || {};
            this._equipOwnerCount[equipColor] = this._equipOwnerCount[equipColor] || {};
            if (this._equipInfos[equipColor] == null) {
                this._equipInfos[equipColor] = [];
            }
            var handData = {
                cfg: equipData,
                isHave: this.isEquipHave(equipData.id)
            };
            this._equipInfos[equipColor].push(handData);
            this._equipInfos[equipColor].sort(function (item1, item2) {
                return item1.cfg.id - item2.cfg.id;
            });
            this._equipList.push(handData);
            this._equipOwnerCount[equipColor].ownNum = this._equipOwnerCount[equipColor].ownNum || 0;
            if (handData.isHave == true) {
                this._equipOwnerCount[equipColor].ownNum = this._equipOwnerCount[equipColor].ownNum + 1;
            }
            this._equipOwnerCount[equipColor].totalNum = this._equipOwnerCount[equipColor].totalNum || 0;
            this._equipOwnerCount[equipColor].totalNum = this._equipOwnerCount[equipColor].totalNum + 1;
        }
        this._equipList.sort(function (item1, item2) {
            if (item1.cfg.color != item2.cfg.color) {
                return item2.cfg.color - item1.cfg.color;
            }
            return item1.cfg.id - item2.cfg.id;
        });
        var colorOwn = 0;
        var colorTotal = 0;
        for (let i in this._equipOwnerCount) {
            var colorArray = this._equipOwnerCount[i];
            if (typeof (colorArray) == 'object') {
                if (colorArray.ownNum == null) {
                    colorArray.ownNum = 0;
                }
                if (colorArray.totalNum == null) {
                    colorArray.totalNum = 0;
                }
                colorOwn = colorOwn + colorArray.ownNum;
                colorTotal = colorTotal + colorArray.totalNum;
            }
        }
        this._equipOwnerCount.ownNum = colorOwn;
        this._equipOwnerCount.totalNum = colorTotal;
    }
    _initPetInfos() {
        this._petInfos = {};
        this._petOwnerCount = {};
        this._petList = [];
        var petIdList = G_UserData.getPet().getAllPetMapId();

        var petInfo = G_ConfigLoader.getConfig(ConfigNameConst.PET);
        for (var loopi = 0; loopi < petIdList.length; loopi++) {
            var itemData = petInfo.get(petIdList[loopi]);
            var itemColor = itemData.color;
            this._petInfos = this._petInfos || {};
            this._petOwnerCount = this._petOwnerCount || {};
            if (this._petInfos[itemColor] == null) {
                this._petInfos[itemColor] = [];
            }
            var handData = {
                cfg: itemData,
                isHave: this.isPetHave(itemData.id)
            };
            this._petInfos[itemColor].push(handData);
            this._petInfos[itemColor].sort(function (item1, item2) {
                return item1.cfg.id < item2.cfg.id;
            });
            this._petList.push(handData);
        }
        var colorOwn = 0;
        var colorTotal = 0;
        for (var i in this._petOwnerCount) {
            var colorArray = this._petOwnerCount[i];
            if (typeof (colorArray) == 'object') {
                if (colorArray.ownNum == null) {
                    colorArray.ownNum = 0;
                }
                if (colorArray.totalNum == null) {
                    colorArray.totalNum = 0;
                }
                colorOwn = colorOwn + colorArray.ownNum;
                colorTotal = colorTotal + colorArray.totalNum;
            }
        }
        this._petOwnerCount.ownNum = colorOwn;
        this._petOwnerCount.totalNum = colorTotal;
    }
    _initTreasureInfos() {

        var itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE);
        var openServerDay = G_UserData.getBase().getOpenServerDayNum();
        this._treasureInfos = [];
        this._treasureOwnerCount = {};
        this._treasureList = [];
        for (var loopi = 0; loopi < itemInfo.length(); loopi++) {
            var itemData = itemInfo.indexOf(loopi);
            var showDay = itemData.show_day;
            if (openServerDay >= showDay) {
                var itemColor = itemData.color;
                this._treasureInfos = this._treasureInfos || [];
                this._treasureOwnerCount = this._treasureOwnerCount || {};
                this._treasureOwnerCount[itemColor] = this._treasureOwnerCount[itemColor] || {};
                if (this._treasureInfos[itemColor] == null) {
                    this._treasureInfos[itemColor] = [];
                }
                var handData = {
                    cfg: itemData,
                    isHave: this.isTreasureHave(itemData.id)
                };
                this._treasureInfos[itemColor].push(handData);
                this._treasureInfos[itemColor].sort(function (item1, item2) {
                    return item1.cfg.id < item2.cfg.id;
                });
                this._treasureList.push(handData);
                this._treasureOwnerCount[itemColor].ownNum = this._treasureOwnerCount[itemColor].ownNum || 0;
                if (handData.isHave == true) {
                    this._treasureOwnerCount[itemColor].ownNum = this._treasureOwnerCount[itemColor].ownNum + 1;
                }
                this._treasureOwnerCount[itemColor].totalNum = this._treasureOwnerCount[itemColor].totalNum || 0;
                this._treasureOwnerCount[itemColor].totalNum = this._treasureOwnerCount[itemColor].totalNum + 1;
            }
        }
        this._treasureList.sort(function (item1, item2) {
            if (item1.cfg.color != item2.cfg.color) {
                return item1.cfg.color - item2.cfg.color;
            }
            return item1.cfg.id - item2.cfg.id;
        });
        var colorOwn = 0;
        var colorTotal = 0;
        for (var i in this._treasureOwnerCount) {
            var colorArray = this._treasureOwnerCount[i];
            if (typeof (colorArray) == 'object') {
                if (colorArray.ownNum == null) {
                    colorArray.ownNum = 0;
                }
                if (colorArray.totalNum == null) {
                    colorArray.totalNum = 0;
                }
                colorOwn = colorOwn + colorArray.ownNum;
                colorTotal = colorTotal + colorArray.totalNum;
            }
        }
        this._treasureOwnerCount.ownNum = colorOwn;
        this._treasureOwnerCount.totalNum = colorTotal;
    }
    _initSilkbagInfos() {
        var itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.SILKBAG);
        var openServerDay = G_UserData.getBase().getOpenServerDayNum();
        this._silkbagInfos = {};
        this._silkbagOwnerCount = {};
        this._silkbagList = [];
        for (var loopi = 0; loopi < itemInfo.length(); loopi++) {
            var itemData = itemInfo.indexOf(loopi);
            var showDay = itemData.show_day;
            if (openServerDay >= showDay) {
                var itemColor = itemData.color;
                this._silkbagInfos = this._silkbagInfos || {};
                this._silkbagOwnerCount = this._silkbagOwnerCount || {};
                this._silkbagOwnerCount[itemColor] = this._silkbagOwnerCount[itemColor] || {};
                if (this._silkbagInfos[itemColor] == null) {
                    this._silkbagInfos[itemColor] = [];
                }
                var handData = {
                    cfg: itemData,
                    isHave: this.isSilkbagHave(itemData.id)
                };
                this._silkbagInfos[itemColor].push(handData);
                this._silkbagInfos[itemColor].sort(function (item1, item2) {
                    if (item1.cfg.order != item2.cfg.order) {
                        return item1.cfg.order - item2.cfg.order;
                    } else {
                        return item1.cfg.id - item2.cfg.id;
                    }
                });
                this._silkbagList.push(handData);
                this._silkbagOwnerCount[itemColor].ownNum = this._silkbagOwnerCount[itemColor].ownNum || 0;
                if (handData.isHave == true) {
                    this._silkbagOwnerCount[itemColor].ownNum = this._silkbagOwnerCount[itemColor].ownNum + 1;
                }
                this._silkbagOwnerCount[itemColor].totalNum = this._silkbagOwnerCount[itemColor].totalNum || 0;
                this._silkbagOwnerCount[itemColor].totalNum = this._silkbagOwnerCount[itemColor].totalNum + 1;
            }
        }
        this._silkbagList.sort(function (item1, item2) {
            if (item1.cfg.color != item2.cfg.color) {
                return item2.cfg.color - item1.cfg.color;
            } else if (item1.cfg.order != item2.cfg.order) {
                return item1.cfg.order - item2.cfg.order;
            }
            return item1.cfg.id - item2.cfg.id;
        });
        var colorOwn = 0;
        var colorTotal = 0;
        for (var i in this._silkbagOwnerCount) {
            var colorArray = this._silkbagOwnerCount[i];
            if (typeof (colorArray) == 'object') {
                if (colorArray.ownNum == null) {
                    colorArray.ownNum = 0;
                }
                if (colorArray.totalNum == null) {
                    colorArray.totalNum = 0;
                }
                colorOwn = colorOwn + colorArray.ownNum;
                colorTotal = colorTotal + colorArray.totalNum;
            }
        }
        this._silkbagOwnerCount.ownNum = colorOwn;
        this._silkbagOwnerCount.totalNum = colorTotal;
    }
    _initHorseInfos() {

        var itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.HORSE);
        var openServerDay = G_UserData.getBase().getOpenServerDayNum();
        this._horseInfos = {};
        this._horseOwnerCount = {};
        this._horseList = [];
        for (var loopi = 0; loopi < itemInfo.length(); loopi++) {
            var itemData = itemInfo.indexOf(loopi);
            var showDay = itemData.show_day;
            if (openServerDay >= showDay) {
                var itemColor = itemData.color;
                this._horseInfos = this._horseInfos || {};
                this._horseOwnerCount = this._horseOwnerCount || {};
                this._horseOwnerCount[itemColor] = this._horseOwnerCount[itemColor] || {};
                if (this._horseInfos[itemColor] == null) {
                    this._horseInfos[itemColor] = [];
                }
                var handData = {
                    cfg: itemData,
                    isHave: this.isHorseHave(itemData.id)
                };
                this._horseInfos[itemColor].push(handData);
                this._horseInfos[itemColor].sort(function (item1, item2) {
                    return item1.cfg.id - item2.cfg.id;
                });
                this._horseList.push(handData);
                this._horseOwnerCount[itemColor].ownNum = this._horseOwnerCount[itemColor].ownNum || 0;
                if (handData.isHave == true) {
                    this._horseOwnerCount[itemColor].ownNum = this._horseOwnerCount[itemColor].ownNum + 1;
                }
                this._horseOwnerCount[itemColor].totalNum = this._horseOwnerCount[itemColor].totalNum || 0;
                this._horseOwnerCount[itemColor].totalNum = this._horseOwnerCount[itemColor].totalNum + 1;
            }
        }
        this._horseList.sort(function (item1, item2) {
            if (item1.cfg.color != item2.cfg.color) {
                return item2.cfg.color - item1.cfg.color;
            }
            return item1.cfg.id - item2.cfg.id;
        });
        var colorOwn = 0;
        var colorTotal = 0;
        for (var i in this._horseOwnerCount) {
            var colorArray = this._horseOwnerCount[i];
            if (typeof (colorArray) == 'object') {
                if (colorArray.ownNum == null) {
                    colorArray.ownNum = 0;
                }
                if (colorArray.totalNum == null) {
                    colorArray.totalNum = 0;
                }
                colorOwn = colorOwn + colorArray.ownNum;
                colorTotal = colorTotal + colorArray.totalNum;
            }
        }
        this._horseOwnerCount.ownNum = colorOwn;
        this._horseOwnerCount.totalNum = colorTotal;
    }
    _initJadeStoneInfos() {

        var itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.JADE);
        this._jadeStoneInfos = {};
        this._jadeStoneOwnerCount = {};
        this._jadeStoneList = [];
        for (var loopi = 0; loopi < itemInfo.length(); loopi++) {
            var itemData = itemInfo.indexOf(loopi);
            var equipmentType: any = 0;
            if (itemData.equipment_type > 0) {
                equipmentType = itemData.equipment_type;
            } else if (itemData.treasure_type > 0) {
                equipmentType = itemData.treasure_type + HandBookData.EQUIP_JADE_TYPE_COUNT;
            }
            var itemColor = itemData.color;
            this._jadeStoneInfos = this._jadeStoneInfos || {};
            this._jadeStoneInfos[equipmentType] = this._jadeStoneInfos[equipmentType] || {};
            this._jadeStoneInfos[equipmentType][itemColor] = this._jadeStoneInfos[equipmentType][itemColor] || [];
            this._jadeStoneOwnerCount = this._jadeStoneOwnerCount || {};
            this._jadeStoneOwnerCount[equipmentType] = this._jadeStoneOwnerCount[equipmentType] || {};
            this._jadeStoneOwnerCount[equipmentType][itemColor] = this._jadeStoneOwnerCount[equipmentType][itemColor] || {};
            var handData = {
                cfg: itemData,
                isHave: this.isJadeStoneHave(itemData.id)
            };
            this._jadeStoneInfos[equipmentType][itemColor].push(handData);
            this._jadeStoneInfos[equipmentType][itemColor].sort(function (item1, item2) {
                return item1.cfg.sort > item2.cfg.sort;
            });
            this._jadeStoneList.push(handData);
            this._jadeStoneOwnerCount[equipmentType][itemColor].ownNum = this._jadeStoneOwnerCount[equipmentType][itemColor].ownNum || 0;
            if (handData.isHave == true) {
                this._jadeStoneOwnerCount[equipmentType][itemColor].ownNum = this._jadeStoneOwnerCount[equipmentType][itemColor].ownNum + 1;
            }
            this._jadeStoneOwnerCount[equipmentType][itemColor].totalNum = this._jadeStoneOwnerCount[equipmentType][itemColor].totalNum || 0;
            this._jadeStoneOwnerCount[equipmentType][itemColor].totalNum = this._jadeStoneOwnerCount[equipmentType][itemColor].totalNum + 1;
        }
        this._jadeStoneList.sort(function (item1, item2) {
            if (item1.cfg.color != item2.cfg.color) {
                return item1.cfg.color - item2.cfg.color;
            }
            return item2.cfg.sort - item1.cfg.sort;
        });
        for (var i in this._jadeStoneOwnerCount) {
            equipmentType = this._jadeStoneOwnerCount[i];
            var equipmentTypeOwn = 0;
            var equipmentTypeTotal = 0;
            for (var j in equipmentType) {
                var color = equipmentType[j];
                if (typeof (color) == 'object') {
                    if (color.ownNum == null) {
                        color.ownNum = 0;
                    }
                    if (color.totalNum == null) {
                        color.totalNum = 0;
                    }
                    equipmentTypeOwn = equipmentTypeOwn + color.ownNum;
                    equipmentTypeTotal = equipmentTypeTotal + color.totalNum;
                }
            }
            this._jadeStoneOwnerCount[i].ownNum = equipmentTypeOwn;
            this._jadeStoneOwnerCount[i].totalNum = equipmentTypeTotal;
        }
    }

    _initHistoryHeroInfos() {
        var itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO);
        this._historyHeroInfos = [];
        this._historyOwnerCount = {};
        this._historyHeroList = [];
        for (var loopi = 0; loopi < itemInfo.length(); loopi++) {
            var itemData = itemInfo.indexOf(loopi);
            var itemColor = itemData.color;
            var isOpen = itemData.is_open;
            if (isOpen == 1) {
                this._historyHeroInfos = this._historyHeroInfos || [];
                this._historyHeroInfos[itemColor] = this._historyHeroInfos[itemColor] || [];
                this._historyOwnerCount = this._historyOwnerCount || {};
                this._historyOwnerCount[itemColor] = this._historyOwnerCount[itemColor] || {};
                var handData = {
                    cfg: itemData,
                    isHave: this.isHostoricalHeroHave(itemData.id)
                };
                this._historyHeroInfos[itemColor].push(handData);
                this._historyHeroInfos[itemColor].sort((item1, item2) => {
                    return item1.cfg.id - item2.cfg.id;
                });
                this._historyHeroList.push(handData);
                this._historyOwnerCount[itemColor].ownNum = this._historyOwnerCount[itemColor].ownNum || 0;
                if (handData.isHave == true) {
                    this._historyOwnerCount[itemColor].ownNum = this._historyOwnerCount[itemColor].ownNum + 1;
                }
                this._historyOwnerCount[itemColor].totalNum = this._historyOwnerCount[itemColor].totalNum || 0;
                this._historyOwnerCount[itemColor].totalNum = this._historyOwnerCount[itemColor].totalNum + 1;
            }
        }
        this._historyHeroList.sort(function (item1, item2) {
            if (item1.cfg.color != item2.cfg.color) {
                return item2.cfg.color - item1.cfg.color;
            }
            return item1.cfg.id - item2.cfg.id;
        });
        var colorOwn = 0;
        var colorTotal = 0;
        for (var i in this._historyOwnerCount) {
            var color = this._historyOwnerCount[i];
            if (typeof (color) == 'object') {
                if (color.ownNum == null) {
                    color.ownNum = 0;
                }
                if (color.totalNum == null) {
                    color.totalNum = 0;
                }
                colorOwn = colorOwn + color.ownNum;
                colorTotal = colorTotal + color.totalNum;
            }
        }
        this._historyOwnerCount.ownNum = colorOwn;
        this._historyOwnerCount.totalNum = colorTotal;
    }

    _initHomelandBuffInfos() {
        var Config = G_ConfigLoader.getConfig(ConfigNameConst.TREE_BUFF);
        this._homelandBuffInfos = [];
        for (var loopi = 0; loopi < Config.length(); loopi++) {
            var info = Config.indexOf(loopi);
            if (info.enable == 1) {
                var isHave = this.isHomelandBuffHave(info.id);
                this._homelandBuffInfos.push({
                    cfg: info,
                    isHave: isHave
                });
            }
        }
        this._homelandBuffInfos.sort(function (item1, item2) {
            if (item1.cfg.color != item2.cfg.color) {
                return item2.cfg.color - item1.cfg.color;
            } else {
                return item1.cfg.id - item2.cfg.id;
            }
        });
    }
} 