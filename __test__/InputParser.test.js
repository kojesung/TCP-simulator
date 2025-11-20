import { describe, test, expect } from '@jest/globals';
import InputParser from '../src/InputParser.js';
import { SPEED_MODE, TCP } from '../src/constants.js';

describe('InputParser', () => {
    describe('parseDataSize', () => {
        test('유효한 양수를 파싱한다', () => {
            expect(InputParser.parseDataSize('10000')).toBe(10000);
            expect(InputParser.parseDataSize('1')).toBe(1);
        });

        test('앞뒤 공백을 제거한다', () => {
            expect(InputParser.parseDataSize('  10000  ')).toBe(10000);
        });

        test('빈 문자열에 대해 에러를 던진다', () => {
            expect(() => InputParser.parseDataSize('')).toThrow('[ERROR] 데이터 크기를 입력해주세요.');
            expect(() => InputParser.parseDataSize('   ')).toThrow('[ERROR] 데이터 크기를 입력해주세요.');
        });

        test('숫자가 아닌 값에 대해 에러를 던진다', () => {
            expect(() => InputParser.parseDataSize('abc')).toThrow('[ERROR] 데이터 크기는 숫자여야 합니다.');
        });

        test('0 이하의 값에 대해 에러를 던진다', () => {
            expect(() => InputParser.parseDataSize('0')).toThrow('[ERROR] 데이터 크기는 0보다 커야 합니다.');
            expect(() => InputParser.parseDataSize('-100')).toThrow('[ERROR] 데이터 크기는 0보다 커야 합니다.');
        });

        test('정수가 아닌 값에 대해 에러를 던진다', () => {
            expect(() => InputParser.parseDataSize('10.5')).toThrow('[ERROR] 데이터 크기는 정수여야 합니다.');
        });
    });

    describe('parseSimulationMode', () => {
        test('1, 2, 3을 올바른 모드로 변환한다', () => {
            expect(InputParser.parseSimulationMode('1')).toBe('BASIC');
            expect(InputParser.parseSimulationMode('2')).toBe('FLOW_CONTROL');
            expect(InputParser.parseSimulationMode('3')).toBe('CONGESTION_CONTROL');
        });

        test('범위를 벗어난 값에 대해 에러를 던진다', () => {
            expect(() => InputParser.parseSimulationMode('0')).toThrow();
            expect(() => InputParser.parseSimulationMode('4')).toThrow();
        });
    });

    describe('parseSimulationSpeed', () => {
        test('1, 2, 3을 올바른 속도 모드로 변환한다', () => {
            expect(InputParser.parseSimulationSpeed('1')).toBe(SPEED_MODE.INSTANT);
            expect(InputParser.parseSimulationSpeed('2')).toBe(SPEED_MODE.FAST);
            expect(InputParser.parseSimulationSpeed('3')).toBe(SPEED_MODE.SLOW);
        });
    });

    describe('parseReceiverWindowSize', () => {
        test('패킷 수를 바이트로 변환한다', () => {
            expect(InputParser.parseReceiverWindowSize('10')).toBe(10 * TCP.MSS);
            expect(InputParser.parseReceiverWindowSize('1')).toBe(TCP.MSS);
        });

        test('유효하지 않은 값에 대해 에러를 던진다', () => {
            expect(() => InputParser.parseReceiverWindowSize('0')).toThrow();
            expect(() => InputParser.parseReceiverWindowSize('-1')).toThrow();
        });
    });
});
