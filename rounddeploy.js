import {opendeploy} from 'opendeploy.js';
import {list_servers, show_opened_servers} from 'opened_servers.js';

/** @param {NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false]]);

	if (args.help || args._.length < 1) {
		ns.tprint("This script re-runs opendeploy periodically based on threads/timings");
		ns.tprint(`Usage: run ${ns.getScriptName()} SCRIPT ARGUMENTS`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} basic_hack.js nontargetargs`);
		return;
	}
	const script = ns.args[0];
	const script_args =[];
	if (ns.args.length > 1) script_args = ns.args.slice(1);
	// ns.disableLog("ALL");
	var servers, topserver;
	while (true) {
		const s = await opendeploy(ns, script, script_args);
		const d = new Date().toLocaleString();
		// const t = s.weaken.time * 20;
		const r = ns.getServerUsedRam("home");
		ns.print(d + `: Attacking ${s.host}(${ns.serverExists(s.host)?"exists":"404!"}). homeRam:${r}.`);
		await ns.sleep(180000);
		do {
			await ns.sleep(60000);
			servers = list_servers(ns).filter(s => ns.hasRootAccess(s.host)); //.concat(['home']);
			show_opened_servers(ns, servers);
			topserver = Object.assign({}, servers[0]);
		} while (s.host !== topserver.host );
	}
}