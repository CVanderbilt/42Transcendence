import { number, string } from "joi";
import { Mutex, tryAcquire } from "async-mutex"
import { match } from "assert";
import { randomUUID } from "crypto";
import { Repository } from "typeorm";
import { MatchEntity } from "./match.entity";
import { HttpException } from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { UserEntity } from "src/users/user.entity";

interface QueuedUser {
    id: string,
    score: number,
    mutex: Mutex,
    matchId?: string,
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

    async createCompetitiveMatch(userName: string, opponentName: string): Promise<string> {
      try {
          console.log("creating competitive match")
          console.log(`contestants: (${userName} and ${opponentName})`)
          console.log("usersRepo: " + this.usersRepo)
          console.log("matchesRepo: " + this.matchesRepo)
          const user = await this.usersRepo.findOne({ where: { username: userName } })
          console.log("user: " + user)
          const opponent = await this.usersRepo.findOne({ where: { username: opponentName } })
          console.log("opponent: " + opponent)
          return (await this.matchesRepo.save({
              user: user,
              opponent: opponent,
              type: "competitive",
              powerups: "",
              state: "Full"
          })).id
      } catch (error) {
          console.log("!!!!!!!!ERROR AQUI!!!!!!!!")
          console.log(error)
      }
  }

    public async makeMatch(userName: string, score: number): Promise<string> {
        console.log(`${userName} with score: ${score} started matchmaking...`)
        return this.checkForMatch(userName, score)
    }

    public matchEnded(user1: string, user2: string) {
        this.usersAlt.delete(user1)
        this.usersAlt.delete(user2)
    }
  
    async matchUsers(user: QueuedUser, otherUser: QueuedUser): Promise<string> {
        let oneMutexAquired = false;
        try {
            console.log(`${user.id} attempting to match with ${otherUser.id}`)
          tryAcquire(user.mutex);
          console.log(`${user.id} aquires its onw mutex`)
          oneMutexAquired = true;
          tryAcquire(otherUser.mutex);
          console.log(`${user.id} aquires other user mutex`)
          console.log("mathing users succeded Creating random uuid for room")
          
          const matchId = await this.createCompetitiveMatch(user.id, otherUser.id)
        
          otherUser.matchId = matchId
          user.matchId = matchId
          console.log("mathighin returns " + matchId)
          return matchId;
        } catch (error) {
            if (oneMutexAquired) {
                console.log("Match mutex already locked")
                user.mutex.release()
            } else {
                console.log("User mutex already locked")
            }
        }
        console.log("mathing users failed")
      }
    
      checkMatch(user: QueuedUser, threshold: number): string {
        console.log("checknig para user: " + user.id)
        console.log("matchId?: " + user.matchId)
        if (user.matchId){
            console.log("user already matched!!")
            return user.matchId
        }
        this.usersAlt.forEach((otherUser) => {
            console.log(`        [${user.id}] attempting to match with [${otherUser.id}]`)
            if (user.id !== otherUser.id && Math.abs(user.score - otherUser.score) <= threshold) {
                return this.matchUsers(user, otherUser);
            }
        })
        return null;
      }

      async checkForMatch(id: string, score: number): Promise<string> {
        // crear o encontrar usuario
        let user = this.usersAlt.get(id)
        if (!user) {
          user = this.usersAlt.set(id, {
            id,
            score,
            mutex: new Mutex()
          }).get(id)
          if (user.matchId) {
            console.log(`user currently in a match with id: ${user.matchId}`)
            //todo: mecanismo de seguridad por si fuera un match antiguo no borrado -> ex:
            //    si el match tiene más de x(5?) mins de antigüedad borrarlo(el user del mapa de matchmaking) y hacer matchmaking normal
            return user.matchId
          }
        }
        return this.checkForMatchLoop(user, 10);
      }
      /*
      async checkForMatch(user: QueuedUser): Promise<string> {
        const match = this.checkMatch(user, 15);
        if (match) {
          console.log(`Match found! ${user.id} in room: ${match}`);
          return match;
        } else {
          console.log(`No match found for ${user.id}. Checking again...`);
    
          console.log("ENQUEING: " + this.usersAlt.size)
          console.log(user.id)
          this.usersAlt.set(user.id, user) 
          console.log("ENQUEUED: " + this.usersAlt.size)
    
          const scoreThreshold = 25;
    
          await sleep(5000);
          return this.checkForMatchRec(user, scoreThreshold);
        }
      }
      */

      //todo: arreglar lo de que usuarios desconectados que vuelvan a meterse en el matchmaking se metan automaticamente en esta partida
      //    en teoría tendría que funcionar porq el usuario ya está en el mapa con la roomId correcta pero no
      //todo: hacer que no se fíe del nombre del usuario (esto en verdad va en gamegateway) en vez de eso espera recibir un token válido con el nombre del usuario (el de 2fa no vale)
      //todo: revisar porq pasa que a veces un usuario entra en la habitación y juega mientras que el otro no. Creo que pasa cuando o pasa mucho tiemp en matchmaking
      //    o ha entrado dos veces el mismo usuario en matchmaking, cuando arreglemos el primer todo esto lo mismo se arregla solo 
      //todo: al parecer crea varios matches que luego no usa, revisar porq (en gamegateway revisar como llamos a create match)
      async checkForMatchLoop(user: QueuedUser, threshold: number): Promise<string> {
        let match = null
        do {
          match = this.checkMatch(user, threshold);
          console.log("en verdad ha returneado: " + match)
          
          if (match) break ;
          
          threshold += 10
          if (threshold > 500) throw new HttpException("Cant find a match right now, not enough players. Try againg later", HttpStatusCode.RequestTimeout)
          console.log(`No match found for ${user.id}. Checking again... (${threshold})`);
          await sleep(random(3000, 6000))
        } while (true);
        console.log(`Match found! ${user.id} in room: ${match}`);
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
