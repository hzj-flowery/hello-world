import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import ResourceLoader from "../resource/ResourceLoader";

export namespace FontCheck {
    let fontText:string = '';

    export function checkLegal(str:string, cb) {
        if (fontText != '') {
            return check(str, cb);
        }else {
            ResourceLoader.loadRes('fonts/Font_W7S_Txt', cc.TextAsset, null, (err, res)=>{
                fontText = res['text'];
                ResourceLoader.releaseSceneRef('font_w75');
                return check(str, cb);
            }, 'font_w75');
        }
    }

    function check(str, cb:Function) {
        var passed = [];
        for (var i = 0; i < str.length; i++) {
            var char = str.charAt(i);
            if (passed.indexOf(char) != -1) {
                continue;
            }
            if (fontText.indexOf(char) != -1) {
                passed.push(char);
            }else {
                  cb(false);
                return;
            }
        }
       cb(true)
    }
}