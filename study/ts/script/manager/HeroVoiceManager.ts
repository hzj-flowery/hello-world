import { G_AudioManager, G_UserData, G_SceneManager } from "../init";
import { HeroAudioHelper } from "../utils/HeroAudioHelper";

export default class HeroVoiceManager {
    _curHeroVoice: any;
    _curHeroId: number;
    _isInMainMenu: boolean;
    _mainMenuScheduler: any;
    constructor() {
        this._curHeroVoice = null;
        this._curHeroId = 0;
        this._isInMainMenu = false;
        this._mainMenuScheduler = null;
    }
    clear() {
        this._curHeroVoice = null;
        this._curHeroId = 0;
    }
    setIsInMainMenu(isIn) {
        this._isInMainMenu = isIn;
    }
    playVoiceWithHeroId(heroId, must?) {
        var res = HeroAudioHelper.getVoiceRes(heroId);
        var play = function () {
            if (this._curHeroVoice) {
                G_AudioManager.stopSound(this._curHeroVoice);
            }
            var voice = null;
            if (res) {
                voice = G_AudioManager.playSound(res);
            }
            this._curHeroVoice = voice;
            this._curHeroId = heroId;
        }.bind(this);
        if (must) {
            play();
        } else if (heroId != this._curHeroId) {
            play();
        }
    }
    playCurRoleVoice() {
        var roleId = G_UserData.getHero().getRoleBaseId();
        this.playVoiceWithHeroId(roleId);
    }
    playRoleVoiceWithSex(sex) {
        var heroId = 1;
        if (sex == 1) {
            heroId = 1;
        } else {
            heroId = 11;
        }
        this.playVoiceWithHeroId(heroId);
    }
    createScheduler(callbcak, interval) {
    }
    stopScheduler(scheduleHandler) {
        if (scheduleHandler) {
            G_SceneManager.unschedule(scheduleHandler);
        }
        scheduleHandler = null;
    }
    startPlayMainMenuVoice() {
        var heroIds = G_UserData.getTeam().getHeroBaseIdsInBattle();
        function getInterval() {
            return Math.randInt(15, 20);
        }
        var playHeroVoice = function () {
            if (this._isInMainMenu) {
                var index = Math.randInt(0, heroIds.length - 1);
                var heroId = heroIds[index];
                this.playVoiceWithHeroId(heroId);
            }
        }.bind(this);
        this._mainMenuScheduler = function () {
            playHeroVoice();
            if (this._isInMainMenu) {
                playLoop();
            }
        }.bind(this);
        var playLoop = function () {
            var interval = getInterval();
            if(this._mainMenuScheduler)
            G_SceneManager.scheduleOnce(this._mainMenuScheduler, interval);
        }.bind(this);
        this.playCurRoleVoice();
        playLoop();
    }
    stopPlayMainMenuVoice() {
        if (this._mainMenuScheduler) {
            G_SceneManager.unschedule(this._mainMenuScheduler);
            this._mainMenuScheduler = null;
        }
    }
}