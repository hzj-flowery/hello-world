import { G_SignalManager } from "../init";
import { SignalConst } from "../const/SignalConst";

export namespace AudioHelper {
    var mode = 1;
    // if (audiomode) {
    //     mode = audiomode();
    // }

    export function playMusic(path, loop, volume) {
        if (mode == 1) {
            return cc.audioEngine.play(path, loop || false, volume || 1);
        } else {
            // audio.setMusicVolume(volume || 1);
            //  audio.playMusic(path, loop || false);
            return 0;
        }
    };
    export function stopMusic(musicId, release, path) {
        if (mode == 1) {
            cc.audioEngine.stop(musicId);
            if (release) {
                cc.audioEngine.uncache(path);
            }
        } else {
            // audio.stopMusic(release || false);
        }
    };
    export function setMusicVolume(musicId, volume) {
        if (mode == 1) {
            cc.audioEngine.setVolume(musicId, volume || 1);
        } else {
            // audio.setMusicVolume(volume || 1);
        }
    };
    export function setSoundVolume(musicId, volume) {
        if (mode == 1) {
            cc.audioEngine.setVolume(musicId, volume || 1);
        } else {
            //  audio.setSoundsVolume(volume || 1);
        }
    };
    export function playSound(path, loop, volume, pitch) {
        if (mode == 1) {
            var musicId = cc.audioEngine.play(path, loop || false, volume || 1);
            cc.audioEngine.setFinishCallback(musicId, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_SOUND_END, musicId);
            });
            return musicId;
        } else {
            // audio.setSoundsVolume(volume || 1);
            //  return audio.playSound(path, loop || false, pitch || 1);
        }
    };
    export function stopSound(musicId) {
        if (mode == 1) {
            cc.audioEngine.stop(musicId);
        } else {
            //  audio.stopSound(musicId);
        }
    };
    export function uncacheSound(path) {
        if (mode == 1) {
            cc.audioEngine.uncache(path);
        } else {
            //audio.unloadSound(path);
        }
    };
    export function stopAll() {
        if (mode == 1) {
            cc.audioEngine.stopAll();
        } else {
            // audio.stopMusic(true);
            // audio.stopAllSounds();
        }
    };
    export function clear() {
        if (mode == 1) {
            cc.audioEngine.stopAll();
            cc.audioEngine.uncacheAll();
        } else {
            // audio.stopMusic(true);
            // audio.stopAllSounds();
        }
    };
    export function setCallback(musicId, callback) {
        if (mode == 1) {
            cc.audioEngine.setFinishCallback(musicId, callback);
        }
    };
    export function cacheSound(path) {
        if (mode == 1) {
        } else {
            //audio.preloadSound(path);
        }
    };
}