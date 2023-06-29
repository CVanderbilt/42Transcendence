<template>
    <div class="container">
        <h1>QR Validation Page</h1>
        <p>Please scan the QR code with your authenticator app:</p>

        <div>
            <img :src="qrCodeUrl" alt="QR code" />
        </div>

        <div ref="qrcode"></div>
        <form @submit.prevent="submitCode">
            <div class="form-group">
                <label for="code">Enter the code from your app:</label>
                <input type="text" class="form-control" id="code" v-model="code" />
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </div>
</template>

<script lang="ts">

import { apiClient } from '@/api/baseApi';
import { ENABLE_2FA_ENDPOINT, QR_ENDPOINT } from '@/config';
import { app } from '@/main';
import { key, store } from '@/store/store';
import { handleHttpException, publishNotification } from '@/utils/utils';
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';


export default defineComponent({
    name: "qr",
    setup() {
        const store = useStore(key);
        const user = computed(() => store.state.user);

        return {
            user,
        };
    },

    data() {
        return {
            qrCodeUrl: '',
            code: ''
        }
    },
    mounted() {

        this.getQRCode();

    },
    methods: {
        async getQRCode() {
            try {
                console.log('Getting QR code');
                const response = await apiClient.get(QR_ENDPOINT, { responseType: 'blob' });
                const qrCodeUrl = URL.createObjectURL(response.data);
                this.qrCodeUrl = qrCodeUrl;
                console.log('QR code URL: ' + qrCodeUrl);
            }
            catch (error) {
                handleHttpException(app, error);
            }
        },

        async submitCode() {
            //Validate the user's code and redirect them to the appropriate page

            try {
                const response = await (await apiClient.post(ENABLE_2FA_ENDPOINT + "/" + this.code));
                if (response.status === 200) {
                    store.commit('set2fa', true);
                    this.$router.push('/');
                }
            }
            catch (error) {
                handleHttpException(app, error);
                // publishNotification('Invalid code, please try again.', true);
            }
        }
    }
});

</script>
  
<style>
.container {
    margin-top: 50px;
    text-align: center;
}
</style>
  