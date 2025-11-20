import { describe, test, expect } from '@jest/globals';
import PacketFragments from '../src/PacketFragments.js';
import { TCP } from '../src/constants.js';

describe('PacketFragments', () => {
    describe('getFragmentedPackets', () => {
        test('MSS로 정확히 나누어떨어지는 데이터를 올바르게 분할한다', () => {
            const packets = PacketFragments.getFragmentedPackets(TCP.MSS * 3, 1);

            expect(packets).toHaveLength(3);
            expect(packets[0].startSeq).toBe(1);
            expect(packets[0].endSeq).toBe(TCP.MSS);
            expect(packets[0].packetSize).toBe(TCP.MSS);

            expect(packets[2].startSeq).toBe(TCP.MSS * 2 + 1);
            expect(packets[2].endSeq).toBe(TCP.MSS * 3);
        });

        test('MSS로 나누어떨어지지 않는 데이터를 올바르게 분할한다', () => {
            const dataSize = TCP.MSS * 2 + 500;
            const packets = PacketFragments.getFragmentedPackets(dataSize, 1);

            expect(packets).toHaveLength(3);
            expect(packets[0].packetSize).toBe(TCP.MSS);
            expect(packets[1].packetSize).toBe(TCP.MSS);
            expect(packets[2].packetSize).toBe(500);
        });

        test('MSS보다 작은 데이터는 하나의 패킷으로 생성된다', () => {
            const packets = PacketFragments.getFragmentedPackets(100, 1);

            expect(packets).toHaveLength(1);
            expect(packets[0].packetSize).toBe(100);
        });

        test('시작 시퀀스 넘버를 지정할 수 있다', () => {
            const packets = PacketFragments.getFragmentedPackets(TCP.MSS * 2, 5000);

            expect(packets[0].startSeq).toBe(5000);
            expect(packets[0].endSeq).toBe(5000 + TCP.MSS - 1);
            expect(packets[1].startSeq).toBe(5000 + TCP.MSS);
        });

        test('패킷 ID가 1부터 순차적으로 증가한다', () => {
            const packets = PacketFragments.getFragmentedPackets(TCP.MSS * 5, 1);

            expect(packets[0].id).toBe(1);
            expect(packets[1].id).toBe(2);
            expect(packets[4].id).toBe(5);
        });

        test('10000 bytes는 7개의 패킷으로 분할된다', () => {
            const packets = PacketFragments.getFragmentedPackets(10000, 1);

            expect(packets).toHaveLength(7);

            for (let i = 0; i < 6; i++) {
                expect(packets[i].packetSize).toBe(TCP.MSS);
            }

            expect(packets[6].packetSize).toBe(10000 - TCP.MSS * 6);
        });
    });
});
