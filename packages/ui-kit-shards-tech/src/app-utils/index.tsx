export const shortAddress = (address: string) => {
	if (typeof address !== 'string' || address.length < 10) {
		return address;
	}
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function parseGuildConfig(rewardShareForMember: number, guildOwnerShare: number) {
	const sharePercent = 1 - rewardShareForMember;
	const guildOwnerPercent = guildOwnerShare * rewardShareForMember;
	const memberPercent = rewardShareForMember - guildOwnerPercent;

	return {
		sharePercent,
		guildOwnerPercent,
		memberPercent,
	};
}

export function calcGuildConfig(memberPercent: number, guildOwnerPercent: number) {
	const txGuildOwnerShare = 0.9;
	const rewardShareForMember = memberPercent + guildOwnerPercent;
	const guildOwnerShare = guildOwnerPercent / rewardShareForMember;

	return {
		txGuildOwnerShare,
		rewardShareForMember,
		guildOwnerShare,
	};
}
