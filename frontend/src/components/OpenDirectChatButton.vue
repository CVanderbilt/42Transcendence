<template>
    <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit" v-on:click="openChat">
      {{ buttonText }}
    </button>
  </template>
  
<script lang="ts">
  import { createChatRoomReq, inviteUsersReq } from "@/api/chatApi"
    import { defineComponent } from "vue"
    import { useStore } from "vuex"
    import { store, key } from "@/store/store";
    
    
  export default defineComponent({
    name: "OpenDirectChatButton",
    props: ['buttonText', 'friendName', 'friendId', 'user'],

    setup() {
    const store = useStore(key);
    const user = store.state.user;
    return {
      user,
    };
  },

    methods: {
      async openChat() {
      const names: string[] = [];
      names.push(this.user?.username as string);
      names.push(this.friendName);
      names.sort();

      const chatRoomName =
        names[0] + "-" + names[1];

      const UUID = this.user?.id as string;

      console.log(chatRoomName)

      let room;
      try {
        room = (await createChatRoomReq(chatRoomName, UUID, "", true)).data
      } catch (err) {
        alert("Direct chat could not be created");
        console.log(err)
        return
      }
      try {
        const res = await inviteUsersReq(room.id, this.friendId)
        console.log(res)
      } catch (err) {
        alert("User could not be invited to chat");
        console.log(err)
        return
      }

      this.$router.push("/chats?name=" + chatRoomName);
    },
    }
  })
  </script>