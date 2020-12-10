export const enum VariableType {
    Null = 1,
    String = 1 << 1,
    Number = 1 << 2,
    Table = 1 <<3,
    Array = 1 << 4,
    Function = 1 << 5,
    Class = 1 << 6,
    Instance = 1 << 7,
    Unknown = 1 << 8
}