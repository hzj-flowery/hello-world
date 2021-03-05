local BattleHelper = {}

--统一处理damageInfo, 返回血量，护盾，显示
function BattleHelper.parseDamage(damageInfo)
-- local Damage = {
--     type = 0, --伤害类型, 1 扣血 2 加血
--     value = 0, --伤害真实数值
--     showValue = 0, --展示数量
--     pType = 0, --护盾加减类型, 1 扣，2 加
--     protect = 0 --护盾增加或者减少（根据type）
-- }
    local hpValue = damageInfo.value or 0
    local protectValue = damageInfo.protect or 0
    local showValue = damageInfo.showValue or 0
    if damageInfo.type == 1 then 
        hpValue = -hpValue
        showValue = -showValue
    end
    if damageInfo.pType == 1 then 
        protectValue = -protectValue
    end

    return hpValue, protectValue, showValue
end

return BattleHelper
