import { describe, test, expect } from '@jest/globals';
import RandomGenerator from '../src/RandomGenerator.js';

describe('RandomGenerator', () => {
    describe('isPacketLost', () => {
        test('손실률 0%일 때 항상 false를 반환한다', () => {
            const results = Array.from({ length: 100 }, () => RandomGenerator.isPacketLost(0));

            expect(results.every((result) => result === false)).toBe(true);
        });

        test('손실률 100%일 때 항상 true를 반환한다', () => {
            const results = Array.from({ length: 100 }, () => RandomGenerator.isPacketLost(100));

            expect(results.every((result) => result === true)).toBe(true);
        });

        test('손실률 50%일 때 true와 false가 모두 나온다', () => {
            const results = Array.from({ length: 1000 }, () => RandomGenerator.isPacketLost(50));

            const trueCount = results.filter((result) => result === true).length;
            console.log(trueCount);
            expect(trueCount).toBeGreaterThan(400);
            expect(trueCount).toBeLessThan(600);
        });

        test('boolean 값을 반환한다', () => {
            const result = RandomGenerator.isPacketLost(50);
            expect(typeof result).toBe('boolean');
        });
    });
});
