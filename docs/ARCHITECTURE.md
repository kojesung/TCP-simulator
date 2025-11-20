# Architecture

## Core Components

### 1. Simulator Layer

```
BaseSimulator
    ├── BasicSimulator
    ├── FlowControlSimulator
    └── CongestionControlSimulator
```

**책임:**

-   패킷 전송 시뮬레이션
-   이벤트 생성 및 타임라인 관리
-   프로토콜별 로직 구현

### 2. Output Layer

```
BaseOutputFormatter
    ├── BasicOutputFormatter
    ├── FlowControlOutputFormatter
    └── CongestionControlOutputFormatter
```

**책임:**

-   이벤트를 사용자 친화적인 텍스트로 변환
-   모드별 전용 포매팅

### 3. Input Layer

-   `InputView`: 사용자 입력 받기
-   `InputParser`: 입력 검증 및 변환

### 4. Core Class

-   `Event`: 시뮬레이션 이벤트
-   `Packet`: TCP 패킷
-   `Timeline`: 이벤트 타임라인

## Event Flow

```
1. User Input
   ↓
2. Create Simulator
   ↓
3. planSimulation()
   - 모든 이벤트를 생성하고 timestamp 기반으로 정렬하여 시간 순서대로 확인할 수 있음
   ↓
4. run()
   - 모든 이벤트를 실행하고 Formatter를 통해 알맞은 형식의 출력 생성
   ↓
5. Display results
```

## Design Patterns

### Strategy Pattern

OutputFormatter 계층 구조로 출력 전략을 동적으로 변경

### Template Method Pattern

BaseSimulator에서 시뮬레이션 흐름 정의, 자식 클래스에서 세부 구현

### Event-Driven Model

모든 동작을 Event로 모델링하여 타임라인 기반 실행

## Extension Points

### 새로운 시뮬레이션 모드 추가

1. `BaseSimulator` 상속
2. `_sendPackets()` 구현
3. `BaseOutputFormatter` 상속
4. `format()` 메서드 오버라이드
5. `App.js`에서 모드 추가

### 새로운 이벤트 타입 추가

1. `constants.js`에 `EVENT_TYPE` 추가
2. Simulator에서 이벤트 생성
3. OutputFormatter에서 포매팅 추가
