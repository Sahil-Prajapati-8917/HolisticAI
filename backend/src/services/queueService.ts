import Queue from 'bull';
import Redis from 'ioredis';
import { processResumeParseJob, processEvaluationJob } from './jobProcessors';

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
});

// Create queues
const resumeParseQueue = new Queue('resume parsing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

const evaluationQueue = new Queue('evaluation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

const emailQueue = new Queue('email notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Process jobs
resumeParseQueue.process('parse-resume', 5, processResumeParseJob);
evaluationQueue.process('evaluate-resume', 3, processEvaluationJob);

// Queue job functions
export const queueResumeParseJob = async (resumeId: string) => {
  await resumeParseQueue.add('parse-resume', { resumeId }, {
    priority: 10,
    delay: 1000, // Small delay to ensure file is fully written
  });
};

export const queueEvaluationJob = async (evaluationData: any) => {
  await evaluationQueue.add('evaluate-resume', evaluationData, {
    priority: 5,
  });
};

export const queueEmailJob = async (emailData: any) => {
  await emailQueue.add('send-email', emailData, {
    priority: 1,
    delay: 1000,
  });
};

// Queue monitoring functions
export const getQueueStats = async () => {
  const [parseWaiting, parseActive, parseCompleted, parseFailed] = await Promise.all([
    resumeParseQueue.getWaiting(),
    resumeParseQueue.getActive(),
    resumeParseQueue.getCompleted(),
    resumeParseQueue.getFailed(),
  ]);

  const [evalWaiting, evalActive, evalCompleted, evalFailed] = await Promise.all([
    evaluationQueue.getWaiting(),
    evaluationQueue.getActive(),
    evaluationQueue.getCompleted(),
    evaluationQueue.getFailed(),
  ]);

  return {
    resumeParse: {
      waiting: parseWaiting.length,
      active: parseActive.length,
      completed: parseCompleted.length,
      failed: parseFailed.length,
    },
    evaluation: {
      waiting: evalWaiting.length,
      active: evalActive.length,
      completed: evalCompleted.length,
      failed: evalFailed.length,
    },
  };
};

export const getFailedJobs = async (queueType: 'resumeParse' | 'evaluation') => {
  const queue = queueType === 'resumeParse' ? resumeParseQueue : evaluationQueue;
  return await queue.getFailed();
};

export const retryFailedJob = async (queueType: 'resumeParse' | 'evaluation', jobId: string) => {
  const queue = queueType === 'resumeParse' ? resumeParseQueue : evaluationQueue;
  const job = await queue.getJob(jobId);
  if (job) {
    await job.retry();
    return true;
  }
  return false;
};

// Clean up on process shutdown
process.on('SIGTERM', async () => {
  await resumeParseQueue.close();
  await evaluationQueue.close();
  await emailQueue.close();
  await redis.quit();
});

process.on('SIGINT', async () => {
  await resumeParseQueue.close();
  await evaluationQueue.close();
  await emailQueue.close();
  await redis.quit();
});

export { resumeParseQueue, evaluationQueue, emailQueue };