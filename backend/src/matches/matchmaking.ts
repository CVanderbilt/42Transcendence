import { number, string } from "joi";
import { Mutex, tryAcquire } from "async-mutex"
import { match } from "assert";
import { randomUUID } from "crypto";

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
    constructor() {
        //this.users = [];
        this.usersAlt = new Map<string, QueuedUser>()
        this.ongoing = new Set<string>()
    }

    public async makeMatch(userName: string, score: number): Promise<string> {
        console.log(`${userName} with score: ${score} started matchmaking...`)
        return this.checkForMatch({
            id: userName,
            score: score,
            mutex: new Mutex()
        })
    }

    private ongoing: Set<string>
    public matchEnded(user1: string, user2: string) {
        this.usersAlt.delete(user1)
        this.usersAlt.delete(user2)
        //this.dequeue(user1)
        //this.dequeue(user2)
    }
  
    /*
    // Add a user to the queue
    private enqueue(user: QueuedUser) {
        this.users.push(user);
    }
  
    // Remove a user from the queue
    private dequeue(user: string) {
        const index = this.users.findIndex(u => u.id === user);
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }*/
  
    matchUsers(user: QueuedUser, otherUser: QueuedUser): string | undefined {
        let oneMutexAquired = false;
        try {
            console.log(`${user.id} attempting to match with ${otherUser.id}`)
          tryAcquire(user.mutex);
          console.log(`${user.id} aquires its onw mutex`)
          oneMutexAquired = true;
          tryAcquire(otherUser.mutex);
          console.log(`${user.id} aquires other user mutex`)
          console.log("mathing users succeded Creating random uuid for room")
          const uuid = randomUUID();
          user.matchId = uuid;
          otherUser.matchId = uuid;
          console.log("mathighin returns " + uuid)
          return uuid;
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
        console.log("es el foreach el problema?" + this.usersAlt.size)
        this.usersAlt.forEach((otherUser) => {
            console.log(`        [${user.id}] attempting to match with [${otherUser.id}]`)
            if (user.id !== otherUser.id && Math.abs(user.score - otherUser.score) <= threshold) {
                return this.matchUsers(user, otherUser);
            }
        })
        /*for (let i = 0; i < this.users.length; i++) {
          const otherUser = this.users[i];
          if (user.id !== this.users[i].id && Math.abs(user.score - otherUser.score) <= threshold) {
            return this.matchUsers(user, otherUser);
          }
        }*/
        return null;
      }

      async checkForMatch(user: QueuedUser): Promise<string> {
        const match = this.checkMatch(user, 15);
        if (match) {
          console.log(`Match found! ${user.id} in room: ${match}`);
          // add to both users a gameRoomId generated UUID to avoid collisions
          //this.dequeue(user);
          return match;
        } else {
          console.log(`No match found for ${user.id}. Checking again...`);
    
          //this.enqueue(user);
          console.log("ENQUEING: " + this.usersAlt.size)
          console.log(user.id)
          this.usersAlt.set(user.id, user) 
          console.log("ENQUEUED: " + this.usersAlt.size)
    
          const scoreThreshold = 25;
    
          //setTimeout(() => {
            await sleep(5000);
            return this.checkForMatchRec(user, scoreThreshold);
          //}, 5000); //todo: hacer el tiempo de espera random dentro de un rango para evitar que se sincronicen todos o algo ?
    
          console.log(`First retry with a wider threshold (score difference: <= ${scoreThreshold})`);
        }
      }

      //todo: arreglar lo de que usuarios desconectados que vuelvan a meterse en el matchmaking se metan automaticamente en esta partida
      //    en teoría tendría que funcionar porq el usuario ya está en el mapa con la roomId correcta pero no
      //todo: hacer que no se fíe del nombre del usuario (esto en verdad va en gamegateway) en vez de eso espera recibir un token válido con el nombre del usuario (el de 2fa no vale)
      //todo: revisar porq pasa que a veces un usuario entra en la habitación y juega mientras que el otro no. Creo que pasa cuando o pasa mucho tiemp en matchmaking
      //    o ha entrado dos veces el mismo usuario en matchmaking, cuando arreglemos el primer todo esto lo mismo se arregla solo 
      //todo: al parecer crea varios matches que luego no usa, revisar porq (en gamegateway revisar como llamos a create match)
      async checkForMatchRec(user: QueuedUser, threshold: number): Promise<string> {
        const match = this.checkMatch(user, threshold);
        console.log("en verdad ha returneado: " + match)
        if (match) {
          console.log(`Match found! ${user.id} in room: ${match}`);
          //this.dequeue(user);
          return match
        } else {
          console.log(`No match found for ${user.id}. Checking again... (${threshold})`);
    

          await sleep(5000)
            return this.checkForMatchRec(user, threshold + 10);
    
          console.log(`Retrying with a wider threshold (score difference: <= ${threshold + 10})`);
        }
      }
  }

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
