
local AgreementSetting = {}


function AgreementSetting.getPrivacyWords()
    if  G_ConfigManager:isDalanVersion() then
        return "privacy"
    end

    return "privacyNomarl"
end

function AgreementSetting.getConfig()
    local agreementInfo = G_StorageManager:load("agreement")

    local versionFile = cc.FileUtils:getInstance():getStringFromFile("res/secret/version")
    local versionNum = 0
    if versionFile ~= nil then
        local jsonFile = json.decode(versionFile)
        versionNum = jsonFile["version"]
    end

    if not G_ConfigManager:isDalanVersion() and 
       agreementInfo ~= nil and 
       agreementInfo[AgreementSetting.getPrivacyWords()] == nil then
        agreementInfo = nil
    end

    if agreementInfo == nil or agreementInfo["version"] == nil or agreementInfo["version"] < versionNum then
        agreementInfo = nil
    end

    if not agreementInfo then
        --agreementInfo = {check = true,privacy = true}
        agreementInfo={}
        agreementInfo["check"] = false

        if  G_ConfigManager:isDalanVersion() then
            agreementInfo[AgreementSetting.getPrivacyWords()] = false
        else
            agreementInfo[AgreementSetting.getPrivacyWords()] = false
        end
       
    end
    return agreementInfo
end

function AgreementSetting.saveAllAgreementIsCheck(check)
     local agreementInfo = AgreementSetting.getConfig()
     for k,v in pairs(agreementInfo) do
         agreementInfo[k] = check
     end

     local versionFile = cc.FileUtils:getInstance():getStringFromFile("res/secret/version")
     local versionNum = 0
     if versionFile ~= nil then
         local jsonFile = json.decode(versionFile)
         versionNum = jsonFile["version"]
     end

     agreementInfo["version"] = versionNum

     G_StorageManager:save("agreement", agreementInfo)
end

--新增一个判断可以登录的函数
function AgreementSetting.isAgreementCheckMayLogin()
    -- 大蓝版本正常逻辑  其他版本不判断隐私先允许登录
    if  G_ConfigManager:isDalanVersion() then
        return AgreementSetting.isAllAgreementCheck()
    else
        local agreementInfo = AgreementSetting.getConfig()
        local agree = true   
        for k,v in pairs(agreementInfo) do
            if  k ~= AgreementSetting.getPrivacyWords() then
                agree = agree and AgreementSetting.isAgreementCheck(k)
            end
        end
        return agree
    end
    return false
end

function AgreementSetting.isAllAgreementCheck()
    local agreementInfo = AgreementSetting.getConfig()
    local agree = true   
    for k,v in pairs(agreementInfo) do
        agree = agree and AgreementSetting.isAgreementCheck(k)
    end
    return agree
end

function AgreementSetting.isAgreementCheck(agreementName)
    local agreementInfo = AgreementSetting.getConfig()
    dump(agreementInfo)
    if not agreementName then
        return false
    end
    if agreementInfo[agreementName] == nil then
        return false
    end 
    return agreementInfo[agreementName]
end

--
function AgreementSetting.saveAgreementIsCheck(check,agreementName)
    if  agreementName then
        local agreementInfo = AgreementSetting.getConfig()
        agreementInfo[agreementName] = check

        local versionFile = cc.FileUtils:getInstance():getStringFromFile("res/secret/version")
        local versionNum = 0
        if versionFile ~= nil then
            local jsonFile = json.decode(versionFile)
            versionNum = jsonFile["version"]
        end
   
        agreementInfo["version"] = versionNum

        G_StorageManager:save("agreement", agreementInfo)
    end
end


return AgreementSetting