import { G_StorageManager, G_ConfigManager } from "../init";

export namespace AgreementSetting {
    export function getPrivacyWords() {
        if (G_ConfigManager.isDalanVersion()) {
            return 'privacy';
        }
        return 'privacyNomarl';
    };
    export function getConfig() {
        let agreementInfo = G_StorageManager.load('agreement');
        if (!G_ConfigManager.isDalanVersion() && agreementInfo != null && agreementInfo[AgreementSetting.getPrivacyWords()] == null) {
            agreementInfo = null;
        }
        if (!agreementInfo) {
            agreementInfo = {};
            agreementInfo['check'] = false;
            if (G_ConfigManager.isDalanVersion()) {
                agreementInfo[AgreementSetting.getPrivacyWords()] = false;
            } else {
                agreementInfo[AgreementSetting.getPrivacyWords()] = false;
            }
        }
        return agreementInfo;
    };
    export function saveAllAgreementIsCheck(check) {
        let agreementInfo = AgreementSetting.getConfig();
        for (let k in agreementInfo) {
            let v = agreementInfo[k];
            agreementInfo[k] = check;
        }
        G_StorageManager.save('agreement', agreementInfo);
    };
    export function isAgreementCheckMayLogin() {
        if (G_ConfigManager.isDalanVersion()) {
            return AgreementSetting.isAllAgreementCheck();
        } else {
            let agreementInfo = AgreementSetting.getConfig();
            let agree = true;
            for (let k in agreementInfo) {
                let v = agreementInfo[k];
                if (k != AgreementSetting.getPrivacyWords()) {
                    agree = agree && AgreementSetting.isAgreementCheck(k);
                }
            }
            return agree;
        }
    };
    export function isAllAgreementCheck() {
        let agreementInfo = AgreementSetting.getConfig();
        let agree = true;
        for (let k in agreementInfo) {
            let v = agreementInfo[k];
            agree = agree && AgreementSetting.isAgreementCheck(k);
        }
        return agree;
    };
    export function isAgreementCheck(agreementName) {
        let agreementInfo = AgreementSetting.getConfig();
        // console.log(agreementInfo);
        if (!agreementName) {
            return false;
        }
        if (agreementInfo[agreementName] == null) {
            return false;
        }
        return agreementInfo[agreementName];
    };
    export function saveAgreementIsCheck(check, agreementName) {
        if (agreementName) {
            let agreementInfo = AgreementSetting.getConfig();
            agreementInfo[agreementName] = check;
            G_StorageManager.save('agreement', agreementInfo);
        }
    };
}