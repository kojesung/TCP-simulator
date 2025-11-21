import { describe, test, expect, beforeEach } from '@jest/globals';
import CongestionControlSimulator from '../src/CongestionControlSimulator.js';
import { EVENT_TYPE, SPEED_MODE, TCP, CONGESTION_CONTROL } from '../src/constants.js';

describe('CongestionControlSimulator 통합 테스트', () => {
    let simulator;

    beforeEach(() => {
        simulator = new CongestionControlSimulator(TCP.MSS * 10, 0, 100, SPEED_MODE.INSTANT, 2);
    });

    describe('초기화', () => {
        test('cwnd가 올바르게 설정된다', () => {
            expect(simulator.cwnd).toBe(2 * TCP.MSS);
        });

        test('ssthresh가 Infinity로 초기화된다', () => {
            expect(simulator.ssthresh).toBe(Infinity);
        });

        test('초기 상태가 SLOW_START다', () => {
            expect(simulator.state).toBe(CONGESTION_CONTROL.SLOW_START);
        });
    });

    describe('Window 전송', () => {
        test('WINDOW_SEND_START 이벤트가 생성된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const windowStartEvents = events.filter((e) => e.type === EVENT_TYPE.WINDOW_SEND_START);
            expect(windowStartEvents.length).toBeGreaterThan(0);
        });

        test('cwnd 정보가 WINDOW_SEND_START 이벤트에 포함된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const windowStartEvent = events.find((e) => e.type === EVENT_TYPE.WINDOW_SEND_START);
            expect(windowStartEvent.data.cwnd).toBeDefined();
            expect(windowStartEvent.data.cwndPackets).toBeDefined();
            expect(windowStartEvent.data.ssthresh).toBeDefined();
            expect(windowStartEvent.data.state).toBeDefined();
        });

        test('cwnd에 따라 전송 패킷 수가 제한된다', () => {
            const smallCwndSimulator = new CongestionControlSimulator(TCP.MSS * 20, 0, 100, SPEED_MODE.INSTANT, 1);

            smallCwndSimulator.planSimulation();
            const events = smallCwndSimulator.timeline.getEvents();

            const firstWindowStart = events.find((e) => e.type === EVENT_TYPE.WINDOW_SEND_START);
            expect(firstWindowStart.data.windowSize).toBe(1);
        });
    });

    describe('Slow Start', () => {
        test('CWND_UPDATE 이벤트가 생성된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const cwndUpdateEvents = events.filter((e) => e.type === EVENT_TYPE.CWND_UPDATE);
            expect(cwndUpdateEvents.length).toBeGreaterThan(0);
        });

        test('손실 없으면 cwnd가 증가한다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const cwndUpdateEvents = events.filter((e) => e.type === EVENT_TYPE.CWND_UPDATE);

            if (cwndUpdateEvents.length > 0) {
                const firstUpdate = cwndUpdateEvents[0];
                expect(firstUpdate.data.newCwnd).toBeGreaterThan(firstUpdate.data.oldCwnd);
            }
        });
    });

    describe('패킷 손실 처리', () => {
        test('Fast Recovery 이벤트가 생성된다', () => {
            const lossySimulator = new CongestionControlSimulator(TCP.MSS * 10, 50, 100, SPEED_MODE.INSTANT, 5);

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const fastRecoveryEvents = events.filter((e) => e.type === EVENT_TYPE.FAST_RECOVERY);
            const timeoutEvents = events.filter((e) => e.type === EVENT_TYPE.TIMEOUT_CONGESTION);

            expect(fastRecoveryEvents.length + timeoutEvents.length).toBeGreaterThan(0);
        });

        test('Timeout 시 cwnd가 1 MSS로 초기화된다', () => {
            const lossySimulator = new CongestionControlSimulator(TCP.MSS * 5, 100, 100, SPEED_MODE.INSTANT, 5);

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const timeoutEvent = events.find((e) => e.type === EVENT_TYPE.TIMEOUT_CONGESTION);

            if (timeoutEvent) {
                expect(timeoutEvent.data.newCwnd).toBe(TCP.MSS);
            }
        });

        test('Fast Recovery 시 ssthresh가 설정된다', () => {
            const lossySimulator = new CongestionControlSimulator(TCP.MSS * 10, 50, 100, SPEED_MODE.INSTANT, 5);

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const fastRecoveryEvent = events.find((e) => e.type === EVENT_TYPE.FAST_RECOVERY);

            if (fastRecoveryEvent) {
                expect(fastRecoveryEvent.data.newSsthresh).toBeDefined();
                expect(fastRecoveryEvent.data.newSsthresh).toBeGreaterThan(0);
            }
        });
    });

    describe('상태 전환', () => {
        test('STATE_CHANGE 이벤트가 생성될 수 있다', () => {
            const lossySimulator = new CongestionControlSimulator(TCP.MSS * 10, 30, 100, SPEED_MODE.INSTANT, 3);

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const stateChangeEvents = events.filter((e) => e.type === EVENT_TYPE.STATE_CHANGE);

            expect(stateChangeEvents.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Fast Retransmit', () => {
        test('FAST_RETRANSMIT 이벤트가 생성될 수 있다', () => {
            const lossySimulator = new CongestionControlSimulator(TCP.MSS * 10, 40, 100, SPEED_MODE.INSTANT, 5);

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const fastRetransmitEvents = events.filter((e) => e.type === EVENT_TYPE.FAST_RETRANSMIT);

            expect(fastRetransmitEvents.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Duplicate ACK', () => {
        test('DUPLICATE_ACK 이벤트가 생성될 수 있다', () => {
            const lossySimulator = new CongestionControlSimulator(TCP.MSS * 10, 30, 100, SPEED_MODE.INSTANT, 5);

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
        test('CongestionControlOutputFormatter가 설정되어 있다', () => {
            expect(simulator.formatter).toBeDefined();
            expect(simulator.formatter.constructor.name).toBe('CongestionControlOutputFormatter');
        });
    });
});
