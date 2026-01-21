// =====================
// 型定義
// =====================

// 1項の中の要素（積・商）
export type TermOp = "*" | "/" | null;

// 1項（掛け算・割り算の列）＋ 次の項との + / -
export type UnitTerm = [
    [symbol: string, operation: TermOp][],
    "+" | "-" | null
];

// 単位式全体（和・差の列）
export type UnitSymbol = UnitTerm[];

// =====================
// 値オブジェクト
// =====================

export class UnitValue<T extends UnitSchema> {
    constructor(
        readonly value: number,
        readonly schema: T
    ) {}

    mul<U extends UnitSchema>(other: UnitValue<U>) {
        // スキーマ同士を掛け算する
        const newSchema = this.schema.mul(other.schema);
        return new UnitValue(this.value * other.value, newSchema);
    }

    div<U extends UnitSchema>(other: UnitValue<U>) {
        // スキーマ同士を割り算する
        const newSchema = this.schema.div(other.schema);
        return new UnitValue(this.value / other.value, newSchema);
    }
}

// =====================
// 単位スキーマ
// =====================

export class UnitSchema {
    constructor(
        readonly symbol: UnitSymbol
    ) {}

    // 掛け算：項 × 項（分配はしない）
    mul(other: UnitSchema) {
        const result: UnitSymbol = [];

        for (const [termsA] of this.symbol) {
            for (const [termsB] of other.symbol) {
                result.push([
                    [
                        ...termsA,
                        ...termsB.map(([s]) => [s, "*"] as [string, TermOp])
                    ],
                    null
                ]);
            }
        }

        return new UnitSchema(result).simplify();
    }

    // 割り算：右側を逆数にする
    div(other: UnitSchema) {
        const result: UnitSymbol = [];

        for (const [termsA] of this.symbol) {
            for (const [termsB] of other.symbol) {
                result.push([
                    [
                        ...termsA,
                        ...termsB.map(([s]) => [s, "/"] as [string, TermOp])
                    ],
                    null
                ]);
            }
        }

        return new UnitSchema(result).simplify();
    }

    // 簡約（項ごとに指数をまとめる）
    simplify() {
        const simplified: UnitSymbol = [];
    
        for (const [terms, pm] of this.symbol) {
            const count: Record<string, number> = {};
    
            for (const [sym, op] of terms) {
                // sym を unit + exponent に分解
                const match = sym.match(/^([a-z]+)(?:\^(-?\d+))?$/);
                if (!match) continue;
    
                const unit = match[1];
                const baseExp = match[2] ? parseInt(match[2], 10) : 1;
    
                let exp = baseExp;
                if (op === "/") exp = -exp;
    
                count[unit!] = (count[unit!] || 0) + exp;
            }
    
            const newTerms: [string, TermOp][] = [];
    
            for (const [u, e] of Object.entries(count)) {
                if (e === 0) continue;
                if (e === 1) newTerms.push([u, null]);
                else newTerms.push([`${u}^${e}`, null]);
            }
    
            simplified.push([newTerms, pm]);
        }
    
        return new UnitSchema(simplified);
    }    

    parse(value: number) {
        if (!Number.isFinite(value)) throw new Error("Invalid input");
        return new UnitValue(value, this);
    }

    add(a: UnitValue<this>, b: UnitValue<this>) {
        if (a.schema !== this || b.schema !== this)
            throw new Error("Incompatible units");
        return new UnitValue(a.value + b.value, this);
    }

    sub(a: UnitValue<this>, b: UnitValue<this>) {
        if (a.schema !== this || b.schema !== this)
            throw new Error("Incompatible units");
        return new UnitValue(a.value - b.value, this);
    }

    toString() {
        return this.symbol
            .map(([terms, pm]) => {
                const body = terms
                    .map(([s, op]) => (op ? `${op}${s}` : s))
                    .join("");
                return body + (pm ?? "");
            })
            .join("");
    }
}

// =====================
// 使用例
// =====================

const meter = new UnitSchema([
    [
        [
            [
                "aaa",
                null
            ]
        ],
        "+",
    ],
    [
        [
            [
                "m",
                null
            ]
        ],
        null
    ]
]);

const second = new UnitSchema([
    [
        [["s", null]],
        null
    ]
]);

const speed = meter.parse(10).div(second.parse(2));

console.log(speed.schema.toString()); // m/s
console.log(speed.value);             // 5

const back = speed.mul(second.parse(2));

console.log(back.schema.toString());  // m
console.log(back.value);              // 10
