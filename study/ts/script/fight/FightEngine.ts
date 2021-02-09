import { G_SpineManager } from "../init";
import { handler } from "../utils/handler";
import BuffManager from "./BuffManager";
import { FightConfig } from "./FightConfig";
import { FightResourceManager } from "./FightResourceManager";
import { FightRunData } from "./FightRunData";
import { FightSignalManager } from "./FightSignalManager";
import { FightSignalConst } from "./FightSignConst";
import { LoopWave } from "./loop/LoopWave";
import { ReportData } from "./report/ReportData";
import { Unit, WaveData } from "./report/WaveData";
import FightScene from "./scene/FightScene";
import UnitHero from "./unit/UnitHero";
import UnitPet from "./unit/UnitPet";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FightEngine extends cc.Component {

    private _fightScene: FightScene;
    private _preloadCompleteCallback: Function;

    private _interval;
    private _newInterval;
    private _nextInterval;

    private _leftName;
    private _rightName;
    private _leftOfficerLevel;
    private _rightOfficerLevel;

    private _report: ReportData;
    private _waves: WaveData[];
    private _waveCount;
    private _waveId;
    private _winCamp: number;
    private _loseCamp: number;

    private _loopWave: LoopWave;

    private _running: boolean;
    private _isJump: boolean;
    private _runCount: number;
    private _runFinishCount: number;
    private _fightSpeed: number;
    private _doSlowAction: boolean;

    private _monsterTalk: any[];
    private _monsterEndTalk: any[];

    private _unitHeroes: UnitHero[];
    private _unitPets: UnitPet[];

    private _listenerSignal;

    public init(_fightScene: FightScene) {
        this._fightScene = _fightScene;
        FightRunData.instance.setScene(this._fightScene);
        FightRunData.instance.setView(this._fightScene.getView());

        this._interval = 0;
        this._newInterval = 0;
        this._nextInterval = 0;
        this._running = false;
        this._winCamp = 0;
        this._waves = null;
        this._isJump = false;
        this._runCount = 0;
        this._runFinishCount = 0;
        this._fightSpeed = 1;
        this._doSlowAction = false;

        this._monsterTalk = [];
        this._monsterEndTalk = [];
    }

    private _reset() {
        this._interval = 0;
        this._newInterval = 0;
        this._nextInterval = 0;
        this._running = false;
        this._winCamp = 0;
        this._waves = null;
        this._isJump = false;
        this._runCount = 0;
        this._runFinishCount = 0;
        this._fightSpeed = 1;
        this._doSlowAction = false;

        this._monsterTalk = [];
        this._monsterEndTalk = [];
    }


    public startWithPreload(report: ReportData, battleData: any, callback?: Function, sceneName?: string) {
        this._report = report;
        this._preloadCompleteCallback = callback;
        FightResourceManager.instance.signalFinish.addOnce(this.onPreloadComplete.bind(this));
        FightResourceManager.instance.preloadResByReport(this._report, battleData, sceneName);

        this._listenerSignal = FightSignalManager.getFightSignalManager().addListenerHandler(handler(this, this._onSignalEvent));
    }

    public startBattle() {
        BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_FIGHT_OPENING);
        for (let i = 0; i < this._unitHeroes.length; i++) {
            this._unitHeroes[i].playStartBuff();
        }
        if (this.getBattleRound() == 1) {
            this.checkMonsterTalk();
        }
    }

    public addMonsterTalk(talkConfig) {
        this._monsterTalk.push(talkConfig);
    }

    public addLoseTalk(talkConfig) {
        this._monsterEndTalk.push(talkConfig);
    }

    private _setFinalData() {
        let wave = this._waves[this._waveId - 1];
        for (let i = 0; i < wave.getFinalUnits().length; i++) {
            let u = wave.getFinalUnits()[i];
            let unit = FightRunData.instance.getUnitById(u.stageId);
            if (unit) {
                unit.setFinalData(u);
            }
        }
    }

    private _doFinalAction() {
        for (let i = 0; i < this._unitHeroes.length; i++) {
            this._unitHeroes[i].doFinal();
        }
    }

    private _jumpWaveSignal() {
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_JUMP_WAVE);
    }

    public jumpToEnd() {
        if (!this._loopWave) {
            return;
        }
        this.changeBattleSpeed(1);
        this._setFinalData();
        this._isJump = true;
        this._fightScene.stopFlash();
        this._fightScene.clearState();
        this._fightScene.setViewport(cc.v2(0, 0));
        this._fightScene.getView().showSkill3Layer(false);

        this._loopWave.onFinish();
        //清除buff
        BuffManager.getBuffManager().clearBuff();
        if (this._waveId == this._waves.length) {
            this._doFinalAction();
            this._jumpWaveSignal();
        }
    }

    public setStart() {
        if (this._running) {
            return;
        }
        this._newInterval = null;
        this._interval = null;
        this._running = true;

        cc.director.getScheduler().schedule(this.onUpdate, this, 0);
    }

    public pause() {
        cc.director.getScheduler().unschedule(this.onUpdate, this);
        this._running = false;
    }

    public stop() {
        cc.director.getScheduler().unschedule(this.onUpdate, this);
        this._running = false;
    }

    public clear() {
        if (this._listenerSignal != null) {
            this._listenerSignal.remove();
            this._listenerSignal = null;
        }
        this._reset();
    }

    
    public onUpdate(dt: number) {
        if (!this._running) {
            return;
        }
        let loops = 0
        if (this._newInterval == null || this._interval == null) {
            this._newInterval = 0
            this._interval = 0
        }
        else {
            this._newInterval = this._newInterval + dt
            this._interval = this._interval + FightConfig.interval * 5
        }

        if (this._interval > this._newInterval) {
            this._interval = this._newInterval
        }

        // console.log("FightManager:onUpdate dt:", dt);
        // console.log("FightManager:onUpdate interval:", this.interval);
        // console.log("FightManager:onUpdate newInterval:", this.newInterval);
        if (this._newInterval > 0 && this._interval > 0) {
            while (this._interval >= this._nextInterval && loops < 5) {
                this.onLogicUpdate(FightConfig.interval);
                this._nextInterval = this._nextInterval + FightConfig.interval;
                loops = loops + 1;
                // console.log("FightManager:onUpdate nextInterval:", this.nextInterval, loops);
            }

            let interpolation = (this._interval + FightConfig.interval - this._nextInterval) / FightConfig.interval;
            this.onFrameUpdate(interpolation);
        }
    }

    public changeBattleSpeed(speed?: number) {
        if (speed != null) {
            this._fightSpeed = speed;
        }
        cc.director.getScheduler().setTimeScale(this._fightSpeed);
        G_SpineManager.setTimeScale(this._fightSpeed);
        FightRunData.instance.setBattleSpeed(speed);
    }


    public getWaveId(): number {
        return this._waveId;
    }

    public getMaxRound() {
        return this._report.getMaxRoundNum();
    }

    public getBattleRound() {
        if (this._loopWave) {
            return this._loopWave.index;
        }
        return 0;
    }

    public getWaveCount() {
        return this._waveCount;
    }

    public getAttackConfigId() {
        if (!this._loopWave) {
            return null;
        }
        let round = this._loopWave.getLoopRound();
        let loopAttack = round.getLoopAttack();
        if (!loopAttack) {
            return;
        }
        let configId = loopAttack.getUnitConfigId();
        return configId;
    }

    private onPreloadComplete() {
        console.log("onPreloadComplete end");

        this.setupBattle();
        // this.setStart();

        if (this._preloadCompleteCallback) {
            this._preloadCompleteCallback();
        }
    }



    private resetBattle() {
        this._interval = 0;
        this._newInterval = 0;
        this._nextInterval = 0;
    }

    private setupBattle() {
        this._leftName = this._report.getLeftName();
        this._rightName = this._report.getRightName();
        this._leftOfficerLevel = this._report.getAttackOfficerLevel();
        this._rightOfficerLevel = this._report.getDefenseOfficerLevel();

        this._waves = this._report.waves;
        this._waveCount = this._waves.length;
        this._waveId = 0;

        this._winCamp = this._report.getIsWin() ? FightConfig.campLeft : FightConfig.campRight;
        this._loseCamp = this._report.getIsWin() ? FightConfig.campRight : FightConfig.campLeft;

        this.setupWave();
    }

    public setupWave() {
        this._waveId = this._waveId + 1;
        let wave: WaveData = this._waves[this._waveId - 1];

        if (this._unitHeroes != null) {
            for (let i = 0; i < this._unitHeroes.length; i++) {
                this._unitHeroes[i].node.destroy();
            }
        }
        this._unitHeroes = [];
        this.initUnit(wave.getUnits());
        FightRunData.instance.setUnits(this._unitHeroes);

        let enterList = wave.getFirstEnter();
        if (enterList.length != 0) {
            this.initEnter(enterList);
        }

        if (this._unitPets != null) {
            for (let i = 0; i < this._unitPets.length; i++) {
                this._unitPets[i].node.destroy();
            }
        }
        this._unitPets = [];
        this.initPet(wave.getPets());
        FightRunData.instance.setPets(this._unitPets);

        this._loopWave = new LoopWave(wave);
        this._loopWave.selfIndex = this._waveId;
        FightRunData.instance.setLoopWave(this._loopWave);
    }

    public createNewUnit(unitStageId, unitId, enterAction, callBack?) {

        let strUnit: Unit = new Unit();
        strUnit.stageId = unitStageId;
        strUnit.configId = unitId;
        strUnit.maxHp = 100;
        strUnit.hp = 100;
        strUnit.anger = 3;
        strUnit.rankLevel = 0;
        strUnit.monsterId = 0;
        strUnit.limitLevel = 0;
        strUnit.limitRedLevel = 0;
        strUnit.showMark = [];
        strUnit.camp = Math.floor(unitStageId / 100);
        strUnit.cell = unitStageId % 10;

        this.initUnit([strUnit], false, callBack);
        this._unitHeroes[this._unitHeroes.length - 1].xingcaiIn()
    }

    //初始化所有人物动画  
    private initUnit(list: Unit[], isReborn?: boolean, callBack?) {
        for (let i = 0; i < list.length; i++) {
            let unit: UnitHero = new cc.Node(list[i].configId.toString()).addComponent(UnitHero);
            unit.node.active = true;
            unit.init(list[i], callBack);
            unit.createActor();
            unit.createBillBoard(this._leftName, this._leftOfficerLevel, this._rightName, this._rightOfficerLevel);
            unit.createShadow();
            unit.createHitTipView();
            this.addUnit(unit, isReborn);
        }
    }

    private initEnter(list: number[]) {
        for (let i = 0; i < this._unitHeroes.length; i++) {
            this._unitHeroes[i].enterStage = false;
        }
        for (let i = 0; i < list.length; i++) {
            FightRunData.instance.getUnitById(list[i]).enterStage = true;
        }
    }

    //是否在待机位置添加unit
    private addUnit(unit: UnitHero, isReborn?: boolean) {
        this._unitHeroes.push(unit);
        this._fightScene.addEntity(unit.node);
        this._fightScene.addTipView(unit.getHitTipView());

        let cell = FightConfig.cells[unit.camp];
        if (isReborn) {
            unit.setReborn();
        }
    }

    private initPet(list) {
        for (let i = 0; i < list.length; i++) {
            let pet: UnitPet = new cc.Node(list[i].configId.toString()).addComponent(UnitPet);
            pet.node.active = true;
            pet.init(list[i]);
            pet.createActor();
            pet.createBillBoard();
            pet.createShadow();
            this.addPet(pet);
        }
    }

    public getUnitById(id):UnitHero {
        for (var key in this._unitHeroes) {
            var unit = this._unitHeroes[key];
            if (unit.stageID == id) {
                return unit;
            }
        }
        return null;
    }

    private addPet(pet: UnitPet) {
        this._unitPets.push(pet);
        this._fightScene.addEntity(pet.node);
    }

    private onLogicUpdate(dt: number) {
        // console.log("FightManager:onLogicUpdate dt:", dt);
        if (!this._running) {
            return;
        }

        if (this._loopWave) {
            if (!this._loopWave.isStart) {
                this._loopWave.start();
            }
            else {
                // 回合结束
                if (this._loopWave.isFinish) {
                    // if (FightConfig.HP_TEST_ON) {
                    // }
                    if (this._waveId < this._waves.length) {
                        if (this._isJump) {
                            this._loopWave.clear();
                        }

                        for (let i = 0; i < this._unitHeroes.length; i++) {
                            if (this._unitHeroes[i].isFinalDie() && this._isJump) {
                                this._unitHeroes[i].doFinal();
                            }
                            else {
                                this._unitHeroes[i].runMap();
                                this._unitHeroes[i].setZOrderFix(0);
                                this._runCount += 1;
                            }
                        }

                        let sceneView = this._fightScene.getView();
                        sceneView.showSkill2Layer(false);
                        this._isJump = false;
                    }
                    else {
                        this.doFinish();
                        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_FIGHT_END);
                    }
                    this._loopWave = null;
                }
                else {
                    this._loopWave.update(dt);
                }
            }
        }
        for (let i = 0; i < this._unitHeroes.length; i++) {
            this._unitHeroes[i].logicUpdate(dt);
            if (this._unitHeroes[i].isRemove()) {
                this._unitHeroes[i].death();
                this._unitHeroes[i].billBoard.showDead();
                this._unitHeroes[i].getShadow().death();
                this._unitHeroes[i].clearActor();
                this._unitHeroes.splice(i, 1);
                i > 0 ? i-- : i = 0;
            }
        }
          FightRunData.instance.setUnits(this._unitHeroes);

        for (let i = 0; i < this._unitPets.length; i++) {
            this._unitPets[i].logicUpdate(dt);
            if (this._unitPets[i].isRemove()) {
                this._unitPets[i].death();
                this._unitPets[i].getShadow().death();
                this._unitPets[i].clearActor();
                this._unitPets.splice(i, 1);
                FightRunData.instance.setPets(this._unitPets);
                i > 0 ? i-- : i = 0;
            }
        }

        this._fightScene.logicUpdate(dt);
    }

    private onFrameUpdate(dt: number) {
        // console.log("FightManager:onFrameUpdate dt:", dt);
        for (let i = 0; i < this._unitHeroes.length; i++) {
            this._unitHeroes[i].frameUpdate(dt);
        }

        for (let i = 0; i < this._unitPets.length; i++) {
            this._unitPets[i].frameUpdate(dt);
        }
        this._fightScene.updateFrame(dt);
    }

    private doFinish() {
        this.playWinAction();
        this.playPetEnd();
        this.changeBattleSpeed(1);
    }

    private playWinAction() {
        FightRunData.instance.getUnits().forEach(unit => {
            if (unit.is_alive && unit.camp == this._winCamp) {
                unit.setWin();
            }
        });
    }

    private playPetEnd() {
    }

    private _onSignalEvent(event, ...args) {
        // console.log("_onSignalEvent:",event);
        if (event == FightSignalConst.SIGNAL_LAST_HIT) {
            this._dispatchLastHit.apply(this, args);
        }
        else if (event == FightSignalConst.SIGNAL_RUN_MAP) {
            this._runMapInPosition.apply(this, args);
        }
        else if (event == FightSignalConst.SIGNAL_NEW_UNIT) {
            this.initUnit.apply(this, args);
        }
        else if (event == FightSignalConst.SIGNAL_CHECK_MONSTER_TALK) {
            this.checkMonsterTalk.apply(this);
        }
    }

    private _dispatchLastHit(unit: UnitHero) {
        if (this._doSlowAction) {
            return;
        }
        if (this._waveId != this._waveCount) {
            return;
        }
        let isLastUnit = true;
        for (let i = 0; i < this._unitHeroes.length; i++) {
            if (this._unitHeroes[i].camp == unit.camp && this._unitHeroes[i].to_alive) {
                isLastUnit = false;
                break;
            }
        }
        if (isLastUnit) {
            this._doFinalSlowAction();
            FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_DO_FINAL_SLOW);
        }
    }

    private _finalSlowCallback() {
        this.changeBattleSpeed();
    }

    private _doFinalSlowAction() {
        this._doSlowAction = true;
        this.changeBattleSpeed(FightConfig.SLOW_ACTION_RET);
        this._fightScene.getView().showFinalSlow(handler(this, this._finalSlowCallback));
    }

    private _runMapInPosition(stageId: number) {
        let unit = FightRunData.instance.getUnitById(stageId);
        unit.remove();
        this._runFinishCount += 1;
        if (this._runFinishCount == this._runCount) {
            this._finishWave(this._waveId);
            FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_RUN_MAP_FINISH);
        }
    }

    private _finishWave(waveId: number) {
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_FINISH_WAVE, waveId);
        this.playWinAction();
        this.playPetEnd();
        if (waveId == this._waves.length) {
            this.changeBattleSpeed(1);
        }
        BuffManager.getBuffManager().clearBuff();
    }

    public checkMonsterTalk() {
        if (this._monsterTalk.length <= 0) {
            return;
        }
        for (let i = 0; i < this._monsterTalk.length; i++) {
            let talk = this._monsterTalk[i];
            if (talk.round != this.getBattleRound()) {
                continue;
            }

            for (let j = 0; j < this._unitHeroes.length; j++) {
                let unit = this._unitHeroes[j];
                var talkId = unit.monsterId;
                if (talkId == 0) {
                    talkId = unit.configId;
                }
                if (talkId == talk.target) {
                    var canTalk = true;
                    if (talk.death != 0) {
                        if (talk.death != this._checkUnitFinalAlive(unit)) {
                            canTalk = false;
                        }
                    }
                    if (canTalk) {
                        unit.talk(talk.position, talk.face, talk.bubble);
                    }
                    break;
                }
            }
        }
    }

    public checkMosterEndTalk() {
        if (this._monsterEndTalk.length <= 0) {
            return;
        }
        for (let i = 0; i < this._monsterEndTalk.length; i++) {
            var talk = this._monsterEndTalk[i];
            for (let j = 0; j < this._unitHeroes.length; j++) {
                let unit = this._unitHeroes[j];
                var talkId = unit.monsterId;
                if (talkId == talk.target && this._checkUnitFinalAlive(unit)) {
                    unit.endTalk(talk.position, talk.face, talk.bubble);
                    break;
                }
            }
        }
    }

    private _checkUnitFinalAlive(unit: UnitHero): boolean {
        var wave = this._waves[this._waveId - 1];
        for (let i = 0; i < wave.getFinalUnits().length; i++) {
            var v = wave.getFinalUnits()[i];
            var stageId = v.stageId;
            if (unit.stageID == stageId) {
                return true;
            }

        }
        return false;
    }

    public makeUnitIdle () {
        for (var i in this._unitHeroes) {
            var v = this._unitHeroes[i];
            if (v.getState() == 'StateOut') {
                v.clearState();
            }
        }
    }
}
