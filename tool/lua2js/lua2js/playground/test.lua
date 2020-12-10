local a, b = 1
local a = {['a'] = 1,1, 'a', 
    b = function()
    end,
    [b]= 2
}
local b = nil
c = 'c'
if b==2 then
    print(a['a'])
end

a.b.c = 1
-- a.b = 2
-- a['c'] = 3

-- local function c()

-- end

function a:test()
    print(b)
    return self.__index;
end

for i = 1, 10, 2 do
    
end

for key, value in ipairs(t), pairs(b) do
    
end

for key, value in pairs(t) do
    
end

if true then
    print(a)
elseif true then
    print(b)
else 
    print(c)
end