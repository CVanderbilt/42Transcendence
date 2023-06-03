<template>
  <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit" v-on:click="openChat">
    Chat
  </button>
</template>
  
<script lang="ts">
import { getDirectChatRoomReq } from "@/api/chatApi"
import { defineComponent } from "vue"

export default defineComponent({
  name: "OpenDirectChatButton",
  props: ['friendId', 'userId'],

  methods: {
    async openChat() {
      console.log(this.userId)
      console.log(this.friendId)
      // Search if chat already exists
      const chatRoom = await (await getDirectChatRoomReq(this.userId, this.friendId)).data
      this.$router.push("/chats?name=" + chatRoom.name);
    },
  }
})
</script>