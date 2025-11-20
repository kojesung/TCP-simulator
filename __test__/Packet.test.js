import { describe, test, expect } from '@jest/globals';
import Packet from '../src/Packet.js';

describe('Packet', () => {
    test('패킷 생성 시 올바른 값들이 설정된다', () => {
        const packet = new Packet(1, 1000, 1499);

        expect(packet.id).toBe(1);
        expect(packet.startSeq).toBe(1000);
        expect(packet.endSeq).toBe(1499);
        expect(packet.packetSize).toBe(500);
    });

    test('packetSize는 endSeq - startSeq + 1이다', () => {
        const packet = new Packet(1, 100, 200);

        expect(packet.packetSize).toBe(101);
    });

    test('getPacketInfo는 올바른 포맷의 문자열을 반환한다', () => {
        const packet = new Packet(5, 1000, 2459);
        const info = packet.getPacketInfo();

        expect(info).toBe('Packet#5 (seq#1000 - 2459) packet size: 1460');
    });

    test('단일 바이트 패킷 생성이 가능하다', () => {
        const packet = new Packet(1, 100, 100);

        expect(packet.packetSize).toBe(1);
    });
});
