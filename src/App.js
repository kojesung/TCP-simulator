import InputParser from './InputParser.js';
import BasicSimulator from './BasicSimulator.js';
import FlowControlSimulator from './FlowControlSimulator.js';
import CongestionControlSimulator from './CongestionControlSimulator.js';
import InputView from './InputVIew.js';

class App {
    async run() {
        try {
            const config = await this.#getInputConfig();
            const simulator = this.#createSimulator(config);

            simulator.planSimulation();
            await simulator.run();
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async #getInputConfig() {
        const config = {};

        // 공통 입력
        config.dataSize = InputParser.parseDataSize(await InputView.readTotalDataSize());

        config.rtt = InputParser.parseRTT(await InputView.readRTT());

        config.lossRate = InputParser.parseLossRate(await InputView.readLossRate());

        config.mode = InputParser.parseSimulationMode(await InputView.readSimulationMode());

        config.speed = InputParser.parseSimulationSpeed(await InputView.readSimulationSpeed());

        // 모드별 추가 입력
        if (config.mode === 'FLOW_CONTROL') {
            config.rwnd = InputParser.parseReceiverWindowSize(await InputView.readReceiverWindowSize());

            config.receiverSpeed = InputParser.parseReceiverSpeed(await InputView.readReceiverSpeed());
        }

        if (config.mode === 'CONGESTION_CONTROL') {
            config.initialCwnd = InputParser.parseInitialCwnd(await InputView.readInitialCwnd());
        }

        return config;
    }

    #createSimulator(config) {
        const { dataSize, lossRate, rtt, speed, mode } = config;

        if (mode === 'BASIC') {
            return new BasicSimulator(dataSize, lossRate, rtt, speed);
        }

        if (mode === 'FLOW_CONTROL') {
            return new FlowControlSimulator(dataSize, lossRate, rtt, speed, config.rwnd, config.receiverSpeed);
        }

        if (mode === 'CONGESTION_CONTROL') {
            return new CongestionControlSimulator(dataSize, lossRate, rtt, speed, config.initialCwnd);
        }

        throw new Error('[ERROR] 알 수 없는 시뮬레이션 모드입니다.');
    }
}

export default App;
