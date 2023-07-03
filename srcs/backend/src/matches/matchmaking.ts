import { Mutex, tryAcquire } from "async-mutex"
import { Repository } from "typeorm";
import { MatchEntity } from "./match.entity";
import { HttpException } from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { UserEntity } from "src/users/user.entity";
import { gameRooms } from "src/gameSocket/game.gateway";
import { v4 as uuidv4 } from 'uuid';

interface QueuedUser {
    powerups: string[];
    id: string,
    score: number,
    mutex: Mutex,
    isFriendly: boolean
    matchId?: string,
    challenging?: string,
    delete?: boolean
}
  
// Queue class representing the user queue
export class MatchMaker {
    //private users: QueuedUser[]
    private usersAlt: Map<string, QueuedUser>
    constructor(
      private readonly matchesRepo: Repository<MatchEntity>,
      private readonly usersRepo: Repository<UserEntity>
    ) {
        this.usersAlt = new Map<string, QueuedUser>()
    }

    getCurrentMatch(userName: string): string {
      const user = this.usersAlt.get(userName)

      if (!user || !user.matchId)
        throw new HttpException("User currently not in a match", HttpStatusCode.NotFound)
      return user.matchId
    }

    cancel(userName: string): boolean {
      //console.log("canceling matchmaking for " + userName)
      const user = this.usersAlt.get(userName)
      if (user) {
        if (user.matchId){
          //console.log("cant cancel matchmaking when game is ongoing")
          return false
        }
        //console.log("deleting entry")
        this.usersAlt.delete(userName)
      }
      return true
    }

    cancelV2(userId: string) {
      const user = this.usersAlt.get(userId)
      if (user) {
        if (user.matchId){
          //console.log("cant cancel matchmaking when game is ongoing")
          throw new HttpException("Cant cancel matchmaking when game is ongoin", HttpStatusCode.Conflict)
        }
        //console.log("deleting entry")
        try {
          tryAcquire(user.mutex)
        } catch (error) {
          throw new HttpException("User matching right now, cant cancel", HttpStatusCode.Conflict)
        }
        //this.usersAlt.delete(userId)
        user.delete = true
        throw new HttpException("Canceled request processed succesfully", HttpStatusCode.Accepted)
      }
      throw new HttpException("User currently not in matchmaking", HttpStatusCode.NotFound)
    }

    async challenge(requesterName: string, opponentName: string, powerups: string[]): Promise<string> {
      let user = this.usersAlt.get(requesterName)
        if (!user) {
          user = this.usersAlt.set(requesterName, {
            id: requesterName,
            score: -424242,
            mutex: new Mutex(),
            isFriendly: false,
            powerups,
            challenging: opponentName
          }).get(requesterName)
          user.matchId = await this.createMatch(requesterName, opponentName, false, powerups, true)
          return user.matchId
        } else {
          throw new HttpException("requester already in matchmaking", HttpStatusCode.Conflict)
        }
    }

    lockPlayerFromChallenge(matchId: string, id: string, challenging: string): boolean {
      let user = this.usersAlt.get(id);
      if (!user) {
        user = this.usersAlt.set(id, {
          id,
          score: -424242,
          mutex: new Mutex(),
          isFriendly: true,
          powerups: ["N"], 
          challenging,
          matchId
        }).get(id)
      }
      return user.challenging === challenging
    }
    
    private async createMatch(userName: string, opponentName: string, isCompetitive: boolean, powerups: string[], isChallenge: boolean = false): Promise<string> {
      try {

          const user = await this.usersRepo.findOne({ where: { id: userName } })

          const opponent = await this.usersRepo.findOne({ where: { id: opponentName } })

          if (!user)
            throw new HttpException("Create match failed, user: " + userName + " not found", HttpStatusCode.NotFound)
          if (!opponent)
            throw new HttpException("Create match failed, opponent: " + opponentName + " not found", HttpStatusCode.NotFound)
          const id = uuidv4()
          //generate uuid
          const ballSpeed = powerups.includes("F") ? 4 : 2
          const paddleHeight = powerups.includes("S") ? 30 : 75
          gameRooms[id] = {
            id,
            gameStatus: "WAITING",
            numPlayers: 0,
            player1: {
              user: user.id,
              paddlePos: 115,
              paddleHeight,
              upPressed: false,
              downPressed: false,
              inGame: false,
              score: 0
            },
            player2: {
              user: opponent.id,
              paddlePos: 115,
              paddleHeight,
              upPressed: false,
              downPressed: false,
              inGame: false,
              score: 0
            },
            ballpos: { x: 250, y: 250, dx: ballSpeed, dy: ballSpeed },
            isCompetitive,
            isChallenge
          }
          return id
      } catch (error) {
          throw error
      }
  }

    public async makeMatch(userName: string, score: number, friendly: boolean, powerups: string[]): Promise<string> {
        console.log(`${userName} with score: ${score} started matchmaking...`)
        return this.checkForMatch(userName, score, friendly, powerups)
    }

    public matchEnded(user1: string, user2: string) {
        this.usersAlt.delete(user1)
        this.usersAlt.delete(user2)
    }
  
    private powerupsAreEquivalent(powerups1: string[], powerups2: string[]): boolean {
      if (powerups1.length != powerups2.length)
        return false
      return powerups1.every(p => powerups2.includes(p))
    }
  
    private async matchUsers(user: QueuedUser, otherUser: QueuedUser): Promise<string> {
        let oneMutexAquired = false;
        try {
            //console.log(`${user.id} attempting to match with ${otherUser.id}`)
          tryAcquire(user.mutex);
          //console.log(`${user.id} aquires its onw mutex`)
          oneMutexAquired = true;
          tryAcquire(otherUser.mutex);
          //console.log(`${user.id} aquires other user mutex`)
          //console.log("mathing users succeded Creating random uuid for room")
          
          const matchId = await this.createMatch(user.id, otherUser.id, !user.isFriendly, user.powerups)
        
          otherUser.matchId = matchId
          user.matchId = matchId
          ////console.log("mathighin returns " + matchId)
          return matchId;
        } catch (error) {
            if (oneMutexAquired) {
                //console.log("Match mutex already locked")
                user.mutex.release()
            } else {
                //console.log("User mutex already locked")
            }
        }
        //console.log("mathing users failed")
      }

      private async checkMatch(user: QueuedUser, threshold: number): Promise<string> {
        console.log("checknig para user: " + user.id)
        //console.log("matchId?: " + user.matchId)
        if (user.matchId){
            console.log("user already matched!!")
            return user.matchId
        }
        this.usersAlt.forEach((otherUser) => {
            console.log(`        [${user.id}] attempting to match with [${otherUser.id}]`)
            if (!otherUser.challenging && user.id !== otherUser.id && user.isFriendly === otherUser.isFriendly &&
              this.powerupsAreEquivalent(user.powerups, otherUser.powerups)) {
              if (user.isFriendly || Math.abs(user.score - otherUser.score) <= threshold)
                return this.matchUsers(user, otherUser);
            }
        })
        return null;
      }

      private async checkForMatch(id: string, score: number, isFriendly: boolean, powerups: string[]): Promise<string> {
        let user = this.usersAlt.get(id)
        if (!user) {
          user = this.usersAlt.set(id, {
            id,
            score,
            mutex: new Mutex(),
            isFriendly,
            powerups,
          }).get(id)
          if (user.matchId) {
            return user.matchId
          }
        }
        return this.checkForMatchLoop(user, 10);
      }

      private async checkForMatchLoop(user: QueuedUser, threshold: number): Promise<string> {
        let match = null
        do {
          match = await this.checkMatch(user, threshold);
          console.log("en verdad ha returneado: " + match)
          
          if (match) break ;
          
          if (user.delete) {
            console.log("intenta cancelar")
            this.cancel(user.id)
            throw new HttpException("Cant find a match right now, not enough players. Try againg later", HttpStatusCode.Accepted)
            //throw new HttpException("Matchmaking canceled", HttpStatusCode.Conflict)
          }
          threshold += 10
          if (threshold > 50) {
            let didCancel = false
            try {
              tryAcquire(user.mutex);
              this.cancel(user.id)
              didCancel = true
            } catch (error) {

            } 
            if (didCancel)
              throw new HttpException("Cant find a match right now, not enough players. Try againg later", HttpStatusCode.RequestTimeout)
          }

          await sleep(random(3000, 6000))
        } while (true);
        //console.log(`Match found! ${user.id} in room: ${match}`);
        return match
      }
  }

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
