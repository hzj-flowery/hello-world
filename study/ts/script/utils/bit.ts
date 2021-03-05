import { table } from "./table";

export namespace bit {
    export function tobits(mask): (1 | 0)[] {
        let array = [];
        while (mask > 0) {
            array.push(mask & 1);
            mask = mask >> 1;
        }

        return array;
    }
    export function check_int(n) {
        if (n - Math.floor(n) > 0)
            cc.error("trying to use bitwise operation on non-integer!")
    }
    export function bit_and(m, n) {
        let tbl_m = to_bits(m)
        let tbl_n = to_bits(n)
        expand(tbl_m, tbl_n)

        let tbl = {}
        let rslt = Math.max(table.getn(tbl_m), table.getn(tbl_n))
        for (let i = 1; i <= rslt; i++) {
            if (tbl_m[i] == 0 || tbl_n[i] == 0)
                tbl[i] = 0
            else
                tbl[i] = 1
        }

        return tbl_to_number(tbl)
    }
    export function to_bits(n) {
        check_int(n);
        if (n < 0)
            // negative
            return to_bits(bit.bit_not(Math.abs(n)) + 1)
        // to bits table
        let tbl = {}
        let cnt = 1
        do {
            let last = n % 2;
            if (last == 1)
                tbl[cnt] = 1
            else
                tbl[cnt] = 0

            n = (n - last) / 2
            cnt = cnt + 1
        } while (n > 0);
        return tbl;
    }
    export function tbl_to_number(tbl) {
        let n = table.getn(tbl)

        let rslt = 0
        let power = 1
        for (let i = 1; i <= n; i++) {
            rslt = rslt + tbl[i] * power;
            power = power * 2;
        }
        return rslt
    }
    export function bit_or(m, n) {
        let tbl_m = to_bits(m)
        let tbl_n = to_bits(n)
        expand(tbl_m, tbl_n)

        let tbl = {}
        let rslt = Math.max(table.getn(tbl_m), table.getn(tbl_n))
        for (let i = 1; i <= rslt; i++)
            if (tbl_m[i] == 0 && tbl_n[i] == 0)
                tbl[i] = 0
            else
                tbl[i] = 1

        return tbl_to_number(tbl)
    }
    export function bit_not(n) {
        let tbl = to_bits(n)
        let size = Math.max(table.getn(tbl), 32)
        for (let i = 1; i <= size; i++) {
            if (tbl[i] == 1)
                tbl[i] = 0
            else
                tbl[i] = 1
        }
        return tbl_to_number(tbl)
    }
    export function expand(tbl_m, tbl_n) {
        let big = {}
        let small = {}
        if (table.getn(tbl_m) > table.getn(tbl_n)) {

            big = tbl_m
            small = tbl_n
        }
        else {
            big = tbl_n
            small = tbl_m
        }
        // expand small
        for (let i = table.getn(small) + 1; i <= table.getn(big); i++) {
            small[i] = 0
        }
    }
    export function brshift(n, bits) {
        let high_bit = 0
        if (n < 0) {
            // negative
            n = bit_not(Math.abs(n)) + 1
            high_bit = 2147483648 // 0x80000000;
        }
        for (let i = 1; i <= bits; i++) {
            n = n / 2;
            n = bit_or(Math.floor(n), high_bit)
        }
        return Math.floor(n)
    }
}