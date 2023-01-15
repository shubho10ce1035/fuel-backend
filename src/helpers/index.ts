import { redisConnect } from '../../deps.ts';
  
const redisClient = await redisConnect({
 hostname: '127.0.0.1',
 port: '6379'
});

console.log(await redisClient.ping());

export { redisClient };