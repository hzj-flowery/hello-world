import { G_ServerTime, G_ConfigLoader, G_UserData } from "../init";
import { BaseData } from "./BaseData";
import { QinTombConst } from "../const/QinTombConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { QinTombHelper } from "../scene/view/qinTomb/QinTombHelper";

export interface QinTombMonsterData {
    getPoint_id(): number
    setPoint_id(value: number): void
    getLastPoint_id(): number
    getMonster_type(): number
    setMonster_type(value: number): void
    getLastMonster_type(): number
    getBegin_time(): number
    setBegin_time(value: number): void
    getLastBegin_time(): number
    getLeft_time(): number
    setLeft_time(value: number): void
    getLastLeft_time(): number
    getOwn_team_id(): number
    setOwn_team_id(value: number): void
    getLastOwn_team_id(): number
    getBattle_team_id(): number
    setBattle_team_id(value: number): void
    getLastBattle_team_id(): number
    getStop_time(): number
    setStop_time(value: number): void
    getLastStop_time(): number
    getReborn_time(): number
    setReborn_time(value: number): void
    getLastReborn_time(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    getBaseId(): number
    setBaseId(value: number): void
    getLastBaseId(): number
    getColor(): number
    setColor(value: number): void
    getLastColor(): number
    getSpeed(): number
    setSpeed(value: number): void
    getLastSpeed(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
}
let schema = {};
schema['point_id'] = [
    'number',
    0
];
schema['monster_type'] = [
    'number',
    0
];
schema['begin_time'] = [
    'number',
    0
];
schema['left_time'] = [
    'number',
    0
];
schema['own_team_id'] = [
    'number',
    0
];
schema['battle_team_id'] = [
    'number',
    0
];
schema['stop_time'] = [
    'number',
    0
];
schema['reborn_time'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
schema['baseId'] = [
    'number',
    0
];
schema['color'] = [
    'number',
    0
];
schema['speed'] = [
    'number',
    1
];
schema['name'] = [
    'string',
    ''
];
export class QinTombMonsterData extends BaseData {

    public static schema = schema;

    _position: cc.Vec2;
    _pkPos: cc.Vec2[];
    _hookPos: cc.Vec2[];

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public getCurrState() {
        if (this.getRebornTime() > 0) {
            let rebornTime = this.getRebornTime();
            let curTime = G_ServerTime.getTime();
            if (rebornTime > 0 && curTime <= rebornTime) {
                return QinTombConst.MONSTER_STATE_DEATH;
            }
        }
        if (this.getBattle_team_id() > 0) {
            return QinTombConst.MONSTER_STATE_PK;
        }
        if (this.getOwn_team_id() > 0) {
            return QinTombConst.MONSTER_STATE_HOOK;
        }
        return QinTombConst.MONSTER_STATE_IDLE;
    }
    public syncData(serverData) {
        let point_id = serverData['point_id'] || null;
        console.assert(point_id, 'point_id can not be nil');
        this.setPoint_id(point_id);
        let monster_type = serverData['monster_type'] || 0;
        this.setMonster_type(monster_type);
        let begin_time = serverData['begin_time'] || 0;
        this.setBegin_time(begin_time);
        let left_time = serverData['left_time'] || 0;
        this.setLeft_time(left_time);
        let stop_time = serverData['stop_time'] || 0;
        this.setStop_time(stop_time);
        let reborn_time = serverData['reborn_time'] || 0;
        // console.log("syncData reborn_time",new Date(reborn_time * 1000).toString());
        if (reborn_time > 0) {
            this.setReborn_time(reborn_time + 1);
        } else {
            this.setReborn_time(0);
        }
        let speed = serverData['speed'] || 1;
        this.setSpeed(speed);
        let oldTeamId = this.getOwn_team_id();
        let own_team_id = serverData['own_team_id'] || 0;
        this.setOwn_team_id(own_team_id);
        let oldBattleId = this.getBattle_team_id();
        let battle_team_id = serverData['battle_team_id'] || 0;
        this.setBattle_team_id(battle_team_id);
        let cfg = this._findMonsterCfg(this.getPoint_id());
        this.setConfig(cfg);
        this._updateMonster();
        this._updatePosition();
        let retTable = {
            oldTeamId: oldTeamId,
            oldBattleId: oldBattleId,
            newTeamId: this.getOwn_team_id(),
            newBattleId: this.getBattle_team_id()
        };
        return retTable;
    }
    public updateData(serverData) {
        this.syncData(serverData);
    }
    public getAttackActionTime() {
        let config = this.getConfig();
        if (this.getMonster_type() == 1) {
            return config.small_time / 1000;
        }
        return config.big_time / 1000;
    }
    public getDieActionTime() {
        let config = this.getConfig();
        if (this.getMonster_type() == 1) {
            return config.small_die / 1000;
        }
        return config.big_die / 1000;
    }
    public _findMonsterCfg(pointId) {
        let qin_monster = G_ConfigLoader.getConfig(ConfigNameConst.QIN_MONSTER);
        for (let i = 0; i < qin_monster.length(); i++) {
            let cfg = qin_monster.indexOf(i);
            if (cfg.point_id_2 == pointId) {
                return cfg;
            }
        }
        console.assert(false, 'can not find monster by id [%d]');
        return null;
    }
    public _updateMonster() {
        let config = this.getConfig();
        if (this.getMonster_type() == 1) {
            let heroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
            let baseId = 0;
            if (heroRes.get(config.small_image)) {
                baseId = heroRes.get(config.small_image).fight_res;
            }
            let color = config.small_color;
            let name = config.small_name;
            this.setBaseId(baseId);
            this.setColor(color);
            this.setName(name);
        } else {
            let baseId = config.big_image;
            let color = config.big_color;
            let name = config.big_name;
            this.setBaseId(baseId);
            this.setColor(color);
            this.setName(name);
        }
    }
    public getPosition() {
        let pos = cc.v2(this._position.x, this._position.y);
        return pos;
    }
    public getHookPosition(index: number, useGlobal) {
        let dir = 1;
        if (index == 2) {
            dir = -1;
        }
        if (useGlobal == null) {
            return [
                this._hookPos[index],
                dir
            ];
        }
        let pos = cc.v2(this._position.x, this._position.y);
        let global = this._hookPos[index].add(pos);
        return [
            global,
            dir
        ];
    }
    public getPkPosition(index, useGlobal) {
        let dir = 1;
        if (index == 2) {
            dir = -1;
        }
        if (useGlobal == null) {
            return [
                this._pkPos[index],
                dir
            ];
        }
        let pos = cc.v2(this._position.x, this._position.y);
        let global = this._pkPos[index].add(pos);
        return [
            global,
            dir
        ];
    }
    public _updatePosition() {
        let cfg = this.getConfig();
        let [posValue] = QinTombHelper.getMidPoint(cfg.point_id_1);
        let pos = cc.v2(posValue.x, posValue.y);
        this._position = pos;
        this._hookPos = [];
        this._pkPos = [];
        for (let i = 0; i < 3; i++) {
            let posHook = QinTombHelper.getOffsetPoint(cfg.point_id_3, i);
            let posPK = QinTombHelper.getOffsetPoint(cfg.point_id_4, i);
            this._hookPos.push(posHook);
            this._pkPos.push(posPK);
        }
    }
    public getMonumentPKPos(index, useGlobal) {
        let cfg = this.getConfig();
        let posPK = QinTombHelper.getOffsetPointRange(cfg.point_id_4, index);
        if (useGlobal == null) {
            return posPK;
        }
        let pos = cc.v2(this._position.x, this._position.y);
        return posPK.add(pos);
    }
    public getMonumentHookPos(index, useGlobal) {
        let cfg = this.getConfig();
        let hookPos = QinTombHelper.getOffsetPointRange(cfg.point_id_3, index);
        if (useGlobal == null) {
            return hookPos;
        }
        let pos = cc.v2(this._position.x, this._position.y);
        return pos.add(hookPos);
    }
    public getMaxHookTime() {
        if (this.getMonster_type() == 2) {
            return QinTombHelper.getQinInfo('one_big_time');
        }
        return QinTombHelper.getQinInfo('one_small_time');
    }
    public getHookLeftTime() {
        //ERROR:
        let currTime = G_ServerTime.getTime();
        let leftTime = this.getBegin_time() - currTime + this.getLeft_time();
        return leftTime;
    }
    public updateHPTime() {
    }
    public getDieTime() {
        let speed = 1;
        if (this.getSpeed() > 0) {
            speed = this.getSpeed();
        }
        let maxTime = this.getMaxHookTime();
        if (this.getStop_time() > 0) {
            return [
                this.getLeft_time(),
                maxTime
            ];
        } else {
            let currTime = G_ServerTime.getTime();
            let leftTime = currTime - this.getBegin_time();
            let realLeftTime = this.getLeft_time() - leftTime * speed;
            if (realLeftTime < 0) {
                realLeftTime = 0;
            }
            return [
                realLeftTime,
                maxTime
            ];
        }
    }
    public getRebornTime() {
        // let currTime = G_ServerTime.getTime();
        // let refreshTime = QinTombHelper.getQinInfo('refresh_time');
        // let deathTime = this.getDieTime(), maxTime;
        if (this.getReborn_time() > 0) {
            return this.getReborn_time();
        }
        return 0;
    }
    public getMonumentList() {
        let pointId = this.getPoint_id();
        let retList = G_UserData.getQinTomb().getMonumentList(pointId);
        return retList;
    }
}
