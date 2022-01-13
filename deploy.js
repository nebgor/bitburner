/** @param {NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false]]);
	if (args.help || args._.length < 2) {
		ns.tprint("This script deploys another script on a server with maximum threads possible.");
		ns.tprint(`Usage: run ${ns.getScriptName()} HOST SCRIPT TARGET OPTIONAL_ARGUMENTS`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} n00dles basic_hack.js foodnstuff otherargs`);
		return;
	}
	ns.tprint(ns.args);
	const host = ns.args[0];
	const script = ns.args[1];
	const target = ns.args[2];
	
	var script_args = [];
	if (ns.args.length>3) script_args = ns.args.slice(3);

	if (!ns.serverExists(host)) {
		ns.tprint(`Server '${host}' does not exist. Aborting.`);
		return;
	}
	if (!ns.serverExists(target)) {
		ns.tprint(`Server target '${target}' does not exist. Aborting.`);
		return;
	}
	if (!ns.ls(ns.getHostname()).find(f => f === script)) {
		ns.tprint(`Script '${script}' does not exist. Aborting.`);
		return;
	}

	await deploy_threads(ns, host, script, target, script_args);
}

export async function deploy_threads(ns, host, script, target, script_args=[], threads = 0) {
	const maxthreads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script));
	if (threads == 0 || threads > maxthreads) threads = maxthreads;
	if (threads == 0 || threads == Infinity ) threads = 1;
	ns.tprint(`Launching script '${script}' on server '${host}' target:${target} with ${threads} threads and extra arguments: ${script_args}`);
	await ns.scp(script, ns.getHostname(), host);
	const pid = ns.exec(script, host, threads, target, ...script_args);
	return pid>0?threads:0;
}