import { AudioConst } from "../const/AudioConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_AudioManager, G_ConfigLoader, G_ServerTime } from "../init";
import { AudioHelper } from "../utils/AudioHelper";
import { assert } from "../utils/GlobleFunc";
import { table } from "../utils/table";

export default class AudioManager {
    _musicEnabled: boolean;
    _soundEnabled: boolean;
    _isOpenMainMusic:boolean;
    _musicPath: string;
    _musicId: any;
    _musicVolume: number;
    _mainMusicTime:number;
    _mainMusicID:number;
    _soundVolume: number;
    _soundList: {};
    _jsonConfig;

    _systemSound;
    _nextSoundId = 0;
    constructor() {
        this._musicEnabled = true;
        this._soundEnabled = true;
        this._isOpenMainMusic = false;
        this._mainMusicTime = 0;
        this._mainMusicID = 0;
        this._musicPath = '';
        this._musicId = -1; // -1;
        this._musicVolume = 1;
        this._soundVolume = 1;
        this._soundList = {};
        this._systemSound = G_ConfigLoader.getConfig(ConfigNameConst.SYSTEM_SOUND);
        //  this._jsonConfig = this.decodeJsonFile('audio.json');
        // ccui.Widget.setClickSoundCallback(function (soundID) {
        //     this.playSoundWithId(soundID || AudioConst.SOUND_BUTTON);
        // });
    }
    setSoundEnabled(enable) {
        if (enable != this._soundEnabled) {
            this._soundEnabled = enable;
            // dump(this._soundList);
            this._soundList = {};
        }
    }
    setMusicEnabled(enable) {
        if (enable != this._musicEnabled) {
            this._musicEnabled = enable;
            if (!this._musicEnabled) {
                this.stopMusic(true);
            } else {
                if (this._musicPath != '') {
                    this.playMusic(this._musicPath);
                } else {
                    this.playMusicWithId(AudioConst.MUSIC_CITY);
                }
            }
        }
    }
    openMainMusic(isOpen) {
        this._isOpenMainMusic = isOpen;
    }
    stopAllSound () {
        for (let k in this._soundList) {
            var v = this._soundList[k];
            AudioHelper.stopSound(k);
        }
    }
    playMusicWithId(id) {
        var audioInfo = this._systemSound.get(id);
      //assert((audioInfo, 'Could not find the autio info with id: ' + (id));
        var convertStr = this.getConvertPath(audioInfo.file_name);
        this.playMusic(convertStr);
    }
    playMusic(path) {
        if (this._musicEnabled) {
            if (this._musicId != -1 && this._musicPath == path) {
                return;
            }
            this.stopMusic(true);
            var convertStr = this.getConvertPath(path);
            cc.resources.load(convertStr, cc.AudioClip, (err, clip) => {
                if (err) {
                    return;
                }
                this._musicId = AudioHelper.playMusic(clip, true, this._musicVolume);
                this._musicPath = convertStr;
            });
        }
    }
    


    stopMusic(release) {
        if (this._musicId != -1) {
            AudioHelper.stopMusic(this._musicId, release, this._musicPath);
            this._musicId = -1;
        }
    }
    getMusicVolume() {
        return this._musicVolume;
    }
    setMusicVolume(volume) {
        this._musicVolume = volume;
        if (this._musicId != -1) {
            AudioHelper.setMusicVolume(this._musicId, volume);
        }
    }
    getSoundVolume() {
        return this._soundVolume;
    }
    setSoundVolume(volume, needSetPlayingSound?) {
        this._soundVolume = volume;
        if (needSetPlayingSound) {
            var time = G_ServerTime.getTime();
            for (var k in this._soundList) {
                var v = this._soundList[k];
                if (v.isRun && time - v.startPlayTime < 20) {
                    AudioHelper.setSoundVolume(k, volume);
                } else {
                    this._soundList[k] = null;
                    delete this._soundList[k];
                }
            }
        }
    }
    playSoundWithId(id, p?) {
        var pitch = p || 1;
        var audioInfo = this._systemSound.get(id);
      //assert((audioInfo, 'Could not find the autio info with id: ' + (id));
        var convertStr = this.getConvertPath(audioInfo.file_name);
        var soundId = this.playSound(convertStr, pitch);
        return soundId;
    }
    playSound(path, pitch?) {
        if (this._soundEnabled) {
            var convertStr = this.getConvertPath(path);
            cc.resources.load(convertStr, cc.AudioClip, (err, clip) => {
                if (err) {
                    return;
                }
                var soundId = AudioHelper.playSound(clip, false, this._soundVolume, pitch || 1);
                this._nextSoundId = soundId + 1;
                this._soundList[soundId] = {
                    isRun: true,
                    startPlayTime: G_ServerTime.getTime()
                };
                this._clearExpiredSoundData();
            });
            return  this._nextSoundId;
        }
        return null;
    }
    playSoundWithIdExt(id, p, isLoop) {
        var pitch = p || 1;
        var audioInfo =  this._systemSound.get(id);
        assert(audioInfo, 'Could not find the autio info with id: ' + (id));
        var convertStr = this.getConvertPath(audioInfo.file_name);
        var soundId = this.playSoundExt(convertStr, pitch, isLoop);
        return soundId;
    }
    playSoundExt(path, pitch, isLoop) {
        if (this._soundEnabled) {
            var convertStr = this.getConvertPath(path);
            var soundId = AudioHelper.playSound(convertStr, isLoop, this._soundVolume, pitch || 1);
            return soundId;
        }
        return null;
    }
    _clearExpiredSoundData() {
        var time = G_ServerTime.getTime();
        for (var k in this._soundList) {
            var v = this._soundList[k];
            if (v.isRun && time - v.startPlayTime >= 20) {
                this._soundList[k] = null;
                delete this._soundList[k];
            }
        }
    }
    stopSound(handler) {
        AudioHelper.stopSound(handler);
    }
    stopAll() {
        AudioHelper.stopAll();
    }
    clear() {
        AudioHelper.clear();
    }
    setCallback(soundID, callback) {
        AudioHelper.setCallback(soundID, callback);
    }
    isSoundEnable() {
        return this._soundEnabled;
    }
    preLoadSoundWithId(id) {
        var audioInfo = this._systemSound.get(id);
      //assert((audioInfo, 'Could not find the autio info with id: ' + (id));
        var convertStr = this.getConvertPath(audioInfo.file_name);
        this.preLoadSound(convertStr);
    }
    unLoadSoundWithId(id) {
        var audioInfo = this._systemSound.get(id);
      //assert((audioInfo, 'Could not find the autio info with id: ' + (id));
        var convertStr = this.getConvertPath(audioInfo.file_name);
        AudioHelper.uncacheSound(convertStr);
    }
    preLoadSound(path) {
        var convertStr = this.getConvertPath(path);
        AudioHelper.cacheSound(convertStr);
    }
    unLoadSound(path) {
        var convertStr = this.getConvertPath(path);
        AudioHelper.uncacheSound(convertStr);
    }
    decodeJsonFile(jsonFileName) {
        // var fileUtils = cc.FileUtils.getInstance();
        // if (fileUtils.isFileExist(jsonFileName)) {
        //     var jsonString = fileUtils.getStringFromFile(jsonFileName);
        //     return json.decode(jsonString);
        // }
        // return null;
    }
    getConvertPath(key:string) {
        if (this._jsonConfig) {
            var realPath = this._jsonConfig[key];
            if (realPath) {
                return realPath;
            }
        }
        return key.split('.mp3')[0];
    }
}