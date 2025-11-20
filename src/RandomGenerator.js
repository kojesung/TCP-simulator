class RandomGenerator {
    static isPacketLost(lossRate) {
        return Math.floor(Math.random() * 100) < lossRate;
    }
}

export default RandomGenerator;
