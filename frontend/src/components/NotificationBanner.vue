<template>
  <div v-if="showBanner" :class="{ 'notification-banner': true, 'error': isError }">
    {{ message }}
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { store } from '@/store/store';
import { stateSocketIO } from '@/main';
import { UserStateSocket } from '@/utils/types';

export default defineComponent({
  name: 'NotificationBanner',

  data() {
    return {
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
