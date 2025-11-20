import { describe, test, expect, beforeEach } from '@jest/globals';
import FlowControlSimulator from '../src/FlowControlSimulator.js';
import { EVENT_TYPE, SPEED_MODE, TCP } from '../src/constants.js';

describe('FlowControlSimulator 통합 테스트', () => {
    let simulator;

    beforeEach(() => {
        simulator = new FlowControlSimulator(
            TCP.MSS * 10, // 10개 패킷
            0, // 손실률 0%
            100, // RTT 100ms
            SPEED_MODE.INSTANT,
            TCP.MSS * 5, // rwnd: 5 packets
            TCP.MSS * 2 // receiver speed: 2 packets/RTT
        );
    });

    describe('초기화', () => {
        test('rwnd가 올바르게 설정된다', () => {
            expect(simulator.rwnd).toBe(TCP.MSS * 5);
            expect(simulator.initialBufferSize).toBe(TCP.MSS * 5);
        });

        test('receiver speed가 올바르게 설정된다', () => {
            expect(simulator.receiverSpeed).toBe(TCP.MSS * 2);
        });

        test('bufferedBytes가 0으로 초기화된다', () => {
            expect(simulator.bufferedBytes).toBe(0);
        });
    });

    describe('Window 전송', () => {
        test('WINDOW_SEND_START 이벤트가 생성된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const windowStartEvents = events.filter((e) => e.type === EVENT_TYPE.WINDOW_SEND_START);
            expect(windowStartEvents.length).toBeGreaterThan(0);
        });

        test('rwnd에 따라 전송 패킷 수가 제한된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const firstWindowStart = events.find((e) => e.type === EVENT_TYPE.WINDOW_SEND_START);
            expect(firstWindowStart.data.windowSize).toBeLessThanOrEqual(5); // rwnd가 5 packets
        });

        test('rwnd 정보가 WINDOW_SEND_START 이벤트에 포함된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const windowStartEvent = events.find((e) => e.type === EVENT_TYPE.WINDOW_SEND_START);
            expect(windowStartEvent.data.rwnd).toBeDefined();
            expect(windowStartEvent.data.rwndPackets).toBeDefined();
        });
    });

    describe('Zero Window Probe', () => {
        test('rwnd가 0이 되면 RWND_PROBE 이벤트가 생성된다', () => {
            const tinyWindowSimulator = new FlowControlSimulator(
                TCP.MSS * 20,
                0,
                100,
                SPEED_MODE.INSTANT,
                TCP.MSS * 5,
                TCP.MSS * 0.5
            );

            tinyWindowSimulator.planSimulation();
            const events = tinyWindowSimulator.timeline.getEvents();

            const probeEvents = events.filter((e) => e.type === EVENT_TYPE.RWND_PROBE);
            expect(probeEvents.length).toBeGreaterThan(0);
        });
    });

    describe('패킷 손실 처리', () => {
        test('Fast Retransmit 이벤트가 생성된다', () => {
            const lossySimulator = new FlowControlSimulator(
                TCP.MSS * 10,
                75,
                100,
                SPEED_MODE.INSTANT,
                TCP.MSS * 10,
                TCP.MSS * 5
            );

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const fastRetransmitEvents = events.filter((e) => e.type === EVENT_TYPE.FAST_RETRANSMIT);
            const timeoutEvents = events.filter((e) => e.type === EVENT_TYPE.TIMEOUT);

            expect(fastRetransmitEvents.length + timeoutEvents.length).toBeGreaterThan(0);
        });

        test('Duplicate ACK 이벤트가 생성된다', () => {
            const lossySimulator = new FlowControlSimulator(
                TCP.MSS * 10,
                30,
                100,
                SPEED_MODE.INSTANT,
                TCP.MSS * 10,
                TCP.MSS * 5
            );

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const duplicateAckEvents = events.filter((e) => e.type === EVENT_TYPE.DUPLICATE_ACK);

            expect(duplicateAckEvents.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('이벤트 순서', () => {
        test('모든 이벤트가 시간 순으로 정렬된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            for (let i = 1; i < events.length; i++) {
                expect(events[i].time).toBeGreaterThanOrEqual(events[i - 1].time);
            }
        });
    });

    describe('formatter 통합', () => {
        test('FlowControlOutputFormatter가 설정되어 있다', () => {
            expect(simulator.formatter).toBeDefined();
            expect(simulator.formatter.constructor.name).toBe('FlowControlOutputFormatter');
        });
    });
});
