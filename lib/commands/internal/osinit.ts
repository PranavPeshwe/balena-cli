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

import Command from '../../command';
import { stripIndent } from '../../utils/lazy';
import { CommandHelp } from '../../utils/oclif-utils';

// 'Internal' commands are called during the execution of other commands.
// `osinit` is called during `os initialize`
// TODO: These should be refactored to modules/functions, and removed
// 	See previous `internal sudo` refactor:
//    - https://github.com/balena-io/balena-cli/pull/1455/files
//    - https://github.com/balena-io/balena-cli/pull/1455#discussion_r334308357
//    - https://github.com/balena-io/balena-cli/pull/1455#discussion_r334308526

interface ArgsDef {
	image: string;
	type: string;
	config: string;
}

export default class OsinitCmd extends Command {
	public static description = stripIndent`
		Do actual init of the device with the preconfigured os image.

		Don't use this command directly!
		Use \`balena os initialize <image>\` instead.
	`;

	public static args = [
		{
			name: 'image',
			required: true,
		},
		{
			name: 'type',
			required: true,
		},
		{
			name: 'config',
			required: true,
		},
	];

	public static usage = (
		'internal osinit ' +
		new CommandHelp({ args: OsinitCmd.args }).defaultUsage()
	).trim();

	public static hidden = true;
	public static root = true;
	public static offlineCompatible = true;

	public async run() {
		const { args: params } = this.parse<{}, ArgsDef>(OsinitCmd);

		const config = JSON.parse(params.config);

		const { getManifest, osProgressHandler } = await import(
			'../../utils/helpers'
		);
		const manifest = await getManifest(params.image, params.type);

		const { initialize } = await import('balena-device-init');
		const initializeEmitter = await initialize(params.image, manifest, config);
		await osProgressHandler(initializeEmitter);
	}
}
