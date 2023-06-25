<template>
  <div v-if="showBanner" :class="{ 'notification-banner': true, 'error': isError }">
    {{ message }}
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { store } from '@/store/store';
import { stateSocketIO } from '@/main';

interface UserState {
  userId: string;
  state: string;
}

export default defineComponent({
  name: 'NotificationBanner',

  data() {
    const io = stateSocketIO()

    return {
      io,
      showBanner: false,
      message: '',
      isError: false,
    };
  },
  mounted() {
    store.watch(
      (state) => state.notification,
      (notification) => {
        this.showMessage(notification);
      }
    );

    this.io.socket.on("user_state_updated", (state: UserState) => {
      if (state.userId == store.state.user.id && state.state == "offline")
        this.io.socket.emit("user_state_updated", {userId: store.state.user.id, state:"online"});
    });

  },
  methods: {
    showMessage(notification: { message: string, isError: boolean }) {
      this.message = notification.message;
      this.isError = notification.isError;
      this.showBanner = true;
      setTimeout(() => {
        this.showBanner = false;
      }, 3000);
    },
  },
});
</script>

<style>
.notification-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background-color: green;
  color: white;
  text-align: center;
}

.notification-banner.error {
  background-color: red;
}
</style>
