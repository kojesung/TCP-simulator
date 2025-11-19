import { Console } from '@woowacourse/mission-utils';

class InputView {
    static async readTotalDataSize() {
        return await Console.readLineAsync('전송할 데이터 크기를 입력해주세요 (bytes): ');
    }

    static async readRTT() {
        return await Console.readLineAsync('RTT를 입력해주세요 (ms): ');
    }

    static async readLossRate() {
        return await Console.readLineAsync('패킷 손실 확률을 입력해주세요 (%): ');
    }

    static async readSimulationMode() {
        const message = [
            '시뮬레이션 모드를 선택해주세요.',
            '1. BASIC',
            '2. FLOW_CONTROL',
            '3. CONGESTION_CONTROL',
        ].join('\n');

        return await Console.readLineAsync(message + '\n입력: ');
    }

    static async readSimulationSpeed() {
        const message = ['시뮬레이션 속도를 선택해주세요.', '1. INSTANT', '2. FAST', '3. SLOW'].join('\n');

        return await Console.readLineAsync(message + '\n입력: ');
    }

    static async readReceiverWindowSize() {
        return await Console.readLineAsync('Receiver window size를 입력해주세요 (packets): ');
    }

    static async readReceiverSpeed() {
        return await Console.readLineAsync('Receiver 처리 속도를 입력해주세요 (packets per RTT): ');
    }

    static async readInitialCwnd() {
        return await Console.readLineAsync('초기 cwnd를 입력해주세요 (packets): ');
    }
}

export default InputView;
