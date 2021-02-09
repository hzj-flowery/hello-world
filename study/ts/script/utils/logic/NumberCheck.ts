import { G_Prompt } from "../../init";
import { Lang } from "../../lang/Lang";

export namespace NumberCheck {

    export function checkPhone(num: string, popHint) {
        var success = true;
        var popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        if (num == null || num == '') {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('common_error_phone_not_empty'));
            };
        }
        if (success) {
            var b = Number(num);
            if (b == null) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('common_error_phone_not_number'));
                };
            }
        }
        if (success && num.length != 11) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('common_error_phone_less_11'));
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function checkName(num: string, popHint) {
        var success = true;
        var popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        if (num == null || num == '') {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('common_error_name_not_empty'));
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function checkBirthday(num: string, popHint) {
        var success = true;
        var popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        if (num == null || num == '') {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('common_error_birthday_not_empty'));
            };
        }
        if (success) {
            var b = Number(num);
            if (b == null) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('common_error_birthday_not_number'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function checkQQ(num, popHint) {
        var success = true;
        var popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        if (num == null || num == '') {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('common_error_qq_not_empty'));
            };
        }
        if (success) {
            var b = Number(num);
            if (b == null) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('common_error_qq_not_number'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
}