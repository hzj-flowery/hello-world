import { BaseService } from "./BaseService";
import { FunctionConst } from "../const/FunctionConst";
import { SignalConst } from "../const/SignalConst";
import { G_SignalManager, G_SceneManager } from "../init";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";

export class GuildService extends BaseService {

    public _dungeonOpenState: boolean;
    constructor() {
        super();
        this._dungeonOpenState = false;
        this.start();
    }
    public tick() {
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'guild' && runningSceneName != 'main') {
            return;
        }
        let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ARMY_GROUP)[0];
        if (!isOpen) {
            return;
        }
        this._guildDungeonRedPointCheck();
    }
    public _guildDungeonRedPointCheck() {
        let [openState] = LogicCheckHelper.checkGuildDungeonInOpenTime(false);
        if (openState != this._dungeonOpenState) {
            // console.warn('GuildService: _guildDungeonRedPointCheck currstate ' + (String(this._dungeonOpenState) + (' oldstate ' + String(openState))));
            this._dungeonOpenState = openState;
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARMY_GROUP);
        }
    }
}
