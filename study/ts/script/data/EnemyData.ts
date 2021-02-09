import { BaseData } from "./BaseData";
import { MessageIDConst } from "../const/MessageIDConst";
import { G_NetworkManager, G_SignalManager } from "../init";
import { SignalConst } from "../const/SignalConst";
import { ArraySort } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { EnemyUnitData } from "./EnemyUnitData";
import { EnemyBattleReportUnitData } from "./EnemyBattleReportUnitData";

export interface EnemyData {
}
let schema = {};
export class EnemyData extends BaseData {
    public static schema = schema;

        _signalRecvDelEnemy;
        _signalRecvGetEnemyList;
        _signalRecvEnemyRespond;
        _signalRecvEnemyBattle;
        _signalRecvCommonGetReport;
        _signalCleanData;
        _enemysList;
        _enmeysData;
        _isNeedRecord;
    constructor(properties?) {
        super(properties);
        this._signalRecvDelEnemy = G_NetworkManager.add(MessageIDConst.ID_S2C_DelEnemy, this._s2cDelEnemy.bind(this));
        this._signalRecvGetEnemyList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetEnemyList, this._s2cGetEnemyList.bind(this));
        this._signalRecvEnemyRespond = G_NetworkManager.add(MessageIDConst.ID_S2C_EnemyRespond, this._s2cEnemyRespond.bind(this));
        this._signalRecvEnemyBattle = G_NetworkManager.add(MessageIDConst.ID_S2C_EnemyBattle, this._s2cEnemyBattle.bind(this));
        this._signalRecvCommonGetReport = G_NetworkManager.add(MessageIDConst.ID_S2C_CommonGetReport, this._s2cCommonGetReport.bind(this));
        this._signalCleanData = G_SignalManager.add(SignalConst.EVENT_CLEAN_DATA_CLOCK, this._eventCleanData.bind(this));
        this._enemysList = {};
        this._enmeysData = null;
        this._isNeedRecord = null;
    }
    public clear() {
        this._signalRecvDelEnemy.remove();
        this._signalRecvDelEnemy = null;
        this._signalRecvGetEnemyList.remove();
        this._signalRecvGetEnemyList = null;
        this._signalRecvEnemyRespond.remove();
        this._signalRecvEnemyRespond = null;
        this._signalRecvEnemyBattle.remove();
        this._signalRecvEnemyBattle = null;
        this._signalRecvCommonGetReport.remove();
        this._signalRecvCommonGetReport = null;
        this._signalCleanData.remove();
        this._signalCleanData = null;
    }
    public reset() {
        this._enemysList = {};
        this._enmeysData = null;
        this._isNeedRecord = null;
    }
    public isUserIdInEnemysList(userID) {
        return this._enemysList[userID];
    }
    public requestEnemysData(isForce?) {
        this._isNeedRecord = true;
        if (this._enmeysData) {
            if (isForce) {
                this.c2sGetEnemyList();
            }
        }
        this.c2sGetEnemyList();
    }
    public cleanDatas() {
        this._enmeysData = null;
        this._isNeedRecord = null;
    }
    public getEnemysData() {
        if (this._enmeysData) {
            return this._enmeysData.enemys;
        }
        return [];
    }
    public getCount() {
        if (this._enmeysData) {
            return this._enmeysData.count;
        }
        return 0;
    }
    public _recordEnemys(datas) {
        if (this._isNeedRecord) {
            this._enmeysData = datas;
            this._sortEnemysData();
        }
    }
    public _sortEnemysData() {
        if (this._enmeysData) {
            ArraySort(this._enmeysData.enemys, function (a, b) {
                return a.getEnemy_value() > b.getEnemy_value();
            });
        }
    }
    public _deleteEnemysData(uid) {
        if (this._enmeysData) {
            for (let k = 0; k < this._enmeysData.enemys.length; k++) {
                let v = this._enmeysData.enemys[k];
                if (v.getUid() == uid) {
                    this._enmeysData.enemys.splice(k, 1);
                    break;
                }
            }
            this._sortEnemysData();
        }
    }
    public _eventCleanData() {
        if (this._enmeysData) {
            this._enmeysData.count = 0;
            G_SignalManager.dispatch(SignalConst.EVENT_GET_ENEMY_LIST_SUCCESS);
        }
    }
    public c2sDelEnemy(uid) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_DelEnemy, { uid: uid });
    }
    public _s2cDelEnemy(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let uid = message['uid'];
        if (uid) {
            this._enemysList[uid] = null;
            this._deleteEnemysData(uid);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DEL_ENEMY_SUCCESS);
    }
    public c2sGetEnemyList() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetEnemyList, {});
    }
    public _s2cGetEnemyList(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let enemysData:any = {};
        enemysData.count = 0;
        let enemys_cnt = message['enemys_cnt'];
        if (enemys_cnt) {
            enemysData.count = enemys_cnt;
        }
        let enemys = message['enemys'];
        enemysData.enemys = [];
        this._enemysList = {};
        if (enemys) {
            for (let k in enemys) {
                let v = enemys[k];
                let unitEnemy = new EnemyUnitData();
                unitEnemy.updateData(v);
                enemysData.enemys.push(unitEnemy);
                this._enemysList[unitEnemy.getUid()] = true;
            }
        }
        this._recordEnemys(enemysData);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_ENEMY_LIST_SUCCESS);
    }
    public _s2cEnemyRespond(id, message) {
        if (this._isNeedRecord) {
            this.c2sGetEnemyList();
        }
    }
    public c2sEnemyBattle(user_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnemyBattle, { user_id: user_id });
    }
    public _s2cEnemyBattle(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ENEMY_BATTLE_SUCCESS, message);
    }
    public c2sCommonGetReport() {
        let message = { report_type: 5 };
        G_NetworkManager.send(MessageIDConst.ID_C2S_CommonGetReport, message);
    }
    public _s2cCommonGetReport(id, message) {
        let enemy_reports = message['enemy_reports'];
        let list = [];
        if (enemy_reports) {
            for (let _ in message.enemy_reports) {
                let v = message.enemy_reports[_];
                let signalData = new EnemyBattleReportUnitData();
                signalData.setProperties(v);
                list.push(signalData);
            }
        }
        ArraySort(list, function (a, b) {
            return a.getFight_time() > b.getFight_time();
        });
        G_SignalManager.dispatch(SignalConst.EVENT_ENEMY_BATTLE_REPORT_SUCCESS, list);
    }
}
