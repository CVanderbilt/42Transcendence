<template>
  <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit" v-on:click="openChat">
    Chat
  </button>
</template>
  
<script lang="ts">
import { getDirectChatRoomReq } from "@/api/chatApi"
import { app } from "@/main";
import { handleHttpException, throwFromAsync } from "@/utils/utils";
import { defineComponent } from "vue"

export default defineComponent({
  name: "OpenDirectChatButton",
  props: ['friendId', 'userId'],

  methods: {
    async openChat() {
      // Search if chat already exists
      try {   
        const chatRoom = await (await getDirectChatRoomReq(this.userId, this.friendId)).data
        this.$router.push("/chats?roomId=" + chatRoom.id);
      } catch (error: any) {
        handleHttpException(app, error)
      }
    },
  }
})
</script>