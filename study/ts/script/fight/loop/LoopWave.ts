import { WaveData, Round, Buff, BuffEffect } from "../report/WaveData";
import { Loop } from "./Loop";
import { FightConfig } from "../FightConfig";
import { LoopRound } from "./LoopRound";
import { FightRunData } from "../FightRunData";
import { State } from "../state/State";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import { handler } from "../../utils/handler";
import { G_ConfigLoader, G_AudioManager } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import BuffManager from "../BuffManager";
import { AudioConst } from "../../const/AudioConst";

export class LoopWave extends Loop {
    public selfIndex = 0;
    public index: number;

    private _data: WaveData;
    private _rounds: Round[];
    private _round: LoopRound;
    private _unitCount = 0;
    private _signals = [];
    private _enterList = [];
    private _stageUnitCount = 0;
    private _petCount = 0;
    private _readyCount = 0;

    private _isFirstEnter = false;
    private _enterTime = 0;
    private _isStartEnter = false;
    private _waitTime = 0;
    private _enterIndex = 0;
    _checkEndIdle: boolean;
    _historyCount: number;
    _hisEndCount: number;
    _callback: any;

    constructor(data: WaveData) {
        super();

        this._data = data
        this._rounds = this._data.getRounds()
        this.index = 0
        this.selfIndex = 0;
        this._round = null;
        this._unitCount = 0
        this._signals = [];
        this._enterList = this._data.getEnterStage()		//后入场的
        this._stageUnitCount = this._data.getFirstEnter().length;	//原来在场地里面的
        this._checkEndIdle = false;

        this._unitCount = this._data.getUnits().length;

        this._petCount = this._data.getPets().length;

        FightRunData.instance.getUnits().forEach(unit => {
            let signal = unit.signalStartCG.add(handler(this, this._onPetEnter));
            this._signals.push(signal);
        });

        FightRunData.instance.getPets().forEach(pet => {
            let signal = pet.signalStartCG.add(handler(this, this._onPetEnter));
            this._signals.push(signal);
        });

        this._readyCount = 0;


        let HeroSkillEffect = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT);
        let initBuff: Buff[] = this._data.getInitBuff();
        for (let i = 0; i < initBuff.length; i++) {
            initBuff[i].buffConfig = HeroSkillEffect.get(initBuff[i].configId);
            BuffManager.getBuffManager().addAddBuff(initBuff[i]);
        }

        let petsBuff: BuffEffect[] = this._data.getPetsBuff();
        for (let i = 0; i < petsBuff.length; i++) {
            // petsBuff[i].buffConfig = HeroSkillEffect.get(petsBuff[i].configId);
            BuffManager.getBuffManager().addPetsBuff(petsBuff[i]);
        }

        this._isFirstEnter = false 		//是否已经第一次进入
        this._enterTime = 0				//进入后计时
        this._isStartEnter = false 		//开始进入
        this._waitTime = 0				//等待下一个入场的时间
        this._enterIndex = 0			//进入了几个人
        this._historyCount = 0;
        this._hisEndCount = 0;
    }

    public start() {
        super.start();

        FightRunData.instance.getUnits().forEach(unit => {
            unit.enterFightStage();
            if (!this._isStartEnter) {
                this._startEnter();
            }
        });

        if (!FightConfig.NEED_PET_SHOW) {
            FightRunData.instance.getPets().forEach(pet => {
                pet.enterFightGround();
            })
        }

        this.index = 1;
        this._round = null;
    }

    //
    private checkRound() {
        if (this._round == null) {
            this._round = new LoopRound(this._rounds[this.index - 1])
            if (this.index != 1)	//第一轮放到杀之后去
            {
                FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_CHECK_MONSTER_TALK);
                // Engine.getEngine(): checkMonsterTalk()
            }
        }
    }

    private checkUnitIdle() {
        FightRunData.instance.getUnits().forEach(unit => {
            if (unit.getState() != "StateIdle") {
                return false;
            }
        });
        return true;
    }

    //
    public update(f: number) {
        // console.log("LoopWave:update", this.index);
        if (this.index > this._rounds.length) {
            console.log("LoopWave:update round end");
            if (this.checkUnitIdle()) {
                this.isFinish = true
            }else {
                if (!this._checkEndIdle) {
                    BuffManager.getBuffManager().engine.makeUnitIdle();
                    this._checkEndIdle = true;
                }
            }
        }
        else {
            this.checkRound()
            if (this._round) {
                if (!this._round.isStart)
                    this._round.start()
                else
                    this._round.update(f)
                if (this._round.isFinish) {
                    this._round.onFinish()
                    this._round = null
                    this.index = this.index + 1
                    console.log("LoopWave round next:", this.index);
                }
            }
        }

        if (this._isStartEnter) {
            if (this._enterTime >= this._waitTime) {
                this._unitJumpIn()
                this._enterTime = 0
            }
            this._enterTime += f;
        }
    }

    _startRound() {
        if (this._round) {
            this._round.start();
        }
    }
    _checkRoundStart(callback) {
        if (callback) {
            this._callback = callback;
        }
        var buffs = BuffManager.getBuffManager().checkHisBuff(BuffManager.HIS_BEFORE_FIGHT);
        this._historyCount = 0;
        this._hisEndCount = 0;
        if (!buffs) {
            if (this._callback) {
                this._callback();
                return;
            }
        }
        for (var _ in buffs) {
            var v = buffs[_];
            v.playBuff(handler(this, this._playBuffCallback));
            this._historyCount = this._historyCount + 1;
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_PURPLE_HISTORICAL_HERO_FIGHT);
    }

    _playBuffCallback() {
        this._hisEndCount = this._hisEndCount + 1;
        if (this._hisEndCount == this._historyCount) {
            if (this._callback) {
                this._callback();
            }
        }
    }

    public getLoopRound() {
        return this._round
    }

    private _dispatchStart() {

        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_START_WAVE, this.selfIndex);
    }


    private _onPetEnter(event) {
        this._readyCount = this._readyCount + 1
        if (this._readyCount == this._unitCount + this._petCount)
            this._checkRoundStart(handler(this, this._dispatchStart));
        else if (FightConfig.NEED_PET_SHOW && this._readyCount == this._unitCount) {
            FightRunData.instance.getPets().forEach(pet => {
                pet.enterFightGround();
            });
        }
    }

    private _startEnter() {
        this._isStartEnter = true;
        this._enterTime = 0;
        this._waitTime = FightConfig.FIRST_FIRST_TIME[0];
    }

    private _unitJumpIn() {
        if (this._enterList.length == 0) {
            this._isStartEnter = false
            return
        }

        let enterUnit = this._enterList[0];

        for (let i = 0; i < enterUnit.length; i++) {
            this._stageUnitCount = this._stageUnitCount + 1
            let unit = FightRunData.instance.getUnitById(enterUnit[i])
            if (unit.stageID == FightConfig.FIRST_SHOW_STAGEID)
                unit.needOpenShow = true

            unit.jumpIntoStage()
        }

        this._enterList.splice(0, 1);
        if (this._enterList.length != 0) {
            this._enterIndex = this._enterIndex + 1
            this._waitTime = FightConfig.FIRST_FIRST_TIME[this._enterIndex]
        }
    }

    public clear() {
        this._round.clear()
        this._round.onFinish()
        this._round = null
    }

}