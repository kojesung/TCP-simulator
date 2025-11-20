# 🌐 TCP Simulator

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2020.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**교육용 TCP 프로토콜 시뮬레이터**

TCP의 데이터 전송, Flow Control, Congestion Control을 시각적으로 학습할 수 있는 대화형 시뮬레이터입니다.

[데모 보기](#-demo) • [설치](#-설치) • [사용법](#-사용법) • [기여하기](#-기여하기)

</div>

---

## 📋 목차

-   [특징](#-특징)
-   [Demo](#-demo)
-   [설치](#-설치)
-   [사용법](#-사용법)
-   [시뮬레이션 모드](#-시뮬레이션-모드)
-   [아키텍처](#-아키텍처)
-   [기여하기](#-기여하기)
-   [라이선스](#-라이선스)

## ✨ 특징

-   🎯 **3가지 시뮬레이션 모드**

    -   BASIC: 기본 TCP 데이터 전송
    -   FLOW_CONTROL: Receiver Window 기반 흐름 제어
    -   CONGESTION_CONTROL: cwnd/ssthresh 기반 혼잡 제어

-   📦 **핵심 TCP 메커니즘**

    -   3-way handshake & 4-way handshake
    -   패킷 손실 및 재전송 (Timeout, Fast Retransmit)
    -   Duplicate ACK 감지
    -   MSS 기반 패킷 분할

-   🚀 **Flow Control**

    -   Receiver Window (rwnd) 동적 관리
    -   Receiver 처리 속도 시뮬레이션
    -   Zero Window Probe

-   📈 **Congestion Control**

    -   Slow Start
    -   Congestion Avoidance
    -   Fast Recovery
    -   실시간 cwnd/ssthresh 시각화

-   ⚡ **시뮬레이션 속도 조절**
    -   INSTANT: 즉시 실행
    -   FAST: 10배속
    -   SLOW: 실시간

## 🎬 Demo

```bash
전송할 데이터 크기를 입력해주세요 (bytes): 10000
RTT를 입력해주세요 (ms): 100
패킷 손실 확률을 입력해주세요 (%): 10
시뮬레이션 모드를 선택해주세요.
1. BASIC
2. FLOW_CONTROL
3. CONGESTION_CONTROL
입력: 3

[3-way handshake 연결 시작]
[0ms] SYN → (seq=5234)
[50ms] ← SYN-ACK (ack=5235)
[100ms] ACK →
3-way handshake 연결 완료!

⚡️⚡️⚡️데이터 전송⚡️⚡️⚡️
전송할 전체 데이터의 크기: 10000 bytes (7 packets)

[100ms] 📦 Window 전송 시작 [SLOW_START]
          cwnd: 1460B (1 packets)
          ssthresh: ∞ (∞ packets)
          → Packet#1 ~ #1 (1 packets)
[100ms] Send: Packet#1 (seq#5235 - 6694) packet size: 1460 [cwnd: 1460B, SLOW_START]
[150ms] ← ACK 6695
[200ms] 📈 cwnd 업데이트: 1460B → 2920B (2 packets)
          [SLOW_START] ssthresh: ∞ (∞ packets)
...
```

## 🚀 설치

### 필요 조건

-   Node.js >= 20.17.0
-   npm >= 10.8.2

### 설치 방법

```bash
# 저장소 클론
git clone https://github.com/yourusername/tcp-simulator.git
cd tcp-simulator

# 의존성 설치
npm install

# 실행
npm start
```

## 📖 사용법

### 기본 실행

```bash
npm start
```

### 입력 파라미터

| 파라미터        | 설명                                      | 범위      | 예시  |
| --------------- | ----------------------------------------- | --------- | ----- |
| 데이터 크기     | 전송할 전체 데이터 크기 (bytes)           | 양의 정수 | 10000 |
| RTT             | Round Trip Time (ms)                      | 양수      | 100   |
| 패킷 손실 확률  | 패킷 손실 확률 (%)                        | 0-100     | 10    |
| 시뮬레이션 모드 | BASIC / FLOW_CONTROL / CONGESTION_CONTROL | 1-3       | 3     |
| 시뮬레이션 속도 | INSTANT / FAST / SLOW                     | 1-3       | 1     |

### Flow Control 추가 입력

-   **Receiver Window Size**: Receiver의 버퍼 크기 (packets)
-   **Receiver 처리 속도**: RTT당 처리할 수 있는 패킷 수 (packets/RTT)

### Congestion Control 추가 입력

-   **초기 cwnd**: 초기 Congestion Window 크기 (packets)

## 🎯 시뮬레이션 모드

### 1. BASIC Mode

기본적인 TCP 데이터 전송을 시뮬레이션합니다.

-   패킷 분할 및 전송
-   패킷 손실 감지
-   Timeout 재전송

### 2. FLOW_CONTROL Mode

Receiver의 처리 능력에 따른 흐름 제어를 시뮬레이션합니다.

-   Receiver Window (rwnd) 관리
-   Receiver 처리 속도 반영
-   Zero Window Probe
-   Fast Retransmit (3 Duplicate ACKs)

### 3. CONGESTION_CONTROL Mode

네트워크 혼잡 상황에 따른 전송률 조절을 시뮬레이션합니다.

-   **Slow Start**: cwnd를 지수적으로 증가
-   **Congestion Avoidance**: cwnd를 선형적으로 증가
-   **Fast Recovery**: 3 Duplicate ACKs 시 빠른 복구
-   **Timeout**: 타임아웃 발생 시 cwnd = 1 MSS로 초기화

#### 상태 전환

```
SLOW_START → (cwnd >= ssthresh) → CONGESTION_AVOIDANCE
             ↓ (3 Dup ACKs)
         FAST_RECOVERY → CONGESTION_AVOIDANCE
             ↓ (Timeout)
         SLOW_START
```

## 🏗️ 아키텍처

### 프로젝트 구조

```
tcp-simulator/
├── src/
│   ├── App.js                              # 메인 애플리케이션
│   ├── InputView.js                        # 사용자 입력 처리
│   ├── InputParser.js                      # 입력 검증 및 파싱
│   │
│   ├── BaseSimulator.js                    # 시뮬레이터 기본 클래스
│   ├── BasicSimulator.js                   # BASIC 모드
│   ├── FlowControlSimulator.js             # FLOW_CONTROL 모드
│   ├── CongestionControlSimulator.js       # CONGESTION_CONTROL 모드
│   │
│   ├── BaseOutputFormatter.js              # 출력 포매터 기본 클래스
│   ├── BasicOutputFormatter.js             # BASIC 모드 출력
│   ├── FlowControlOutputFormatter.js       # FLOW_CONTROL 모드 출력
│   ├── CongestionControlOutputFormatter.js # CONGESTION_CONTROL 모드 출력
│   │
│   ├── Event.js                            # 이벤트 클래스
│   ├── Timeline.js                         # 이벤트 타임라인
│   ├── Packet.js                           # 패킷 클래스
│   ├── PacketFragments.js                  # 패킷 분할 유틸
│   ├── RandomGenerator.js                  # 랜덤 생성 유틸
│   └── constants.js                        # 상수 정의
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci.yml
│
├── docs/
│   └── CONTRIBUTING.md                     # 기여 가이드
│
├── LICENSE
├── README.md
└── package.json
```

### 설계 패턴

-   **Strategy Pattern**: OutputFormatter 계층 구조
-   **Template Method Pattern**: BaseSimulator 상속 구조
-   **Event-Driven Architecture**: Timeline 기반 이벤트 처리

### 클래스 다이어그램

```
BaseSimulator
    ├── BasicSimulator
    ├── FlowControlSimulator
    └── CongestionControlSimulator

BaseOutputFormatter
    ├── BasicOutputFormatter
    ├── FlowControlOutputFormatter
    └── CongestionControlOutputFormatter
```

## 🤝 기여하기

기여는 언제나 환영합니다! 다음 방법으로 기여할 수 있습니다:

1. 🍴 Fork the Project
2. 🔨 Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. ✅ Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the Branch (`git push origin feature/AmazingFeature`)
5. 🎉 Open a Pull Request

자세한 내용은 [CONTRIBUTING.md](docs/CONTRIBUTING.md)를 참조해주세요.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조해주세요.

## 👨‍💻 만든 사람

**고제성** - [@kojesung](https://github.com/kojesung)

프로젝트 링크: [https://github.com/kojesung/tcp-simulator](https://github.com/yourusername/tcp-simulator)

---

<div align="center">

⭐️ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!

Made with by 고제성

</div>

## 2. **LICENSE** (MIT License)

```
MIT License

Copyright (c) 2025 고제성

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
