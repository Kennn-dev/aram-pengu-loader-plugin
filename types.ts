interface Summoner {
  accountId: string;
  displayName: string;
  gameName: string;
  internalName: string;
  nameChangeFlag: false;
  percentCompleteForNextLevel: number;
  privacy: string;
  profileIconId: number;
  puuid: string;
  rerollPoints: {
    currentPoints: 500;
    maxRolls: 2;
    numberOfRolls: 2;
    pointsCostToRoll: 250;
    pointsToReroll: 0;
  };
  summonerId: number;
  summonerLevel: number;
  tagLine: string;
  unnamed: false;
  xpSinceLastLevel: number;
  xpUntilNextLevel: number;
}
