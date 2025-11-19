import { SPEED_MODE, TCP } from './constants.js';

class InputParser {
    static parseDataSize(input) {
        const trimmed = input.trim();

        if (trimmed === '') {
            throw new Error('[ERROR] 데이터 크기를 입력해주세요.');
        }

        const dataSize = Number(trimmed);

        if (isNaN(dataSize)) {
            throw new Error('[ERROR] 데이터 크기는 숫자여야 합니다.');
        }

        if (dataSize <= 0) {
            throw new Error('[ERROR] 데이터 크기는 0보다 커야 합니다.');
        }

        if (!Number.isInteger(dataSize)) {
            throw new Error('[ERROR] 데이터 크기는 정수여야 합니다.');
        }

        return dataSize;
    }

    static parseRTT(input) {
        const trimmed = input.trim();

        if (trimmed === '') {
            throw new Error('[ERROR] RTT를 입력해주세요.');
        }

        const rtt = Number(trimmed);

        if (isNaN(rtt)) {
            throw new Error('[ERROR] RTT는 숫자여야 합니다.');
        }

        if (rtt <= 0) {
            throw new Error('[ERROR] RTT는 0보다 커야 합니다.');
        }

        return rtt;
    }

    static parseLossRate(input) {
        const trimmed = input.trim();

        if (trimmed === '') {
            throw new Error('[ERROR] 패킷 손실 확률을 입력해주세요.');
        }

        const lossRate = Number(trimmed);

        if (isNaN(lossRate)) {
            throw new Error('[ERROR] 패킷 손실 확률은 숫자여야 합니다.');
        }

        if (lossRate < 0) {
            throw new Error('[ERROR] 패킷 손실 확률은 0 이상이어야 합니다.');
        }

        if (lossRate > 100) {
            throw new Error('[ERROR] 패킷 손실 확률은 100 이하여야 합니다.');
        }

        return lossRate;
    }

    static parseSimulationMode(input) {
        const trimmed = input.trim();

        if (trimmed === '') {
            throw new Error('[ERROR] 시뮬레이션 모드를 입력해주세요.');
        }

        const modeIndex = Number(trimmed);

        if (isNaN(modeIndex)) {
            throw new Error('[ERROR] 시뮬레이션 모드는 숫자여야 합니다.');
        }

        if (!Number.isInteger(modeIndex)) {
            throw new Error('[ERROR] 시뮬레이션 모드는 정수여야 합니다.');
        }

        const modes = ['BASIC', 'FLOW_CONTROL', 'CONGESTION_CONTROL'];
        const actualIndex = modeIndex - 1;

        if (actualIndex < 0 || actualIndex >= modes.length) {
            throw new Error('[ERROR] 시뮬레이션 모드는 1, 2, 3 중 하나를 입력해주세요.');
        }

        return modes[actualIndex];
    }

    static parseSimulationSpeed(input) {
        const trimmed = input.trim();

        if (trimmed === '') {
            throw new Error('[ERROR] 시뮬레이션 속도를 입력해주세요.');
        }

        const speedIndex = Number(trimmed);

        if (isNaN(speedIndex)) {
            throw new Error('[ERROR] 시뮬레이션 속도는 숫자여야 합니다.');
        }

        if (!Number.isInteger(speedIndex)) {
            throw new Error('[ERROR] 시뮬레이션 속도는 정수여야 합니다.');
        }

        const speeds = ['INSTANT', 'FAST', 'SLOW'];
        const actualIndex = speedIndex - 1;

        if (actualIndex < 0 || actualIndex >= speeds.length) {
            throw new Error('[ERROR] 시뮬레이션 속도는 1, 2, 3 중 하나를 입력해주세요.');
        }

        return SPEED_MODE[speeds[actualIndex]];
    }

    static parseReceiverWindowSize(input) {
        const trimmed = input.trim();

        if (trimmed === '') {
            throw new Error('[ERROR] Receiver window size를 입력해주세요.');
        }

        const packets = Number(trimmed);

        if (isNaN(packets)) {
            throw new Error('[ERROR] Receiver window size는 숫자여야 합니다.');
        }

        if (packets <= 0) {
            throw new Error('[ERROR] Receiver window size는 0보다 커야 합니다.');
        }

        if (!Number.isInteger(packets)) {
            throw new Error('[ERROR] Receiver window size는 정수여야 합니다.');
        }

        return packets * TCP.MSS;
    }

    static parseReceiverSpeed(input) {
        const trimmed = input.trim();

        if (trimmed === '') {
            throw new Error('[ERROR] Receiver 처리 속도를 입력해주세요.');
        }

        const packetsPerRTT = Number(trimmed);

        if (isNaN(packetsPerRTT)) {
            throw new Error('[ERROR] Receiver 처리 속도는 숫자여야 합니다.');
        }

        if (packetsPerRTT <= 0) {
            throw new Error('[ERROR] Receiver 처리 속도는 0보다 커야 합니다.');
        }

        if (!Number.isInteger(packetsPerRTT)) {
            throw new Error('[ERROR] Receiver 처리 속도는 정수여야 합니다.');
        }

        return packetsPerRTT * TCP.MSS;
    }

    static parseInitialCwnd(input) {
        const trimmed = input.trim();

        if (trimmed === '') {
            throw new Error('[ERROR] 초기 cwnd를 입력해주세요.');
        }

        const packets = Number(trimmed);

        if (isNaN(packets)) {
            throw new Error('[ERROR] 초기 cwnd는 숫자여야 합니다.');
        }

        if (packets <= 0) {
            throw new Error('[ERROR] 초기 cwnd는 0보다 커야 합니다.');
        }

        if (!Number.isInteger(packets)) {
            throw new Error('[ERROR] 초기 cwnd는 정수여야 합니다.');
        }

        return packets;
    }
}

export default InputParser;
