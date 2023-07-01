<template>
  <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit" v-on:click="openChat">
    Chat
  </button>
</template>
  
<script lang="ts">
import { getDirectChatRoomReq } from "@/api/chatApi"
import { app, chatSocketIO, useSocketIO } from "@/main";
import { handleHttpException } from "@/utils/utils";
import { defineComponent } from "vue"

export default defineComponent({
  name: "OpenDirectChatButton",
  props: ['friendId', 'userId'],

  setup() {
    const ioChats = useSocketIO()
    return {
      ioChats: ioChats,
    }
  },

  mounted() {
          // join chat socket
    // this.ioChats.socket.offAny();
  },
  methods: {

    async openChat() {
      // Search if chat already exists
      try {
        const chatRoom = await (await getDirectChatRoomReq(this.userId, this.friendId)).data
        //wait for 1 sec
        await new Promise(r => setTimeout(r, 500));
        this.ioChats.socket.emit("chat_update");
        this.$router.push("/chats?roomId=" + chatRoom.id);
      } catch (error: any) {
        handleHttpException(app, error)
      }
    },
  }
})
</script>