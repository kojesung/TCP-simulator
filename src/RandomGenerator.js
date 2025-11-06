class RandomGenerator {
    static isPacketLost(lossRate) {
        return Math.floor(Math.random() * 101) < lossRate;
    }
}

export default RandomGenerator;
