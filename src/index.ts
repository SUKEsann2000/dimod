import { UnitSchema } from "./UnitSchema.js";
import type { UnitSymbol } from "./UnitSchema.js";

// =================================================================
// 使用例
// 単位計算ライブラリの基本的な使い方を示します。
// =================================================================

// 1. 基本単位のスキーマを定義
// "m" (メートル) の単位スキーマ
const meterSymbol: UnitSymbol = [
    [
        [
            ["m", null] // "m" というシンボル、演算子なし
        ],
        null // 次の項との演算子なし
    ]
];
const meter = new UnitSchema(meterSymbol);

// "s" (秒) の単位スキーマ
const secondSymbol: UnitSymbol = [
    [
        [
            ["s", null] // "s" というシンボル、演算子なし
        ],
        null // 次の項との演算子なし
    ]
];
const second = new UnitSchema(secondSymbol);

// 2. 単位スキーマから単位付きの値を作成
// 10メートル
const length = meter.parse(10);
// 2秒
const time = second.parse(2);

// 3. 値同士の計算
// 速度 = 距離 / 時間
const speed = length.div(time);

// 結果の確認
console.log("--- 速度の計算 ---");
console.log(`計算結果のスキーマ: ${speed.schema.toString()}`); // m/s (簡約化された形式)
console.log(`計算結果の値: ${speed.value}`);             // 5

// 4. 逆の計算
// 距離 = 速度 * 時間
const back = speed.mul(time);

console.log("\n--- 距離の再計算 ---");
console.log(`計算結果のスキーマ: ${back.schema.toString()}`);  // m (簡約化された形式)
console.log(`計算結果の値: ${back.value}`);              // 10

// 5. 加算・減算 (同じ単位同士のみ可能)
const lengthA = meter.parse(5);
const lengthB = meter.parse(3);

const totalLength = meter.add(lengthA, lengthB);
console.log("\n--- 同じ単位の加算 ---");
console.log(`計算結果のスキーマ: ${totalLength.schema.toString()}`); // m
console.log(`計算結果の値: ${totalLength.value}`);             // 8

// 6. 複雑な単位の定義
// "kg*m/s^2" (ニュートン)
const newtonSymbol: UnitSymbol = [
    [
        [
            ["kg", null], // kg
            ["m", null],  // m
            ["s", "/"],   // /s
            ["s", "/"],   // /s
        ],
        null
    ]
];
const newton = new UnitSchema(newtonSymbol);

console.log("\n--- 複雑な単位 ---");
console.log(`ニュートンのスキーマ (簡約後): ${newton.toString()}`); // kg*m*s^-2 (簡約化された形式)
