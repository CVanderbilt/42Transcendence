import { throwFromAsync } from "@/utils/utils";
import { apiClient } from "./baseApi";
import { getUserByName } from "./user";

const URL = "/chats";

export interface Member {
    id: string,
    username: string,
}

export interface ChatMessage {
    senderId?: string,
    senderName?: string,
    chatRoomId: string,
    content: string,
    isChallenge?: boolean,
}

export interface ChatRoom {
    id: string,
    name: string,
    password?: string,
    isDirect?: boolean,
    isPrivate?: boolean,
}

export interface Membership {
    id: string
    user: Member
    isOwner?: boolean
    isAdmin: boolean
    isBanned?: boolean
    isMuted?: boolean
    chatRoomName?: string
    userName?: string
    chatRoom: ChatRoom
    bannedUntil?: any
    mutedUntil?: any
}

// ----------------------------------------------

export async function getAllChatRoomsReq() {
    return (await apiClient.get(`${URL}/rooms`)).data
}

export async function createChatRoomReq(roomName: string, owner: string, password?: string) {
    if (password == "") password = undefined
    const room: any = {
        name: roomName,
        password: password
    }

    return apiClient.post(`${URL}/rooms`, room)
}

export async function updateChatRoomPasswordReq(roomId: string, password: string) {
    return apiClient.post(`${URL}/rooms/${roomId}/password`, { password: password })
}

export async function getChatRoomByNameReq(name: string) {
    return apiClient.get(`${URL}/rooms/name/${name}`)
}

export async function getChatRoomMessagesReq(roomId: string) {
    return apiClient.get(`${URL}/messages/${roomId}`)
}

export async function joinChatRoomReq(roomId: string, userId: string, password?: string) {
    return apiClient.post(`${URL}/rooms/${roomId}/join`, { userId, password: password === "" ? undefined : password })
}

export async function inviteUsersReq(roomID: string, userId: string) {
    return apiClient.post(`${URL}/rooms/${roomID}/invite`, { userId })
}

export async function postChatMessageReq(roomId: string, message: {
    senderId: string,
    content: string,
    isChallenge?: boolean
}) {
    return apiClient.post(`${URL}/messages/${roomId}`, message)
}

export async function deleteChatRoom(roomId: string) {
    return apiClient.delete(`${URL}/rooms/${roomId}`)
}

// memberships
export async function getUserMembershipsReq(userId: string) {
    return (await apiClient.get(`${URL}/memberships/user/${userId}`))
}

export async function getChatRoomMembershipsReq(roomId: string) {
    return apiClient.get(`${URL}/rooms/${roomId}/members`)
}

//todo tocontinue -> dambiar data: Membership a solo lo q necesitamos, same en backend, empezar backend
export async function updateChatRoomMembershipsReq(membershipId: string, data: {
    isBanned?: boolean,
    isMuted?: boolean,
    isAdmin?: boolean,
    bannedUntil?: Date,
    mutedUntil?: Date
}) {
    alert("calling with: " + JSON.stringify(data))
    return apiClient.put(`${URL}/memberships/${membershipId}`, data)
}

export async function deleteChatRoomMembershipsReq(membershipId: string) {
    return apiClient.delete(`${URL}/memberships/${membershipId}`)
}

export async function banUserFromChat(userName: string, roomId: string) {
    const userId = await (await getUserByName(userName)).data.id
    return apiClient.post(`${URL}/memberships/ban`, { userId, roomId })
}

export async function allowUserFromChat(userName: string, roomId: string) {
    const userId = await (await getUserByName(userName)).data.id
    return apiClient.post(`${URL}/memberships/allow`, { userId, roomId })
}

export async function promoteUserInChat(userName: string, roomId: string) {
    const userId = await (await getUserByName(userName)).data.id
    return apiClient.post(`${URL}/memberships/promote`, { userId, roomId })
}

export async function demoteUserInChat(userName: string, roomId: string) {
    const userId = await (await getUserByName(userName)).data.id
    return apiClient.post(`${URL}/memberships/demote`, { userId, roomId })
}

export async function getDirectChatRoomReq(user1: string, user2: string) {
    return apiClient.post(`${URL}/rooms/direct`, { user1, user2 })
}

export async function getChatRoomByIdReq(id: string) {
    return apiClient.get(`${URL}/rooms/${id}`)
}

export async function getGeneralRoom() {
    return apiClient.get(`${URL}/rooms/general`)
}