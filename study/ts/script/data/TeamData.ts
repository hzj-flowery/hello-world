import { BaseData } from "./BaseData";
import { MessageIDConst } from "../const/MessageIDConst";
import { G_NetworkManager, G_UserData, G_SignalManager } from "../init";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import TeamConst from "../const/TeamConst";
import { handler } from "../utils/handler";
import { FunctionConst } from "../const/FunctionConst";
import { FunctionCheck } from "../utils/logic/FunctionCheck";

let schema = {};
schema['heroIds'] = [
    'object',
    {}
];
schema['petIds'] = [
    'object',
    {}
];
schema['embattle'] = [
    'object',
    {}
];
schema['secondHeroIds'] = [
    'object',
    {}
];
schema['curPos'] = [
    'number',
    0
];
export interface TeamData {
    getHeroIds(): number[]
    setHeroIds(value: number[]): void
    getLastHeroIds(): number[]
    getPetIds(): number[]
    setPetIds(value: number[]): void
    getLastPetIds(): number[]
    getEmbattle(): Object
    setEmbattle(value: Object): void
    getLastEmbattle(): Object
    getSecondHeroIds(): Object
    setSecondHeroIds(value: Object): void
    getLastSecondHeroIds(): Object
    getCurPos(): number
    setCurPos(value: number): void
    getLastCurPos(): number
}

export class TeamData extends BaseData {
    public static schema = schema;
    constructor() {
        super()
        this._recvGetFormation = G_NetworkManager.add(MessageIDConst.ID_S2C_GetFormation, this._s2cGetFormation.bind(this));
        this._recvGetPetFormation = G_NetworkManager.add(MessageIDConst.ID_S2C_GetPetFormation, this._s2cGetPetFormation.bind(this));
        this._recvChangeEmbattle = G_NetworkManager.add(MessageIDConst.ID_S2C_ChangeEmbattle, this._s2cChangeEmbattle.bind(this));
        this._recvChangeHeroFormation = G_NetworkManager.add(MessageIDConst.ID_S2C_ChangeHeroFormation, this._s2cChangeHeroFormation.bind(this));
        this._recvChangeHeroSecondFormation = G_NetworkManager.add(MessageIDConst.ID_S2C_ChangeHeroSecondFormation, this._s2cChangeHeroSecondFormation.bind(this));
    }

    private _recvGetFormation;
    private _recvGetPetFormation;
    private _recvChangeEmbattle;
    private _recvChangeHeroFormation;
    private _recvChangeHeroSecondFormation;

    public clear() {
        this._recvGetPetFormation.remove();
        this._recvGetPetFormation = null;
        this._recvGetFormation.remove();
        this._recvGetFormation = null;
        this._recvChangeEmbattle.remove();
        this._recvChangeEmbattle = null;
        this._recvChangeHeroFormation.remove();
        this._recvChangeHeroFormation = null;
        this._recvChangeHeroSecondFormation.remove();
        this._recvChangeHeroSecondFormation = null;
    }

    public reset() {
    }
    public _s2cGetPetFormation(id, message): void {
        var petIds = message.pet_ids || {};
        this.setPetIds(petIds);
    }
    public _s2cGetFormation(id, message): void {
        var heroIds = message.hero_ids || {};
        this.setHeroIds(heroIds);
        var embattle = message['embattle'] || {};
        this.setEmbattle(embattle);
        var secondHeroIds = message['second_hero_ids'] || {};
        this.setSecondHeroIds(secondHeroIds);
    }
    //获取上阵的神兽Id列表,无空位置
    public getPetIdsInHelp(): any {
        var result: any = [];
        var petIds = this.getPetIds();
        for (var i in petIds) {
            var id = petIds[i];
            if (id > 0) {
                result.push(id);
            }
        }
        return result;
    }
    //获取上阵的神兽Id列表, 有空位置
    public getPetIdsInHelpWithZero() {
        var result: any = [];
        var petIds = this.getPetIds();
        for (var i in petIds) {
            var id = petIds[i];
            result.push(id);
        }
        return result;
    }
    //获取上阵的神兽Id列表
    public getPetIdsInBattle() {
        var result: any = [];
        var id = G_UserData.getBase().getOn_team_pet_id();
        if (id && id > 0) {
            result.push(id);
        }
        return result;
    }
    //获取上阵的武将Id列表
    public getHeroIdsInBattle() {
        var result = [];
        var heroIds = this.getHeroIds();
        for (var i in heroIds) {
            var id = heroIds[i];
            if (id > 0) {
                result.push(id);
            }
        }
        return result;
    }
    //获取上阵的武将baseId列表
    public getHeroBaseIdsInBattle() {
        var result: any = [];
        var heroIds = this.getHeroIds();
        for (var i in heroIds) {
            var id = heroIds[i];
            if (id > 0) {
                var unit = G_UserData.getHero().getUnitDataWithId(id);
                result.push(unit.getBase_id());
            }
        }
        return result;
    }
    //获取上阵的武将数量
    public getHeroCountInBattle() {
        var count = 0;
        var heroIds = this.getHeroIds();
        for (var i in heroIds) {
            var id = heroIds[i];
            if (id > 0) {
                count = count + 1;
            }
        }
        return count;
    }
    //根据阵位索引获取神兽状态
    public getPetStateWithPos(pos) {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst['FUNC_PET_HELP_SLOT' + pos])[0];
        var petIds = this.getPetIds();
        if (petIds[pos - 1] == null) {
            return TeamConst.STATE_LOCK;
        }
        var isPet = petIds[pos - 1] > 0;
        var state = TeamConst.STATE_LOCK;
        if (isOpen) {
            if (isPet) {
                state = TeamConst.STATE_HERO;
            } else {
                state = TeamConst.STATE_OPEN;
            }
        } else {
            state = TeamConst.STATE_LOCK;
        }
        return state;
    }
    //根据阵位索引获取状态
    public getStateWithPos(pos) {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst['FUNC_TEAM_SLOT' + pos])[0];
        var heroIds = this.getHeroIds();
        var isHero = heroIds[pos - 1] > 0;
        var state = TeamConst.STATE_LOCK;
        if (isOpen) {
            if (isHero) {
                state = TeamConst.STATE_HERO;
            } else {
                state = TeamConst.STATE_OPEN;
            }
        } else {
            state = TeamConst.STATE_LOCK;
        }
        return state;
    }
    public getPetState(): Array<any> {
        var [isOpen, funcLevelInfo, comment] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_PET_HOME);
        var petId = G_UserData.getBase().getOn_team_pet_id();
        var isPet = petId > 0;
        var state = TeamConst.STATE_LOCK;
        if (isOpen) {
            if (isPet) {
                state = TeamConst.STATE_HERO;
            } else {
                state = TeamConst.STATE_OPEN;
            }
        } else {
            state = TeamConst.STATE_LOCK;
        }
        return [
            state,
            funcLevelInfo
        ];
    }
    //根据护佑索引获取神兽Id
    public getPetIdWithPos(pos) {
        var petIds = this.getPetIds();
        var petId = petIds[pos];
        if (!petId)
            alert("TeamData:getHeroIdWithPos is Wrong, pos = %d" + pos);
        return petId;
    }
    //根据阵位索引获取武将Id
    public getHeroIdWithPos(pos) {
        var heroIds = this.getHeroIds();
        var heroId = heroIds[pos - 1];
        if (typeof heroId != 'number')
            cc.error("TeamData:getHeroIdWithPos is Wrong, pos" + pos);

        return heroId;
    }
    //根据援军位索引获取武将id
    //下标位置0
    public getHeroIdInReinforcementsWithPos(pos) {
        var heroIds = this.getSecondHeroIds();
        var heroId = heroIds[pos - 1];
        if (!heroId)
            alert("TeamData:getHeroIdInReinforcementsWithPos is Wrong, pos" + pos);
        return heroId;
    }
    //根据神兽静态Id判断是否出战状态
    public isInBattleWithPetBaseId(petBaseId) {
        var petIdList = this.getPetIdsInBattle();
        for (var i in petIdList) {
            var petId = petIdList[i];
            if (petId > 0) {
                var petUnit = G_UserData.getPet().getUnitDataWithId(petId);
                var baseId = petUnit.getBase_id();
                if (baseId == petBaseId) {
                    return true;
                }
            }
        }
        return false;
    }
    //根据神兽静态Id判断是否出护佑态
    public isInHelpWithPetBaseId(petBaseId) {
        var petIdList = this.getPetIdsInHelp();
        for (var i in petIdList) {
            var petId = petIdList[i];
            if (petId > 0) {
                var petUnit = G_UserData.getPet().getUnitDataWithId(petId);
                var baseId = petUnit.getBase_id();
                if (baseId == petBaseId) {
                    return true;
                }
            }
        }
        return false;
    }
    //根据武将静态Id判断是否出战状态
    public isInBattleWithBaseId(baseId) {
        var heroIds = this.getHeroIds();
        for (var i in heroIds) {
            var heroId = heroIds[i];
            if (heroId > 0) {
                var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var heroBaseId = heroUnitData.getBase_id();
                if (heroBaseId == baseId) {
                    return true;
                }
            }
        }
        return false;
    }
    //根据武将静态Id判断是否援军位上
    public isInReinforcementsWithBaseId(baseId): boolean {
        var heroIds = this.getSecondHeroIds();
        for (var i in heroIds) {
            var heroId = heroIds[i];
            if (heroId > 0) {
                var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var heroBaseId = heroUnitData.getBase_id();
                if (heroBaseId == baseId) {
                    return true;
                }
            }
        }
        return false;
    }
    public isHaveSamePet(baseId, filterId?): boolean {
        function isHave(id, petIds) {
            for (var i in petIds) {
                var petId = petIds[i];
                if (petId > 0) {
                    var petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
                    var baseId = petUnitData.getBase_id();
                    var config = petUnitData.getConfig();
                    if (baseId == id && config.potential_before == id && config.potential_after == id) {
                        return true;
                    }
                }
            }
            return false;
        }
        if (filterId && filterId == baseId) {
            cc.warn("TeamData:isHaveSamePet false");
            return false;
        }
        var petIdsInBattle = this.getPetIdsInBattle();
        var petIdsInHelp = this.getPetIdsInHelp();
        return isHave(baseId, petIdsInHelp) || isHave(baseId, petIdsInBattle);
    }
    //判断上阵位和援军位中的武将是否有和baseId相同的武将
    //filterId：需要排除的Id，即需要判断的baseId=filterId，则认为是没有相同的武将
    public isHaveSameName(baseId, filterId?): boolean {
        function isHave(id, heroIds) {
            for (var i in heroIds) {
                var heroId = heroIds[i];
                if (heroId > 0) {
                    var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                    var heroBaseId = heroUnitData.getBase_id();
                    if (heroBaseId == id) {
                        return true;
                    }
                }
            }
            return false;
        }
        if (filterId && filterId == baseId) {
            return false;
        }
        var heroIds = this.getHeroIds();
        var secondHeroIds = this.getSecondHeroIds();
        return isHave(baseId, heroIds) || isHave(baseId, secondHeroIds);
    }

    public getHeroDataInBattle() {
        var result: any = [];
        var heroIds = this.getHeroIds();
        for (var i in heroIds) {
            var heroId = heroIds[i];
            if (heroId > 0) {
                var data = G_UserData.getHero().getUnitDataWithId(heroId);
                result.push(data);
            }
        }
        return result;
    }
    public getPetDataInBattle() {
        var result: any = [];
        var petIds = this.getPetIds();
        for (var i in petIds) {
            var petId = petIds[i];
            if (petId > 0) {
                var data = G_UserData.getPet().getUnitDataWithId(petId);
                result.push(data);
            }
        }
        return result;
    }
    public getHeroDataInReinforcements() {
        var result = {};
        var heroIds = this.getSecondHeroIds();
        for (var i in heroIds) {
            var heroId = heroIds[i];
            if (heroId > 0) {
                var data = G_UserData.getHero().getUnitDataWithId(heroId);
                result[parseInt(i) + 1] = data;
            }
        }
        return result;
    }

    //=========================协议部分=============================================
    private _backupEmbattle;
    //布阵
    public c2sChangeEmbattle(data) {
        this._backupEmbattle = data;
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeEmbattle, { positions: data });
    }
    public _s2cChangeEmbattle(id, message) {
        if (message.ret == MessageErrorConst.RET_OK) {
            this.setEmbattle(this._backupEmbattle);
        }
    }
    //阵容更换
    public c2sChangeHeroFormation(pos, heroId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeHeroFormation, {
            pos: pos,
            hero_id: heroId
        });
    }
    public _s2cChangeHeroFormation(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_UserData.getHero().setSortDataDirty(true);
        var pos = message['pos'];
        var heroId = message['hero_id'];
        var oldHeroId = message['old_hero_id'];
        G_SignalManager.dispatch(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, pos, oldHeroId);
    }
    //援军更换
    public c2sChangeHeroSecondFormaion(pos, heroId) {
        if (heroId) {
            G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeHeroSecondFormation, {
                pos: pos,
                hero_id: heroId
            });
        } else {
            G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeHeroSecondFormation, { pos: pos });
        }
    }
    public _s2cChangeHeroSecondFormation(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_UserData.getHero().setSortDataDirty(true);
        var pos = message['pos'];
        var heroId = message['hero_id'];
        var oldHeroId = message['old_hero_id'];
        var secondHeroIds = this.getSecondHeroIds();
        if (heroId && heroId > 0) {
            secondHeroIds[pos - 1] = heroId;
        } else {
            secondHeroIds[pos - 1] = 0;
        }
        this.setSecondHeroIds(secondHeroIds);
        G_SignalManager.dispatch(SignalConst.EVENT_CHANGE_HERO_SECOND_FORMATION, heroId, oldHeroId);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TEAM);
    }
}