import { type ScheduledTask, schedule } from 'node-cron';
import { type CollectionFetcher, fetchCollection } from '../database.js';
import { type BotClient, type Task } from '../bot-client.js';

export type HandlerContext = { task: ScheduledTask; fetchCollection: CollectionFetcher };

export function onReady(this: BotClient, taskHandlers: Task[]): void {
	for (const { cronExpression, handler, scheduleOptions } of taskHandlers) {
		const info: Omit<HandlerContext, 'task'> & { task?: ScheduledTask } = { fetchCollection };
		info.task = schedule(cronExpression, handler.bind(info as HandlerContext), scheduleOptions);
	}

	this.logger.info('Login success!');
}
