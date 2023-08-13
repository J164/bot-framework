import { type ScheduledTask, schedule } from 'node-cron';
import { fetchCollection } from '../database.js';
import { type TaskContext, type BotClient, type Task } from '../bot-client.js';

export function onReady(this: BotClient, taskHandlers: Task[]): void {
	for (const { cronExpression, handler, scheduleOptions } of taskHandlers) {
		const info: Omit<TaskContext, 'task'> & { task?: ScheduledTask } = { fetchCollection };
		info.task = schedule(cronExpression, handler.bind(info as TaskContext), scheduleOptions);
	}

	this.logger.info('Login success!');
}
