import { describe, test, expect, beforeEach } from '@jest/globals';
import BasicSimulator from '../src/BasicSimulator.js';
import { EVENT_TYPE, SPEED_MODE, TCP } from '../src/constants.js';

describe('BasicSimulator 통합 테스트', () => {
    let simulator;

    beforeEach(() => {
        simulator = new BasicSimulator(TCP.MSS * 3, 0, 100, SPEED_MODE.INSTANT);
    });

    describe('planSimulation', () => {
        test('시뮬레이션 계획 시 이벤트들이 생성된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            expect(events.length).toBeGreaterThan(0);
        });

        test('3-way handshake 이벤트가 포함된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const synSend = events.find((e) => e.type === EVENT_TYPE.SYN_SEND);
            const synAckArrive = events.find((e) => e.type === EVENT_TYPE.SYN_ACK_ARRIVE);
            const ackSend = events.find((e) => e.type === EVENT_TYPE.ACK_SEND);

            expect(synSend).toBeDefined();
            expect(synAckArrive).toBeDefined();
            expect(ackSend).toBeDefined();
        });

        test('데이터 전송 이벤트가 포함된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const packetSendEvents = events.filter((e) => e.type === EVENT_TYPE.PACKET_SEND);
            expect(packetSendEvents.length).toBe(3);
        });

        test('4-way handshake 이벤트가 포함된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const finSendEvents = events.filter((e) => e.type === EVENT_TYPE.FIN_SEND);
            const finAckEvents = events.filter((e) => e.type === EVENT_TYPE.FIN_ACK_ARRIVE);

            expect(finSendEvents.length).toBe(2);
            expect(finAckEvents.length).toBe(2);
        });

        test('이벤트가 시간 순으로 정렬된다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            for (let i = 1; i < events.length; i++) {
                expect(events[i].time).toBeGreaterThanOrEqual(events[i - 1].time);
            }
        });

        test('패킷이 올바르게 분할된다', () => {
            simulator.planSimulation();

            expect(simulator.packets.length).toBe(3);
            expect(simulator.packets[0].id).toBe(1);
            expect(simulator.packets[1].id).toBe(2);
            expect(simulator.packets[2].id).toBe(3);
        });

        test('ISN이 올바른 범위에 있다', () => {
            simulator.planSimulation();

            expect(simulator.isn).toBeGreaterThanOrEqual(1000);
            expect(simulator.isn).toBeLessThanOrEqual(9999);
        });
    });

    describe('패킷 손실 시뮬레이션', () => {
        test('손실률 100%일 때 모든 패킷에 재전송 이벤트가 생성된다', () => {
            const lossySimulator = new BasicSimulator(TCP.MSS * 2, 100, 100, SPEED_MODE.INSTANT);

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const retransmitEvents = events.filter((e) => e.type === EVENT_TYPE.RETRANSMIT);
            expect(retransmitEvents.length).toBe(2);
        });

        test('손실률 0%일 때 재전송 이벤트가 없다', () => {
            simulator.planSimulation();
            const events = simulator.timeline.getEvents();

            const retransmitEvents = events.filter((e) => e.type === EVENT_TYPE.RETRANSMIT);
            expect(retransmitEvents.length).toBe(0);
        });

        test('타임아웃 이벤트가 재전송 이벤트와 같은 시간에 발생한다', () => {
            const lossySimulator = new BasicSimulator(TCP.MSS * 1, 100, 100, SPEED_MODE.INSTANT);

            lossySimulator.planSimulation();
            const events = lossySimulator.timeline.getEvents();

            const timeoutEvent = events.find((e) => e.type === EVENT_TYPE.TIMEOUT);
            const retransmitEvent = events.find((e) => e.type === EVENT_TYPE.RETRANSMIT);

            expect(timeoutEvent.time).toBe(retransmitEvent.time);
        });
    });

    describe('formatter 통합', () => {
        test('formatter가 null이면 실행해도 에러가 없다', async () => {
            simulator.formatter = null;
            simulator.planSimulation();

            await expect(simulator.run()).resolves.not.toThrow();
        });

        test('formatter가 있으면 format 메서드가 호출된다', async () => {
            let formatCallCount = 0;
            simulator.formatter = {
                format: () => {
                    formatCallCount++;
                    return null;
                },
            };

            simulator.planSimulation();
            await simulator.run();

            expect(formatCallCount).toBeGreaterThan(0);
        });
    });
});
