import { BaseData } from './BaseData';
import { Slot } from '../utils/event/Slot';
import { G_NetworkManager, G_SignalManager } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { ComplexRankConst } from '../const/ComplexRankConst';
import { SignalConst } from '../const/SignalConst';
import ChapterConst from '../const/ChapterConst';
export class ComplexRankData extends BaseData {
    _shopList;
    _recvGetUserLevelRank: Slot;
    _recvGetUserPowerRank: Slot;
    _recvGetArenaTopInfo: Slot;
    _recvGetStageStarRank: Slot;
    _recvGetTowerStarRank: Slot;
    _recvGetActivePhotoRank: Slot;
    _recvGetGuildRank: Slot;
    _recvGetUserAvaterPhotoRank: Slot;

    constructor(properties?) {
        super(properties)
        this._shopList = {};
        this._recvGetUserLevelRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserLevelRank, this._s2cGetUserLevelRank.bind(this));
        this._recvGetUserPowerRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserPowerRank, this._s2cGetUserPowerRank.bind(this));
        this._recvGetArenaTopInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetArenaTopInfo, this._s2cGetArenaTopInfo.bind(this));
        this._recvGetStageStarRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetStageStarRank, this._s2cGetStageStarRank.bind(this));
        this._recvGetTowerStarRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTowerStarRank, this._s2cGetTowerStarRank.bind(this));
        this._recvGetActivePhotoRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserActivePhotoRank, this._s2cGetActivePhotoRank.bind(this));
        this._recvGetUserAvaterPhotoRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserAvaterPhotoRank, this._s2cGetUserAvaterPhotoRank.bind(this));
        this._recvGetGuildRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildRank, this._s2cGetGuildRank.bind(this));
    }
    public clear() {
        this._recvGetUserLevelRank.remove();
        this._recvGetUserLevelRank = null;
        this._recvGetUserPowerRank.remove();
        this._recvGetUserPowerRank = null;
        this._recvGetArenaTopInfo.remove();
        this._recvGetArenaTopInfo = null;
        this._recvGetStageStarRank.remove();
        this._recvGetStageStarRank = null;
        this._recvGetTowerStarRank.remove();
        this._recvGetTowerStarRank = null;
        this._recvGetGuildRank.remove();
        this._recvGetGuildRank = null;
        this._recvGetActivePhotoRank.remove();
        this._recvGetActivePhotoRank = null;
        this._recvGetUserAvaterPhotoRank.remove();
        this._recvGetUserAvaterPhotoRank = null;
    }
    public reset() {
    }
    public c2sGetUserRankByType(typeIndex) {
        if (typeIndex == ComplexRankConst.USER_LEVEL_RANK) {
            this.c2sGetUserLevelRank();
        } else if (typeIndex == ComplexRankConst.USER_POEWR_RANK) {
            this.c2sGetUserPowerRank();
        } else if (typeIndex == ComplexRankConst.USER_ARENA_RANK) {
            this.c2sGetArenaTopInfo();
        } else if (typeIndex == ComplexRankConst.STAGE_STAR_RANK) {
            this.c2sGetStageStarRank(ChapterConst.CHAPTER_TYPE_NORMAL);
        } else if (typeIndex == ComplexRankConst.ELITE_STAR_RANK) {
            this.c2sGetStageStarRank(ChapterConst.CHAPTER_TYPE_ELITE);
        } else if (typeIndex == ComplexRankConst.TOWER_STAR_RANK) {
            this.c2sGetTowerStarRank();
        } else if (typeIndex == ComplexRankConst.USER_GUILD_RANK) {
            this.c2sGetGuildRank();
        } else if (typeIndex == ComplexRankConst.ACTIVE_PHOTO_RANK) {
            this.c2sGetActivePhotoRank();
        } else if (typeIndex == ComplexRankConst.AVATAR_PHOTO_RANK) {
            this.c2sGetUserAvaterPhotoRank();
        }
    }
    public c2sGetUserLevelRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserLevelRank, {});
    }
    public c2sGetUserPowerRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserPowerRank, {});
    }
    public c2sGetArenaTopInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetArenaTopInfo, {});
    }
    public c2sGetStageStarRank(rankType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetStageStarRank, { rank_type: rankType });
    }
    public c2sGetTowerStarRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTowerStarRank, {});
    }
    public c2sGetGuildRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildRank, {});
    }
    public c2sGetActivePhotoRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserActivePhotoRank, {});
    }
    public c2sGetUserAvaterPhotoRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserAvaterPhotoRank, {});
    }
    public _s2cGetUserLevelRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_LEVEL_RANK, message);
    }
    public _s2cGetUserPowerRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_POWER_RANK, message);
    }
    public _s2cGetArenaTopInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_ARENA_RANK, message);
    }
    public _s2cGetStageStarRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        let rankType = message['rank_type'];
        if (rankType) {
            if (rankType == ChapterConst.CHAPTER_TYPE_NORMAL) {
                G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_STAGE_STAR_RANK, message);
            } else if (rankType == ChapterConst.CHAPTER_TYPE_ELITE) {
                G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_ELITE_STAR_RANK, message);
            }
        }
    }
    public _s2cGetTowerStarRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_TOWER_STAR_RANK, message);
    }
    public _s2cGetActivePhotoRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_ACTIVE_PHOTO_RANK, message);
    }
    public _s2cGetUserAvaterPhotoRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_USER_AVATAR_PHOTO_RANK, message);
    }
    public _s2cGetGuildRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_COMPLEX_GUILD_RANK, message);
    }
}
ComplexRankData;