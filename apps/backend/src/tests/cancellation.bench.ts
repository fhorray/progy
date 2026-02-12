
const NUM_SUBS = 5;
const LATENCY_MS = 100;

async function cancelSubscriptionSequential(subIds: string[]) {
    for (const id of subIds) {
        await fakeCancel(id);
    }
}

async function cancelSubscriptionParallel(subIds: string[]) {
    await Promise.all(subIds.map(id => fakeCancel(id)));
}

async function fakeCancel(id: string) {
    // Simulate API latency
    return new Promise(resolve => setTimeout(resolve, LATENCY_MS));
}

async function runBenchmark() {
    const subIds = Array.from({ length: NUM_SUBS }, (_, i) => `sub_${i}`);

    console.log(`--- Running benchmark with ${NUM_SUBS} subscriptions and ${LATENCY_MS}ms latency ---`);

    const startSeq = performance.now();
    await cancelSubscriptionSequential(subIds);
    const endSeq = performance.now();
    const durationSeq = endSeq - startSeq;
    console.log(`Sequential: ${durationSeq.toFixed(2)}ms`);

    const startPar = performance.now();
    await cancelSubscriptionParallel(subIds);
    const endPar = performance.now();
    const durationPar = endPar - startPar;
    console.log(`Parallel: ${durationPar.toFixed(2)}ms`);

    const improvement = ((durationSeq - durationPar) / durationSeq) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}%`);
}

runBenchmark().catch(console.error);
