export const withDefault = <T>(f: () => T, def: T) => {
    try {
        const v = f();
        if (v === undefined || v === null) return def;
        return v;
    } catch (err) {
        return def;
    }
}

withDefault(()=>null, 0)