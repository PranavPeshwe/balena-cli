/**
 * @license
 * Copyright 2016-2020 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { flags } from '@oclif/command';

import Command from '../../command';
import * as cf from '../../utils/common-flags';
import * as ca from '../../utils/common-args';
import { getBalenaSdk, stripIndent } from '../../utils/lazy';
import { applicationIdInfo } from '../../utils/messages';

interface FlagsDef {
	help: void;
}

interface ArgsDef {
	fleet: string;
}

export default class FleetPurgeCmd extends Command {
	public static description = stripIndent`
		Purge data from a fleet.

		Purge data from all devices belonging to a fleet.
		This will clear the fleet's '/data' directory.

		${applicationIdInfo.split('\n').join('\n\t\t')}
	`;

	public static examples = [
		'$ balena fleet purge MyFleet',
		'$ balena fleet purge myorg/myfleet',
	];

	public static args = [ca.fleetRequired];

	public static usage = 'fleet purge <fleet>';

	public static flags: flags.Input<FlagsDef> = {
		help: cf.help,
	};

	public static authenticated = true;

	public async run() {
		const { args: params } = this.parse<FlagsDef, ArgsDef>(FleetPurgeCmd);

		const { getApplication } = await import('../../utils/sdk');

		const balena = getBalenaSdk();

		// balena.models.application.purge only accepts a numeric id
		// so we must first fetch the app to get it's id,
		const application = await getApplication(balena, params.fleet);

		try {
			await balena.models.application.purge(application.id);
		} catch (e) {
			if (e.message.toLowerCase().includes('no online device(s) found')) {
				// application.purge throws an error if no devices are online
				// ignore in this case.
			} else {
				throw e;
			}
		}
	}
}
